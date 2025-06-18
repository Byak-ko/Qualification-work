import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { Repository } from 'typeorm';
import { User, UserRole, Degree, Position } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import { UnitType } from '../entities/unit.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailService } from '../mail/mail.service';
import { NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';

jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({ toString: jest.fn().mockReturnValue('randompass') }),
}));

describe('UsersController (Unit)', () => {
  let usersController: UsersController;
  let userService: UserService;

  let mockUserRepository: jest.Mocked<Repository<User>>;
  let mockDepartmentRepository: jest.Mocked<Repository<Department>>;
  let mockMailService: jest.Mocked<MailService>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.TEACHER,
    degree: Degree.NONE,
    position: Position.LECTURER,
    isAuthor: true,
    department: { id: 1, name: 'Test Department', users: [], unit: { id: 1, name: 'Test Unit', type: UnitType.FACULTY, departments: [] } },
    ratingsAuthor: [],
    ratingParticipations: [],
    ratingsToReview: [],
    givenApprovals: [],
    responses: [],
  };

  const mockDepartment: Department = {
    id: 1,
    name: 'Test Department',
    users: [],
    unit: { id: 1, name: 'Test Unit', type: UnitType.FACULTY, departments: [] },
  };

  const createMockRequest = (user?: any): Request => {
    return { user: user || { id: 1, role: UserRole.TEACHER } } as Request;
  };

  beforeEach(async () => {
    mockUserRepository = {
      find: jest.fn().mockResolvedValue([mockUser]),
      findOne: jest.fn().mockResolvedValue(mockUser),
      create: jest.fn().mockReturnValue(mockUser),
      save: jest.fn().mockResolvedValue(mockUser),
      remove: jest.fn().mockResolvedValue(mockUser),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockUser]),
      }),
    } as unknown as jest.Mocked<Repository<User>>;

    mockDepartmentRepository = {
      findOne: jest.fn().mockResolvedValue(mockDepartment),
    } as unknown as jest.Mocked<Repository<Department>>;

    mockMailService = {
      sendMail: jest.fn().mockResolvedValue({ message: 'Mail sent' }),
    } as unknown as jest.Mocked<MailService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Department), useValue: mockDepartmentRepository },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    userService = module.get<UserService>(UserService);

    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => '$2b$10$hashedpassword');
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = await usersController.findAll();
      expect(result).toEqual([mockUser]);
      expect(mockUserRepository.find).toHaveBeenCalledWith({ relations: ['department', 'department.unit'] });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const req = createMockRequest({ id: 1 });
      const result = await usersController.getCurrentUser(req);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['department'] });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const req = createMockRequest({ id: 999 });
      await expect(usersController.getCurrentUser(req)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFilteredUsers', () => {
    it('should return filtered users', async () => {
      const filters = { name: 'Test', departmentName: 'Test Department', unitName: 'Test Unit' };
      const result = await usersController.getFilteredUsers(filters);
      expect(result).toEqual([mockUser]);
      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should return empty array if no filters provided', async () => {
      const filters = {};
      const result = await usersController.getFilteredUsers(filters);
      expect(result).toEqual([mockUser]);
      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const result = await usersController.findOne(1);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['department'] });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(usersController.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.TEACHER,
        departmentId: 1,
        degree: Degree.NONE,
        position: Position.LECTURER,
        isAuthor: true,
      };
      mockUserRepository.findOne.mockResolvedValue(null);
      const result = await usersController.create(createUserDto);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: createUserDto.email,
        password: expect.any(String),
        department: mockDepartment,
      }));
      expect(mockMailService.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: createUserDto.email,
        subject: 'Ваш акаунт створено',
      }));
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.TEACHER,
        departmentId: 1,
        degree: Degree.NONE,
        position: Position.LECTURER,
        isAuthor: true,
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      await expect(usersController.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'User',
        email: 'updated@example.com',
        departmentId: 1,
        password: 'password',
        role: UserRole.TEACHER,
        isAuthor: true,
      };
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser).mockResolvedValueOnce(null); 
      const result = await usersController.update(1, updateUserDto);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        firstName: 'Updated',
        email: 'updated@example.com',
        department: mockDepartment,
      }));
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password',
        role: UserRole.TEACHER,
        isAuthor: true,
      };
      await expect(usersController.update(999, updateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if email already exists', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password',
        role: UserRole.TEACHER,
        isAuthor: true,
      };
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser).mockResolvedValueOnce(mockUser);
      await expect(usersController.update(1, updateUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const body = { password: 'newPassword123', confirmPassword: 'newPassword123' };
      const result = await usersController.changePassword('1', body);
      expect(result).toEqual('Пароль успішно оновлено');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        password: expect.any(String),
      }));
    });

    it('should throw UnauthorizedException if passwords do not match', async () => {
      const body = { password: 'newPassword123', confirmPassword: 'differentPassword' };
      await expect(usersController.changePassword('1', body)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const body = { password: 'newPassword123', confirmPassword: 'newPassword123' };
      await expect(usersController.changePassword('999', body)).rejects.toThrow(NotFoundException);
    });
  });

  describe('changeEmail', () => {
    it('should change user email', async () => {
      const body = { email: 'newemail1@example.com' };
      
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null); 
      jest.spyOn(userService, 'updateEmail').mockResolvedValue({ message: 'Емейл успішно оновлено' });
  
      const result = await usersController.changeEmail('1', body);
  
      expect(result).toEqual('Емейл успішно оновлено');
      expect(userService.findByEmail).toHaveBeenCalledWith('newemail1@example.com');
      expect(userService.updateEmail).toHaveBeenCalledWith(1, 'newemail1@example.com');
    });
  
    it('should throw ConflictException if email already exists', async () => {
      const body = { email: 'existing@example.com' };
  
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
  
      await expect(usersController.changeEmail('1', body)).rejects.toThrow(ConflictException);
      expect(userService.findByEmail).toHaveBeenCalledWith('existing@example.com');
    });
  });

  describe('remove', () => {
    it('should delete user', async () => {
      const result = await usersController.remove(1);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(usersController.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
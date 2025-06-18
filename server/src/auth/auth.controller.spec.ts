import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { Response, Request } from 'express';
import { UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRole, Degree, Position } from '../entities/user.entity';
import { UnitType } from '../entities/unit.entity';

describe('AuthController (Unit)', () => {
  let authController: AuthController;
  let authService: AuthService;

  let mockJwtService: jest.Mocked<JwtService>; 
  let mockUserRepository: jest.Mocked<Repository<User>>; 
  let mockUserService: jest.Mocked<UserService>; 
  let mockMailService: jest.Mocked<MailService>; 

  const mockDepartment = {
    id: 1,
    name: 'Test Department',
    unit: null, 
    users: [],
  };

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
    department: { id: 1, name: 'Test Department', users: [], unit: { id: 1, name: 'Test Unit', type: UnitType.FACULTY, departments: [] }},
    ratingsAuthor: [],
    ratingParticipations: [],
    ratingsToReview: [],
    givenApprovals: [],
    responses: [],
  };

  const createMockResponse = (): Response => {
    const res: Partial<Response> = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    return res as Response;
  };

  const createMockRequest = (cookies?: any, user?: any): Request => {
    return {
      cookies: cookies || {},
      user: user || null,
    } as Request;
  };

  beforeEach(async () => {
    const jwtServiceMock = {
      sign: jest.fn().mockImplementation((payload, options) => {
        if (options && options.secret === process.env.JWT_SECRET) return 'access_token';
        if (options && options.secret === process.env.JWT_REFRESH_SECRET) return 'refresh_token';
        if (options && options.secret === process.env.JWT_RESET_SECRET) return 'reset_token';
        return 'token';
      }),
      verify: jest.fn().mockImplementation((token, options) => {
        if (token === 'refresh_token' && options.secret === process.env.JWT_REFRESH_SECRET) {
          return { sub: 1, role: UserRole.TEACHER };
        }
        if (token === 'reset_token' && options.secret === process.env.JWT_RESET_SECRET) {
          return { userId: 1 };
        }
        throw new Error('Invalid token');
      }),
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
      decode: jest.fn(),
      options: {},
      logger: { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn(), verbose: jest.fn() },
      mergeJwtOptions: jest.fn(),
      overrideSecretFromOptions: jest.fn(),
      getSecretKey: jest.fn().mockReturnValue('secret'),
    };
    
    mockJwtService = jwtServiceMock as unknown as jest.Mocked<JwtService>;

    mockUserRepository = {
      findOne: jest.fn().mockResolvedValue(mockUser),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      metadata: { connection: {}, manager: {} },
      target: User,
    } as unknown as jest.Mocked<Repository<User>>;

    mockUserService = {
      findByEmail: jest.fn().mockResolvedValue(mockUser),
      findById: jest.fn().mockResolvedValue(mockUser),
      updatePassword: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<UserService>;

    mockMailService = {
      sendMail: jest.fn().mockResolvedValue({ message: 'Mail sent' }),
    } as unknown as jest.Mocked<MailService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: UserService, useValue: mockUserService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should login user and set cookies', async () => {
      const body = { email: 'test@example.com', password: 'password123' };
      const res = createMockResponse();
      
      mockJwtService.sign
        .mockImplementationOnce(() => 'access_token') 
        .mockImplementationOnce(() => 'refresh_token'); 

      const result = await authController.login(body, res);

      expect(result).toEqual({ message: 'Login successful' });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: body.email } });
      expect(res.cookie).toHaveBeenCalledWith('access_token', 'access_token', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refresh_token', expect.any(Object));
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const body = { email: 'wrong@example.com', password: 'wrong' };
      const res = createMockResponse();

      await expect(authController.login(body, res)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should refresh access token and set cookie', async () => {
      const req = createMockRequest({ refresh_token: 'refresh_token' });
      const res = createMockResponse();

      const result = await authController.refresh(req, res);

      expect(result).toEqual({ access_token: 'access_token' });
      expect(mockJwtService.verify).toHaveBeenCalledWith('refresh_token', {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      expect(res.cookie).toHaveBeenCalledWith('access_token', 'access_token', expect.any(Object));
    });

    it('should throw UnauthorizedException if refresh token is missing', async () => {
      const req = createMockRequest({});
      const res = createMockResponse();

      await expect(authController.refresh(req, res)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const req = createMockRequest({ refresh_token: 'invalid_token' });
      const res = createMockResponse();
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authController.refresh(req, res)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should logout user and clear cookies', async () => {
      const req = createMockRequest(null, { id: 1 });
      const res = createMockResponse();

      const result = await authController.logout(req, res);

      expect(result).toEqual({ message: 'Вихід з акаунту успішний' });
      expect(res.clearCookie).toHaveBeenCalledWith('access_token');
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(authService.isTokenRevoked(1)).toBe(true);
    });

    it('should throw UnauthorizedException if user is not authorized', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      await expect(authController.logout(req, res)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email', async () => {
      const email = 'test@example.com';

      const result = await authController.forgotPassword(email);

      expect(result).toEqual({ message: 'Лист із інструкціями надіслано на email.' });
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockMailService.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: email,
        subject: 'Відновлення паролю',
      }));
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      const email = 'nonexistent@example.com';

      await expect(authController.forgotPassword(email)).rejects.toThrow(NotFoundException);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const token = 'reset_token';
      const newPassword = 'newPassword123';

      const result = await authController.resetPassword(token, newPassword);

      expect(result).toEqual({ message: 'Пароль успішно змінено.' });
      expect(mockJwtService.verify).toHaveBeenCalledWith(token, {
        secret: process.env.JWT_RESET_SECRET,
      });
      expect(mockUserService.findById).toHaveBeenCalledWith(1);
      expect(mockUserService.updatePassword).toHaveBeenCalledWith(1, newPassword);
    });

    it('should throw BadRequestException for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      const token = 'invalid_token';
      const newPassword = 'newPassword123';

      await expect(authController.resetPassword(token, newPassword)).rejects.toThrow(BadRequestException);
    });
  });
});
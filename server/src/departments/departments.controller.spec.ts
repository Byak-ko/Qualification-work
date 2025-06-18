import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { Unit, UnitType } from '../entities/unit.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('DepartmentsService & DepartmentsController (Unit)', () => {
  let departmentsController: DepartmentsController;
  let departmentsService: DepartmentsService;
  let mockDepartmentRepository: jest.Mocked<Repository<Department>>;
  let mockUnitRepository: jest.Mocked<Repository<Unit>>;

  const mockUnit: Unit = {
    id: 1,
    name: 'Факультет інформаційних технологій',
    type: UnitType.FACULTY,
    departments: [],
  };

  const mockDepartment: Department = {
    id: 1,
    name: 'Кафедра програмної інженерії',
    unit: mockUnit,
    users: [],
  };

  beforeEach(async () => {
    mockDepartmentRepository = {
      find: jest.fn().mockResolvedValue([mockDepartment]),
      findOne: jest.fn().mockResolvedValue(mockDepartment),
      create: jest.fn().mockReturnValue(mockDepartment),
      save: jest.fn().mockResolvedValue(mockDepartment),
      delete: jest.fn().mockResolvedValue({ affected: 1, raw: [] }),
    } as unknown as jest.Mocked<Repository<Department>>;

    mockUnitRepository = {
      findOne: jest.fn().mockResolvedValue(mockUnit),
    } as unknown as jest.Mocked<Repository<Unit>>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentsController],
      providers: [
        DepartmentsService,
        {
          provide: getRepositoryToken(Department),
          useValue: mockDepartmentRepository,
        },
        {
          provide: getRepositoryToken(Unit),
          useValue: mockUnitRepository,
        },
      ],
    }).compile();

    departmentsController = module.get<DepartmentsController>(DepartmentsController);
    departmentsService = module.get<DepartmentsService>(DepartmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('DepartmentsService', () => {
    describe('findAll', () => {
      it('should return all departments', async () => {
        const result = await departmentsService.findAll();
        expect(result).toEqual([mockDepartment]);
        expect(mockDepartmentRepository.find).toHaveBeenCalledWith({ relations: ['unit'] });
      });
    });

    describe('create', () => {
      it('should create a new department', async () => {
        const createDepartmentDto = { name: 'Новий відділ', unit: 1 };
        const result = await departmentsService.create(createDepartmentDto);
        
        expect(mockUnitRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(mockDepartmentRepository.create).toHaveBeenCalledWith({ 
          name: createDepartmentDto.name, 
          unit: mockUnit 
        });
        expect(mockDepartmentRepository.save).toHaveBeenCalledWith(mockDepartment);
        expect(result).toEqual(mockDepartment);
      });

      it('should throw an error if unit not found', async () => {
        mockUnitRepository.findOne.mockResolvedValue(null);
        const createDepartmentDto = { name: 'Новий відділ', unit: 999 };
        
        await expect(departmentsService.create(createDepartmentDto)).rejects.toThrow('Unit not found');
        expect(mockUnitRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
        expect(mockDepartmentRepository.create).not.toHaveBeenCalled();
      });
    });

    describe('update', () => {
      it('should update an existing department', async () => {
        const updateDepartmentDto = { name: 'Оновлений відділ', unit: 1 };
        const result = await departmentsService.update(1, updateDepartmentDto);
        
        expect(mockDepartmentRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(mockUnitRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(mockDepartmentRepository.save).toHaveBeenCalled();
        expect(result).toEqual(mockDepartment);
      });

      it('should throw an error if department not found', async () => {
        mockDepartmentRepository.findOne.mockResolvedValue(null);
        const updateDepartmentDto = { name: 'Оновлений відділ', unit: 1 };
        
        await expect(departmentsService.update(999, updateDepartmentDto)).rejects.toThrow('Department not found');
        expect(mockDepartmentRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
        expect(mockUnitRepository.findOne).not.toHaveBeenCalled();
      });

      it('should throw an error if unit not found', async () => {
        mockUnitRepository.findOne.mockResolvedValue(null);
        const updateDepartmentDto = { name: 'Оновлений відділ', unit: 999 };
        
        await expect(departmentsService.update(1, updateDepartmentDto)).rejects.toThrow('Unit not found');
        expect(mockDepartmentRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(mockUnitRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
      });
    });

    describe('delete', () => {
      it('should delete a department', async () => {
        const result = await departmentsService.delete(1);
        expect(result).toEqual({ affected: 1, raw: [] });
        expect(mockDepartmentRepository.delete).toHaveBeenCalledWith(1);
      });

      it('should not throw an error if department not found during deletion', async () => {
        mockDepartmentRepository.delete.mockResolvedValue({ affected: 0, raw: [] });
        const result = await departmentsService.delete(999);
        expect(result).toEqual({ affected: 0, raw: [] });
        expect(mockDepartmentRepository.delete).toHaveBeenCalledWith(999);
      });
    });
  });

  describe('DepartmentsController', () => {
    describe('getAllDepartments', () => {
      it('should return all departments', async () => {
        const result = await departmentsController.getAllDepartments();
        expect(result).toEqual([mockDepartment]);
        expect(mockDepartmentRepository.find).toHaveBeenCalledWith({ relations: ['unit'] });
      });
    });

    describe('createDepartment', () => {
      it('should create a new department', async () => {
        const createDepartmentDto = { name: 'Новий відділ', unit: 1 };
        const result = await departmentsController.createDepartment(createDepartmentDto);
        
        expect(result).toEqual(mockDepartment);
        expect(mockUnitRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(mockDepartmentRepository.create).toHaveBeenCalledWith({ 
          name: createDepartmentDto.name, 
          unit: mockUnit 
        });
      });

      it('should throw an error if unit not found', async () => {
        jest.spyOn(departmentsService, 'create').mockRejectedValue(new Error('Unit not found'));
        const createDepartmentDto = { name: 'Новий відділ', unit: 999 };
        
        await expect(departmentsController.createDepartment(createDepartmentDto)).rejects.toThrow('Unit not found');
      });
    });

    describe('updateDepartment', () => {
      it('should update an existing department', async () => {
        const updateDepartmentDto = { name: 'Оновлений відділ', unit: 1 };
        const result = await departmentsController.updateDepartment(1, updateDepartmentDto);
        
        expect(result).toEqual(mockDepartment);
        expect(mockDepartmentRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(mockUnitRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      });

      it('should throw an error if department not found', async () => {
        jest.spyOn(departmentsService, 'update').mockRejectedValue(new Error('Department not found'));
        const updateDepartmentDto = { name: 'Оновлений відділ', unit: 1 };
        
        await expect(departmentsController.updateDepartment(999, updateDepartmentDto)).rejects.toThrow('Department not found');
      });

      it('should throw an error if unit not found', async () => {
        jest.spyOn(departmentsService, 'update').mockRejectedValue(new Error('Unit not found'));
        const updateDepartmentDto = { name: 'Оновлений відділ', unit: 999 };
        
        await expect(departmentsController.updateDepartment(1, updateDepartmentDto)).rejects.toThrow('Unit not found');
      });
    });

    describe('deleteDepartment', () => {
      it('should delete a department', async () => {
        const result = await departmentsController.deleteDepartment(1);
        expect(result).toEqual({ affected: 1, raw: [] });
        expect(mockDepartmentRepository.delete).toHaveBeenCalledWith(1);
      });
    });
  });
});
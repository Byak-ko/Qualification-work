import { Test, TestingModule } from '@nestjs/testing';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { Unit, UnitType } from '../entities/unit.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('UnitsService & UnitsController (Unit)', () => {
  let unitsController: UnitsController;
  let unitsService: UnitsService;
  let mockUnitRepository: jest.Mocked<Repository<Unit>>;

  const mockUnit: Unit = {
    id: 1,
    name: 'Факультет інформаційних технологій',
    type: UnitType.FACULTY,
    departments: [],
  };

  const mockUpdateResult: UpdateResult = {
    affected: 1,
    raw: [],
    generatedMaps: [],
  };

  const mockDeleteResult: DeleteResult = {
    affected: 1,
    raw: [],
  };

  beforeEach(async () => {
    mockUnitRepository = {
      find: jest.fn().mockResolvedValue([mockUnit]),
      findOne: jest.fn().mockResolvedValue(mockUnit),
      create: jest.fn().mockReturnValue(mockUnit),
      save: jest.fn().mockResolvedValue(mockUnit),
      update: jest.fn().mockResolvedValue(mockUpdateResult),
      delete: jest.fn().mockResolvedValue(mockDeleteResult),
    } as unknown as jest.Mocked<Repository<Unit>>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitsController],
      providers: [
        UnitsService,
        {
          provide: getRepositoryToken(Unit),
          useValue: mockUnitRepository,
        },
      ],
    }).compile();

    unitsController = module.get<UnitsController>(UnitsController);
    unitsService = module.get<UnitsService>(UnitsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('UnitsService', () => {
    describe('findAll', () => {
      it('should return all units', async () => {
        const result = await unitsService.findAll();
        expect(result).toEqual([mockUnit]);
        expect(mockUnitRepository.find).toHaveBeenCalled();
      });
    });

    describe('create', () => {
      it('should create a new unit', async () => {
        const createUnitDto = { name: 'Новий факультет', type: UnitType.FACULTY };
        const result = await unitsService.create(createUnitDto);
        expect(result).toEqual(mockUnit);
        expect(mockUnitRepository.create).toHaveBeenCalledWith(createUnitDto);
        expect(mockUnitRepository.save).toHaveBeenCalledWith(mockUnit);
      });
    });

    describe('update', () => {
      it('should update an existing unit', async () => {
        const updateUnitDto = { name: 'Оновлений факультет', type: UnitType.FACULTY };
        const result = await unitsService.update(1, updateUnitDto);
        expect(result).toEqual(mockUnit);
        expect(mockUnitRepository.update).toHaveBeenCalledWith(1, updateUnitDto);
        expect(mockUnitRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      });
    });

    describe('delete', () => {
      it('should delete a unit', async () => {
        const result = await unitsService.delete(1);
        expect(result).toEqual(mockDeleteResult);
        expect(mockUnitRepository.delete).toHaveBeenCalledWith(1);
      });

    });
  });

  describe('UnitsController', () => {
    describe('getAllUnits', () => {
      it('should return all units', async () => {
        const result = await unitsController.getAllUnits();
        expect(result).toEqual([mockUnit]);
        expect(mockUnitRepository.find).toHaveBeenCalled();
      });
    });

    describe('createUnit', () => {
      it('should create a new unit', async () => {
        const createUnitDto = { name: 'Новий факультет', type: UnitType.FACULTY };
        const result = await unitsController.createUnit(createUnitDto);
        expect(result).toEqual(mockUnit);
        expect(mockUnitRepository.create).toHaveBeenCalledWith(createUnitDto);
        expect(mockUnitRepository.save).toHaveBeenCalledWith(mockUnit);
      });
    });

    describe('updateUnit', () => {
      it('should update an existing unit', async () => {
        const updateUnitDto = { name: 'Оновлений факультет', type: UnitType.FACULTY };
        const result = await unitsController.updateUnit(1, updateUnitDto);
        expect(result).toEqual(mockUnit);
        expect(mockUnitRepository.update).toHaveBeenCalledWith(1, updateUnitDto);
        expect(mockUnitRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      });

      it('should throw NotFoundException if unit not found', async () => {
        jest.spyOn(unitsService, 'update').mockRejectedValue(new NotFoundException('Підрозділ не знайдено'));
        const updateUnitDto = { name: 'Оновлений факультет', type: UnitType.FACULTY };
        await expect(unitsController.updateUnit(999, updateUnitDto)).rejects.toThrow(NotFoundException);
      });
    });

    describe('deleteUnit', () => {
      it('should delete a unit', async () => {
        const result = await unitsController.deleteUnit(1);
        expect(result).toEqual(mockDeleteResult);
        expect(mockUnitRepository.delete).toHaveBeenCalledWith(1);
      });

      it('should throw NotFoundException if unit not found', async () => {
        jest.spyOn(unitsService, 'delete').mockRejectedValue(new NotFoundException('Підрозділ не знайдено'));
        await expect(unitsController.deleteUnit(999)).rejects.toThrow(NotFoundException);
      });
    });
  });
});
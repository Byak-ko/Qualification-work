import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { Unit } from '../entities/unit.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
  ) {}

  async findAll() {
    return this.departmentRepository.find({ relations: ['unit'] });
  }

  async create(data: { name: string; unit: number }) {
    console.log("Data", data);
    console.log("data unitid", data.unit);
    const unit = await this.unitRepository.findOne({ where: { id: data.unit } });
    console.log("Found unit", unit);
    if (!unit) throw new Error('Unit not found');

    const department = this.departmentRepository.create({ name: data.name, unit });
    return this.departmentRepository.save(department);
  }

  async update(id: number, data: { name: string; unit: number }) {
    const department = await this.departmentRepository.findOne({ where: { id } });
    if (!department) throw new Error('Department not found');

    const unit = await this.unitRepository.findOne({ where: { id: data.unit } });
    if (!unit) throw new Error('Unit not found');

    department.name = data.name;
    department.unit = unit;

    return this.departmentRepository.save(department);
  }

  async delete(id: number) {
    return this.departmentRepository.delete(id);
  }
}

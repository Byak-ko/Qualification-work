import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit, UnitType } from '../entities/unit.entity';


@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
  ) {}

  async findAll() {
    return this.unitRepository.find();
  }

  async create(data: { name: string; type: UnitType }) {
    const unit = this.unitRepository.create(data);
    return this.unitRepository.save(unit);
  }

  async update(id: number, data: { name: string; type: UnitType }) {
    await this.unitRepository.update(id, data);
    return this.unitRepository.findOne({ where: { id } });
  }

  async delete(id: number) {
    return this.unitRepository.delete(id);
  }
}

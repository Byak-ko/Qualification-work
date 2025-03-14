import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from '../entities/unit.entity';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
  ) {}

  async findAll() {
    return this.unitRepository.find();
  }

  async create(data: { name: string; type: string }) {
    const unit = this.unitRepository.create(data);
    return this.unitRepository.save(unit);
  }

  async update(id: number, data: { name: string; type: string }) {
    await this.unitRepository.update(id, data);
    return this.unitRepository.findOne({ where: { id } });
  }

  async delete(id: number) {
    return this.unitRepository.delete(id);
  }
}

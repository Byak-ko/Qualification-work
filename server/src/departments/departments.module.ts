import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { Department } from '../entities/department.entity';
import { Unit } from '../entities/unit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Department, Unit])],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
})
export class DepartmentsModule {}

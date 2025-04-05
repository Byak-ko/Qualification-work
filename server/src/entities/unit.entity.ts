import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Department } from './department.entity';

export enum UnitType {
  FACULTY = 'Факультет',
  INSTITUTE = 'Інститут',
}

@Entity()
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: UnitType;

  @OneToMany(() => Department, (department) => department.unit, { onDelete: 'SET NULL' })
  departments: Department[];
}

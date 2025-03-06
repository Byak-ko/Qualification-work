import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Department } from './department.entity';

@Entity()
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @OneToMany(() => Department, (department) => department.unit)
  departments: Department[];
}

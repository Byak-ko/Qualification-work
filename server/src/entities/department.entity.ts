import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Unit } from './unit.entity';

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Unit, (unit) => unit.departments, { onDelete: 'SET NULL' })
  unit: Unit;

  @OneToMany(() => User, (user) => user.department, { onDelete: 'SET NULL' })
  users: User[];
}

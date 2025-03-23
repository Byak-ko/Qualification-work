import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Department } from './department.entity';
import { Rating } from './rating.entity';
import { RatingApproval } from './rating-approval.entity';

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.TEACHER })
  role: UserRole;

  @Column()
  lastName: string;

  @Column()
  firstName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  degree: string;

  @Column()
  position: string;

  @ManyToOne(() => Department, (department) => department.users)
  department: Department;

  @OneToMany(() => Rating, (rating) => rating.author)
  ratingsAuthor: Rating[];

  @OneToMany(() => Rating, (rating) => rating.respondent)
  ratingsRespondent: Rating[];

  @OneToMany(() => RatingApproval, (approval) => approval.reviewer)
  approvals: RatingApproval[];
}

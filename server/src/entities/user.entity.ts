import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Department } from './department.entity';
import { Rating } from './rating.entity';

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

  @ManyToOne(() => Department, (department) => department.users)
  department: Department;

  @OneToMany(() => Rating, (rating) => rating.author)
  ratings: Rating[];

  @OneToMany(() => Rating, (rating) => rating.respondent)
  rated: Rating[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany } from 'typeorm';
import { Department } from './department.entity';
import { Rating } from './rating.entity';
import { RatingParticipant } from './rating-participant.entity';
import { RatingResponse } from './rating-response.entity';
import { RatingApproval } from './rating-approval.entity';

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
}

export enum Degree {
  PhD = 'Доктор філософії',
  DOCTOR_SCIENCES = 'Доктор наук',
  NONE = 'Відсутній',
}

export enum Position {
  LECTURER = 'Викладач',
  SENIOR_LECTURER = 'Старший викладач',
  ASSOCIATE_PROFESSOR = 'Доцент',
  PROFESSOR = 'Професор',
  HEAD_OF_DEPARTMENT = 'Завідувач кафедри',
  DEAN_OR_DIRECTOR = 'Декан факультету / директор ННІ',
  VICE_RECTOR = 'Проректор',
  RECTOR = 'Ректор',
  ADMIN = 'Адміністратор'
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

  @Column({ default: Degree.NONE, type: 'enum', enum: Degree })
  degree?: Degree;
  
  @Column({ default: Position.LECTURER, type: 'enum', enum: Position })
  position: Position;

  @Column({ default: false })
  isAuthor: boolean;

  @ManyToOne(() => Department, (department) => department.users)
  department: Department;

  @OneToMany(() => Rating, (rating) => rating.author)
  ratingsAuthor: Rating[];

  @OneToMany(() => RatingParticipant, (participant) => participant.respondent)
  ratingParticipations: RatingParticipant[];

  @ManyToMany(() => Rating, (rating) => rating.reviewers)
  ratingsToReview: Rating[];

  @OneToMany(() => RatingApproval, (approval) => approval.reviewer)
  givenApprovals: RatingApproval[];

  @OneToMany(() => RatingResponse, (response) => response.respondent)
  responses: RatingResponse[];
}

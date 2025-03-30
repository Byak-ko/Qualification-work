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

  @OneToMany(() => RatingParticipant, (participant) => participant.respondent)
  ratingParticipations: RatingParticipant[];

  @ManyToMany(() => Rating, (rating) => rating.reviewers)
  ratingsToReview: Rating[];

  @OneToMany(() => RatingApproval, (approval) => approval.reviewer)
  givenApprovals: RatingApproval[];

  @OneToMany(() => RatingResponse, (response) => response.respondent)
  responses: RatingResponse[];
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Rating } from './rating.entity';
import { User } from './user.entity';
import { RatingApproval } from './rating-approval.entity';
import { RatingResponse } from './rating-response.entity';

export enum RatingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REVISION = 'revision',
  FILLED = 'filled',
}

@Entity()
export class RatingParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Rating, (rating) => rating.participants, { onDelete: 'CASCADE' })
  rating: Rating;

  @ManyToOne(() => User)
  respondent: User;

  @Column({ type: 'int', default: 0 })
  totalScore: number;

  @Column({ default: 'pending', type: 'enum', enum: RatingStatus })
  status: RatingStatus;

  @OneToMany(() => RatingApproval, (approval) => approval.participant)
  approvals: RatingApproval[];

  @OneToMany(() => RatingResponse, (response) => response.participant)
  responses: RatingResponse[];
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Rating } from './rating.entity';
import { User } from './user.entity';
import { RatingApproval } from './rating-approval.entity';
import { RatingResponse } from './rating-response.entity';

export enum RatingParticipantStatus {
  PENDING = 'pending',
  FILLED = 'filled',
  APPROVED = 'approved',
  REVISION = 'revision',
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
  
  @Column({ default: 'pending', type: 'enum', enum: RatingParticipantStatus })
  status: RatingParticipantStatus;
  
  @OneToMany(() => RatingApproval, (approval) => approval.participant, { 
    cascade: true, 
    onDelete: 'CASCADE' 
  })
  approvals: RatingApproval[];
  
  @OneToMany(() => RatingResponse, (response) => response.participant, { 
    cascade: true, 
    onDelete: 'CASCADE' 
  })
  responses: RatingResponse[];
  
  @ManyToOne(() => User, { nullable: true })
  departmentReviewer: User;
  
  @ManyToOne(() => User, { nullable: true })
  unitReviewer: User;
  
  @ManyToOne(() => User)
  customerReviewer: User;
}

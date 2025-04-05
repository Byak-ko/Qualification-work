import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { RatingParticipant } from './rating-participant.entity';

export enum RatingApprovalStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REVISION = 'revision',
  }

  export enum ReviewLevel {
    DEPARTMENT = 'department',
    UNIT = 'unit',
    AUTHOR = 'author',
  }
@Entity()
export class RatingApproval {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RatingParticipant, (participant) => participant.approvals, { onDelete: 'CASCADE' })
  participant: RatingParticipant;

  @ManyToOne(() => User, (user) => user.id)
  reviewer: User;

  @Column({ default: 'pending', type: 'enum', enum: RatingApprovalStatus })
  status: RatingApprovalStatus;

  @Column('jsonb')
  comments: Record<number, string>;

  @Column({ type: 'enum', enum: ReviewLevel })
  reviewLevel: ReviewLevel;
}

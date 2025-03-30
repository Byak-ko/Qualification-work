import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Rating } from './rating.entity';
import { RatingParticipant } from './rating-participant.entity';

export enum RatingApprovalStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REVISION = 'revision',
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
}

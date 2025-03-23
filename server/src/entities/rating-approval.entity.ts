import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Rating } from './rating.entity';

export enum RatingApprovalStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REVISION = 'revision',
  }
@Entity()
export class RatingApproval {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  reviewer: User;

  @ManyToOne(() => Rating, (rating) => rating.approvals, { onDelete: 'CASCADE' })
  rating: Rating;

  @Column({ type: 'enum', enum: RatingApprovalStatus })
  status: RatingApprovalStatus;

  @Column('jsonb')
  comments: Record<number, string>;
}

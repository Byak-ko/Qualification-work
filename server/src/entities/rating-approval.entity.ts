import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Rating } from './rating.entity';

@Entity()
export class RatingApproval {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  reviewer: User;

  @ManyToOne(() => Rating, (rating) => rating.approvals)
  rating: Rating;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  comments: string;
}

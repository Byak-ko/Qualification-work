import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { RatingItem } from './rating-item.entity';
import { RatingApproval } from './rating-approval.entity';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.ratingsAuthor)
  author: User;

  @ManyToOne(() => User, (user) => user.ratingsRespondent)
  respondent: User;

  @Column()
  type: string;

  @Column()
  name: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'float', default: 0 })
  totalScore: number;

  @OneToMany(() => RatingItem, (item) => item.rating)
  items: RatingItem[];

  @OneToMany(() => RatingApproval, (approval) => approval.rating)
  approvals: RatingApproval[];
}

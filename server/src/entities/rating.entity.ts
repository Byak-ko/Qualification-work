import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { RatingItem } from './rating-item.entity';
import { RatingApproval } from './rating-approval.entity';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.ratings)
  author: User;

  @ManyToOne(() => User, (user) => user.ratings)
  respondent: User;

  @Column()
  type: string;

  @Column()
  name: string;

  @Column({ default: 'pending' })
  status: string;

  @OneToMany(() => RatingItem, (item) => item.rating)
  items: RatingItem[];

  @OneToMany(() => RatingApproval, (approval) => approval.rating)
  approvals: RatingApproval[];
}

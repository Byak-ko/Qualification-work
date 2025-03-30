import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { RatingParticipant } from './rating-participant.entity';
import { RatingItem } from './rating-item.entity';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.ratingsAuthor)
  author: User;

  @Column()
  type: string;

  @Column()
  name: string;

  @OneToMany(() => RatingParticipant, (participant) => participant.rating)
  participants: RatingParticipant[];

  @OneToMany(() => RatingItem, (item) => item.rating)
  items: RatingItem[];

  @ManyToMany(() => User)
  @JoinTable()
  reviewers: User[];
}

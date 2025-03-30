import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Rating } from './rating.entity';

@Entity()
export class RatingItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Rating, (rating) => rating.items, { onDelete: 'CASCADE' })
  rating: Rating;

  @Column()
  name: string;

  @Column()
  maxScore: number;

  @Column({ type: 'text', nullable: true })
  comment: string;
}

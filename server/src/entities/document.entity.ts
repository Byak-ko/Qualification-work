import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { RatingItem } from './rating-item.entity';

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RatingItem, (item) => item.documents)
  ratingItem: RatingItem;

  @Column()
  url: string;
}

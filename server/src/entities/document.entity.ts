import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { RatingItem } from './rating-item.entity';

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(() => RatingItem, (item) => item.documents, { onDelete: 'CASCADE' })
  ratingItem: RatingItem;
}

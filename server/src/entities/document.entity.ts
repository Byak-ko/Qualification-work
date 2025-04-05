import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { RatingItem } from './rating-item.entity';
import { RatingResponse } from './rating-response.entity';

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  title: string;

  @ManyToOne(() => RatingResponse, (response) => response.documents)
  response: RatingResponse;
}

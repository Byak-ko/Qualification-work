import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Rating } from './rating.entity';
import { Document } from './document.entity';

@Entity()
export class RatingItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Rating, (rating) => rating.items, { onDelete: 'CASCADE' })
  rating: Rating;  

  @Column()
  name: string;

  @Column()
  score: number;

  @Column()
  maxScore: number;

  @OneToMany(() => Document, (doc) => doc.ratingItem)
  documents: Document[];
}

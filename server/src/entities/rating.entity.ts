import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { RatingParticipant } from './rating-participant.entity';
import { RatingItem } from './rating-item.entity';

export enum RatingStatus {
  CREATED = 'created',
  PENDING = 'pending',
  CLOSED = 'closed',
}

export enum RatingType {
  SCIENTIFIC = "Науковий",
  EDUCATIONAL_METHODICAL = "Навчально-методичний",
  ORGANIZATIONAL_EDUCATIONAL = "Організаційно-виховний"
}

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.ratingsAuthor)
  author: User;

  @Column( {type: 'enum', enum: RatingType} )
  type: RatingType;

  @Column()
  title: string;

  @Column({ default: 'created', type: 'enum', enum: RatingStatus })
  status: RatingStatus;

  @OneToMany(() => RatingParticipant, (participant) => participant.rating, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  participants: RatingParticipant[];

  @OneToMany(() => RatingItem, (item) => item.rating, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  items: RatingItem[];

  @ManyToMany(() => User)
  @JoinTable()
  reviewers: User[];
}

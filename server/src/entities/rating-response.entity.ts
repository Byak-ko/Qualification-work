import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Document } from './document.entity';
import { Rating } from './rating.entity';
import { User } from './user.entity';
import { RatingItem } from './rating-item.entity';
import { RatingParticipant } from './rating-participant.entity';

@Entity()
export class RatingResponse {
    @PrimaryGeneratedColumn()
    id: number;
   
    @Column({ type: 'float', default: 0 })
    score: number;
    
    @ManyToOne(() => RatingItem, { onDelete: 'CASCADE' })
    item: RatingItem;
    
    @ManyToOne(() => User)
    respondent: User;
    
    @ManyToOne(() => Rating, { onDelete: 'CASCADE' })
    rating: Rating;
    
    @ManyToOne(() => RatingParticipant, (p) => p.responses, { onDelete: 'CASCADE' })
    participant: RatingParticipant;
    
    @OneToMany(() => Document, (doc) => doc.response, { 
      cascade: true, 
      onDelete: 'CASCADE' 
    })
    documents: Document[];
}

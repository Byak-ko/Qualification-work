import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Rating } from './rating.entity';
import { User } from './user.entity';
import { RatingParticipant } from './rating-participant.entity';

@Entity()
export class RatingResponse {
    @PrimaryGeneratedColumn()
    id: number;
   
    @Column({ type: 'jsonb', default: {} })
    scores: Record<number, number>; // key: ratingItemId, value: score
    
    @Column({ type: 'jsonb', default: {} })
    documents: Record<number, string[]>; // key: ratingItemId, value: array of document URLs
    
    @ManyToOne(() => User)
    respondent: User;
    
    @ManyToOne(() => Rating, { onDelete: 'CASCADE' })
    rating: Rating;
    
    @ManyToOne(() => RatingParticipant, (p) => p.responses, { onDelete: 'CASCADE' })
    participant: RatingParticipant;
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../entities/rating.entity';
import { User } from '../entities/user.entity';
import { RatingItem } from '../entities/rating-item.entity';
import { RatingApproval } from '../entities/rating-approval.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating) private ratingRepository: Repository<Rating>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(RatingItem) private ratingItemRepository: Repository<RatingItem>,
    @InjectRepository(RatingApproval) private ratingApprovalRepository: Repository<RatingApproval>,
  ) {}

  async createRating(authorId: number, data: { respondentIds: number[]; type: string; name: string; items: { name: string; maxScore: number }[] }) {
    const author = await this.userRepository.findOne({ where: { id: authorId } });
    const respondents = await this.userRepository.find({
      where: data.respondentIds.map((id) => ({ id })),
    });

    if (!author || respondents.length !== data.respondentIds.length) {
      throw new Error('Автор або один із респондентів не знайдені');
    }

    const totalScore = data.items.reduce((sum, item) => sum + item.maxScore, 0);

    const rating = this.ratingRepository.create({
      author,
      respondent: author, 
      type: data.type,
      name: data.name,
      totalScore
    });
    await this.ratingRepository.save(rating);


    const ratingItems = data.items.map((item) =>
      this.ratingItemRepository.create({
        rating,
        name: item.name,
        maxScore: item.maxScore,
        score: 0,
      })
    );
    await this.ratingItemRepository.save(ratingItems);


    const ratingApprovals = [author, ...respondents].map((user) =>
      this.ratingApprovalRepository.create({
        rating,
        reviewer: user,
        status: 'pending', 
        comments: '',
      })
    );
    await this.ratingApprovalRepository.save(ratingApprovals);

    return { rating, ratingItems, ratingApprovals };
  }
}

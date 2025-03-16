import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Rating } from '../entities/rating.entity';
import { User } from '../entities/user.entity';
import { RatingItem } from '../entities/rating-item.entity';
import { RatingApproval } from '../entities/rating-approval.entity';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating) private ratingRepository: Repository<Rating>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(RatingItem) private ratingItemRepository: Repository<RatingItem>,
    @InjectRepository(RatingApproval) private ratingApprovalRepository: Repository<RatingApproval>,
  ) {}

  async createRating(authorId: number, dto: CreateRatingDto) {
    const author = await this.userRepository.findOne({ where: { id: authorId } });
    if (!author) throw new Error('Автор не знайдений');
  
    const respondent = await this.userRepository.findOne({ where: { id: dto.respondentId } });
    if (!respondent) throw new Error('Респондент не знайдений');

    const reviewers = await this.userRepository.findByIds(dto.reviewerIds ?? []);
    if (reviewers.length !== (dto.reviewerIds?.length || 0)) {
      throw new Error('Один або більше перевіряючих не знайдено');
    }
  
    const allReviewers = [author, ...reviewers]; 
    const totalScore = dto.items.reduce((sum, item) => sum + item.maxScore, 0); // total score or total max score?
  
    const rating = this.ratingRepository.create({
      name: dto.name,
      type: dto.type,
      status: 'pending',
      totalScore,
      author,
      respondent,
    });
  
    await this.ratingRepository.save(rating);
  
    const ratingItems = dto.items.map((item) =>
      this.ratingItemRepository.create({
        rating,
        name: item.name,
        maxScore: item.maxScore,
        score: 0,
      }),
    );
  
    await this.ratingItemRepository.save(ratingItems);
  
    const ratingApprovals = allReviewers.map((reviewer) =>
      this.ratingApprovalRepository.create({
        rating,
        reviewer,
        status: 'pending',
        comments: '',
      })
    );
    await this.ratingApprovalRepository.save(ratingApprovals);
  
    return { rating, ratingItems };
  }

 /* async assignToRespondent(id: number, dto: AssignRatingDto) {
    const rating = await this.ratingRepository.findOne({
      where: { id },
      relations: ['respondent'],
    });
  
    if (!rating) throw new NotFoundException('Рейтинг не знайдено');
  
    rating.respondent = await this.userRepository.findOneByOrFail({ id: dto.respondentId });
    rating.status = 'in_progress';
  
    return await this.ratingRepository.save(rating);
  } */
  
    

  async getRatings() {
    return this.ratingRepository.find({ relations: ['author'] });
  }
   
  
}

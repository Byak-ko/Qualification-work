import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../entities/rating.entity';
import { User } from '../entities/user.entity';
import { RatingItem } from '../entities/rating-item.entity';
import { RatingApproval } from '../entities/rating-approval.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { FillRespondentDto } from './dto/fill-respondent.dto';
import { Document } from 'src/entities/document.entity';
import { RatingApprovalDto } from './dto/rating-approval.dto';
import { RatingApprovalStatus } from '../entities/rating-approval.entity';


@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating) private ratingRepository: Repository<Rating>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(RatingItem) private ratingItemRepository: Repository<RatingItem>,
    @InjectRepository(RatingApproval) private ratingApprovalRepository: Repository<RatingApproval>,
    @InjectRepository(Document) private documentRepository: Repository<Document>,
  ) { }

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
        status: RatingApprovalStatus.PENDING,
        comments: '',
      })
    );
    await this.ratingApprovalRepository.save(ratingApprovals);

    return { rating, ratingItems };
  }

  async getRatingForRespondent(ratingId: number, userId: number) {
    const rating = await this.ratingRepository.findOne({
      where: { id: ratingId },
      relations: ['respondent', 'items']
    });

    if (!rating || rating.respondent.id !== userId) {
      console.log();
      throw new ForbiddenException('Доступ заборонено');
    }

    return rating;
  }

  async fillRatingByRespondent(ratingId: number, dto: FillRespondentDto, userId: number) {
    const rating = await this.ratingRepository.findOne({
      where: { id: ratingId },
      relations: ['respondent', 'items']
    });

    if (!rating || rating.respondent.id !== userId) {
      throw new ForbiddenException('Ви не є респондентом цього рейтингу');
    }

    let totalScore = 0;

    for (const itemData of dto.items) {
      const item = rating.items.find((i) => i.id === itemData.id);
      if (!item) throw new NotFoundException(`Пункт з id ${itemData.id} не знайдено`);

      item.score = itemData.score;
      totalScore += itemData.score;

      if (itemData.documents && itemData.documents.length > 0) {
        await this.documentRepository.delete({ ratingItem: { id: item.id } });
        const documents = itemData.documents.map((url) =>
          this.documentRepository.create({
            url,
            ratingItem: { id: item.id }
          })
        );

        await this.documentRepository.save(documents);
      }
    }

    rating.totalScore = totalScore;
    rating.status = 'filled';
    await this.ratingRepository.save(rating);

    return { message: 'Рейтинг заповнено' };
  }

  async reviewRating(
    ratingId: number,
    dto: RatingApprovalDto,
    userId: number,
  ) {
    const rating = await this.ratingRepository.findOne({
      where: { id: ratingId },
      relations: ['approvals', 'items'],
    });
  
    if (!rating) throw new NotFoundException('Рейтинг не знайдено');
  
    const approval = await this.ratingApprovalRepository.findOne({
      where: { rating: { id: ratingId }, reviewer: { id: userId } },
      relations: ['reviewer'],
    });
  
    if (!approval) {
      throw new ForbiddenException('Ви не є рецензентом цього рейтингу');
    }
  
    approval.status = dto.status;
    approval.comments = dto.comments || {};
    await this.ratingApprovalRepository.save(approval);
  
    return { success: true };
  }
  

  async getRatings() {
    return this.ratingRepository.find({ relations: ['author'] });
  }


}

import { Injectable,} from '@nestjs/common';
import { CreateRatingDto } from '../dto/create-rating.dto';
import { FillRatingDto } from '../dto/fill-rating.dto';
import { RatingCreationService } from './rating-creation.service';
import { RatingResponseService } from './rating-response.service';
import { RatingReviewService } from './rating-review.service';
import { RatingQueryService } from './rating-query.service';
import { RatingApprovalDto } from '../dto/rating-approval.dto';

@Injectable()
export class RatingService {
  constructor(
    private ratingCreationService: RatingCreationService,
    private ratingResponseService: RatingResponseService,
    private ratingReviewService: RatingReviewService,
    private ratingQueryService: RatingQueryService,
  ) {}

  async createRating(authorId: number, dto: CreateRatingDto) {
    return this.ratingCreationService.createRating(authorId, dto);
  }

  async editRating(ratingId: number, authorId: number, dto: CreateRatingDto) {
    return this.ratingCreationService.editRating(ratingId, authorId, dto);
  }

  async getRatingForRespondent(ratingId: number, userId: number) {
    return this.ratingResponseService.getRatingForRespondent(ratingId, userId);
  }

  async fillRating(ratingId: number, userId: number, dto: FillRatingDto) {
    return this.ratingResponseService.fillRating(ratingId, userId, dto);
  }

  async getRatingForReview(ratingId: number, respondentId: number, reviewerId: number) {
    return this.ratingReviewService.getRatingForReview(ratingId, respondentId, reviewerId);
  }

  async reviewRating(ratingId: number, dto: RatingApprovalDto, userId: number) {
    return this.ratingReviewService.reviewRating(ratingId, dto, userId);
  }

  async getRatings() {
    return this.ratingQueryService.getRatings();
  }

  async getRatingDetails(ratingId: number) {
    return this.ratingQueryService.getRatingDetails(ratingId);
  }
  
}

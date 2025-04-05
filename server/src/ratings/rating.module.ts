import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RatingService } from './services/rating.service'
import { RatingController } from './controllers/rating.controller'

import { Rating } from '../entities/rating.entity'
import { User } from '../entities/user.entity'
import { RatingItem } from '../entities/rating-item.entity'
import { RatingApproval } from '../entities/rating-approval.entity'
import { Document } from 'src/entities/document.entity'
import { RatingParticipant } from '../entities/rating-participant.entity'
import { RatingResponse } from '../entities/rating-response.entity'
import { MailService } from '../mail/mail.service';
import { RatingCreationService } from './services/rating-creation.service'
import { RatingResponseService } from './services/rating-response.service'
import { RatingReviewService } from './services/rating-review.service'
import { RatingQueryService } from './services/rating-query.service'
import { RatingResponseController } from './controllers/rating-response.controller'
import { DocumentController } from './controllers/document.controller'
import { RatingReviewController } from './controllers/rating-review.controller'
import { DocumentService } from './services/document.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Rating,
      User,
      RatingItem,
      RatingApproval,
      RatingParticipant,
      RatingResponse,
      Document,
    ]),
  ],
  providers: [RatingService, MailService, RatingCreationService, RatingResponseService, RatingReviewService, RatingQueryService, DocumentService],
  controllers: [RatingController, RatingResponseController, RatingReviewController, DocumentController],
  exports: [RatingService,],
})
export class RatingsModule {}

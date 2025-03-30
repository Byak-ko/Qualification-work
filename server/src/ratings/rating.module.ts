import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RatingService } from './rating.service'
import { RatingController } from './rating.controller'

import { Rating } from '../entities/rating.entity'
import { User } from '../entities/user.entity'
import { RatingItem } from '../entities/rating-item.entity'
import { RatingApproval } from '../entities/rating-approval.entity'
import { Document } from 'src/entities/document.entity'
import { RatingParticipant } from '../entities/rating-participant.entity'
import { RatingResponse } from '../entities/rating-response.entity'

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
  providers: [RatingService],
  controllers: [RatingController],
  exports: [RatingService],
})
export class RatingsModule {}

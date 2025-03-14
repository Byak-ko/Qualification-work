import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RatingService } from './rating.service'
import { RatingController } from './rating.controller'

import { Rating } from '../entities/rating.entity'
import { User } from '../entities/user.entity'
import { RatingItem } from '../entities/rating-item.entity'
import { RatingApproval } from '../entities/rating-approval.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Rating,
      User,
      RatingItem,
      RatingApproval,
    ]),
  ],
  providers: [RatingService],
  controllers: [RatingController],
  exports: [RatingService],
})
export class RatingsModule {}

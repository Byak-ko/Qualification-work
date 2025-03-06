import { Module } from '@nestjs/common';
import { RatingItemsService } from './rating-items.service';
import { RatingItemsController } from './rating-items.controller';

@Module({
  providers: [RatingItemsService],
  controllers: [RatingItemsController]
})
export class RatingItemsModule {}

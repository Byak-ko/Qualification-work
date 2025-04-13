import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RatingCreationService } from '../services/rating-creation.service';

@Controller('ratings')
@UseGuards(AuthGuard('jwt'))
export class RatingFinalizationController {
  constructor(private ratingCreationService: RatingCreationService) {}

  @Post(':id/finalize')
  async finalizeRating(@Param('id') id: number) {
    return this.ratingCreationService.finalizeRating(id);
  }
}

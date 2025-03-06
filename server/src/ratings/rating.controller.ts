import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { RatingService } from './rating.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createRating(@Request() req, @Body() body) {
    return this.ratingService.createRating(req.user.id, body);
  }
}

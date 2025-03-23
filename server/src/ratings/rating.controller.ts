import { Controller, Post, Get, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { RatingService } from './rating.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Request } from 'express';
import { FillRespondentDto } from './dto/fill-respondent.dto';
import { RatingApprovalDto } from './dto/rating-approval.dto';

@UseGuards(JwtAuthGuard)
@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}
  @Get()
  async getRatings() {
    return this.ratingService.getRatings();
  }

  @Post()
  async createRating(@Body() dto: CreateRatingDto, @Req() req: Request) {
    const user = req.user as any;
    const authorId = user.id;

    const result = await this.ratingService.createRating(authorId, dto);
    return {
      message: 'Рейтинг успішно створено',
      ...result,
    };
  }

  @Get(':id/respondent')
async getRatingForRespondent(@Param('id') id: number, @Req() req: any) {
  return this.ratingService.getRatingForRespondent(+id, req.user.id);
}

@Post(':id/respondent-fill')
async fillByRespondent(@Param('id') id: number, @Body() dto: FillRespondentDto, @Req() req: any) {
  return this.ratingService.fillRatingByRespondent(+id, dto, req.user.id);
}

@Post(':id/review')
async reviewRating(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: RatingApprovalDto,
  @Req() req: Request,
) {
  const userId = req.user.id
  return this.ratingService.reviewRating(id, dto, userId);
}
}

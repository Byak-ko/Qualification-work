import { Controller, Post, Get, Body, Param, ParseIntPipe, Patch, UseGuards, Req } from '@nestjs/common';
import { RatingService } from './rating.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Request } from 'express';

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

 /* @Patch(':id/assign')
  async assignToRespondent(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignRatingDto) {
    return this.ratingService.assignToRespondent(id, dto);
  } */

   /* @Get(':id/fill')
    async getForRespondent(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
      const rating = await this.ratingRepository.findOne({
        where: {
          id,
          respondent: { id: req.user.id },
          status: 'in_progress',
        },
        relations: ['items', 'items.documents'],
      });

      if (!rating) throw new NotFoundException('Рейтинг не знайдено або недоступний');

      return rating;
    } */


}

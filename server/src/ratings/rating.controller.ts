import {
  Controller, Post, Get, Body, Param, UseGuards, Req, ParseIntPipe, Patch,
  NotFoundException, ForbiddenException, BadRequestException, UseInterceptors, UploadedFile
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Request } from 'express';
import { RatingApprovalDto } from './dto/rating-approval.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { File } from 'multer';

@UseGuards(JwtAuthGuard)
@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) { }
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

  @Post('documents/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: File) {
    const url = `/uploads/${file.filename}`;
    return { url };
  }


  @Get(':id')
  async getRatingDetails(@Param('id', ParseIntPipe) id: number) {
    return await this.ratingService.getRatingDetails(id);
  }

  @Patch(':id')
  async updateRating(
    @Param('id') id: number,
    @Req() req,
    @Body() dto: CreateRatingDto,
  ) {
    const authorId = req.user.id;

    try {
      const result = await this.ratingService.editRating(id, authorId, dto);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get(':id/respondent')
  async getRatingForRespondent(@Param('id') id: number, @Req() req: any) {
    return this.ratingService.getRatingForRespondent(+id, req.user.id);
  }
  
  

  @Post(':id/respondent-fill')
  async fillRating(
    @Param('id', ParseIntPipe) ratingId: number,
    @Req() req: Request,
    @Body() dto: { items: { id: number, score: number, documents: string[] }[] },
  ) {
    const userId = req.user.id;
    return this.ratingService.fillRating(ratingId, userId, dto);
  }


 @Get(':ratingId/review/:respondentId')
  async getRatingForReview(
    @Param('ratingId', ParseIntPipe) ratingId: number,
    @Param('respondentId', ParseIntPipe) respondentId: number,
    @Req() req: Request,
  ) {
    const reviewerId = req.user.id;
    return this.ratingService.getRatingForReview(ratingId, respondentId, reviewerId);
  }

  @Post(':ratingId/review/:respondentId')
  async reviewRating(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RatingApprovalDto,
    @Req() req: Request,
  ) {
    const userId = req.user.id
    return this.ratingService.reviewRating(id, dto, userId);
  }
}

import {
  Controller, Post, Get, Body, Param, UseGuards, Req, ParseIntPipe, Patch,
  NotFoundException, ForbiddenException, BadRequestException
} from '@nestjs/common';
import { RatingService } from '../services/rating.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateRatingDto } from '../dto/create-rating.dto';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { RatingApprovalCommentsDto } from '../dto/rating-approval.dto';

@ApiTags('ratings')
@UseGuards(JwtAuthGuard)
@Controller('ratings')
@ApiBearerAuth()
export class RatingController {
  constructor(private readonly ratingService: RatingService) { }

  @Get()
  @ApiOperation({
    summary: 'Отримати всі рейтинги',
    description: 'Повертає список всіх рейтингів у системі.',
  })
  @ApiResponse({ status: 200, description: 'Список рейтингів' })
  @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
  async getAllRatings() {
    return this.ratingService.getAllRatings();
  }

  @Get('user')
  @ApiOperation({
    summary: 'Отримати всі рейтинги пов\'язані з користувачем',
    description: 'Повертає рейтинги, де користувач є автором, учасником або перевіряючим'
  })
  @ApiResponse({ status: 200, description: 'Список рейтингів' })
  @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
  @ApiResponse({
    status: 404,
    description: 'Користувача не знайдено'
  })
  async getRatingsByUserId(@Req() req: Request) {
    const user = req.user as any;
    const userId = user.id;
    return this.ratingService.getRatingsByUserId(userId);
  }

  @Get('closed')
  @ApiOperation({
    summary: 'Отримати закриті рейтинги',
    description: 'Повертає список всіх закритих рейтингів у системі.',
  })
  @ApiResponse({ status: 200, description: 'Список закритих рейтингів' })
  @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
  async getClosedRatings() {
    return this.ratingService.getClosedRatings();
  }

  @Post()
  @ApiOperation({
    summary: 'Створити новий рейтинг',
    description: 'Створює новий рейтинг з наданими даними.',
  })
  @ApiBody({
    description: 'Дані для створення нового рейтингу',
    type: CreateRatingDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Рейтинг успішно створено',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Рейтинг успішно створено' },
        id: { type: 'number', example: 1 }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Невірні дані' })
  @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
  async createRating(@Body() dto: CreateRatingDto, @Req() req: Request) {
    const user = req.user as any;
    const authorId = user.id;
    const result = await this.ratingService.createRating(authorId, dto);
    return {
      message: 'Рейтинг успішно створено',
      ...result,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Отримати рейтинг за ID',
    description: 'Повертає детальну інформацію про рейтинг за його унікальним ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID рейтингу',
    required: true,
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'Деталі рейтингу' })
  @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
  @ApiResponse({ status: 404, description: 'Рейтинг не знайдено' })
  async getRatingDetails(@Param('id', ParseIntPipe) id: number) {
    return await this.ratingService.getRatingDetails(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Оновити рейтинг',
    description: 'Оновлює інформацію про рейтинг за наданим ID. Рейтинг може бути оновлений тільки його автором.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID рейтингу для оновлення',
    required: true,
    type: Number,
  })
  @ApiBody({
    description: 'Дані для оновлення рейтингу',
    type: CreateRatingDto,
  })
  @ApiResponse({ status: 200, description: 'Рейтинг успішно оновлено' })
  @ApiResponse({ status: 400, description: 'Невірні дані' })
  @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав для доступу (не є автором рейтингу)' })
  @ApiResponse({ status: 404, description: 'Рейтинг не знайдено' })
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

  @Get('participants/:participantId/approvals')
  async getParticipantApprovals(
    @Param('participantId', ParseIntPipe) participantId: number,
  ): Promise<RatingApprovalCommentsDto[]> {
    return this.ratingService.getParticipantApprovals(participantId);
  }

  @Post(':id/complete')
  async completeRating(@Param('id', ParseIntPipe) id: number) {
    return this.ratingService.completeRating(id);
  }
}
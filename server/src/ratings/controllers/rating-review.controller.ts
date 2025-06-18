import {
    Controller, Post, Get, Body, Param, UseGuards, Req, ParseIntPipe,
} from '@nestjs/common';
import { RatingService } from '../services/rating.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Request } from 'express';
import { RatingApprovalDto } from '../dto/rating-approval.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('ratings/review')
@UseGuards(JwtAuthGuard)
@Controller('ratings')
@ApiBearerAuth()
export class RatingReviewController {
    constructor(private readonly ratingService: RatingService) { }

    @Get(':ratingId/review/:respondentId')
    @ApiOperation({
        summary: 'Отримати рейтинг для перегляду',
        description: 'Повертає рейтинг, заповнений респондентом, для перегляду рецензентом.',
    })
    @ApiParam({
        name: 'ratingId',
        description: 'ID рейтингу',
        required: true,
        type: Number,
    })
    @ApiParam({
        name: 'respondentId',
        description: 'ID респондента (користувача, який заповнив рейтинг)',
        required: true,
        type: Number,
    })
    @ApiResponse({ status: 200, description: 'Рейтинг для перегляду' })
    @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
    @ApiResponse({ status: 403, description: 'Недостатньо прав для доступу' })
    @ApiResponse({ status: 404, description: 'Рейтинг або відповідь не знайдено' })
    async getRatingForReview(
        @Param('ratingId', ParseIntPipe) ratingId: number,
        @Param('respondentId', ParseIntPipe) respondentId: number,
        @Req() req: Request,
    ) {
        const reviewerId = req.user.id;
        return this.ratingService.getRatingForReview(ratingId, respondentId, reviewerId);
    }

    @Post(':ratingId/review/:respondentId')
    @ApiOperation({
        summary: 'Рецензувати заповнений рейтинг',
        description: 'Дозволяє рецензенту переглянути та затвердити або відхилити рейтинг, заповнений респондентом.',
    })
    @ApiParam({
        name: 'ratingId',
        description: 'ID рейтингу',
        required: true,
        type: Number,
    })
    @ApiParam({
        name: 'respondentId',
        description: 'ID респондента',
        required: true,
        type: Number,
    })
    @ApiBody({
        description: 'Дані для рецензування рейтингу',
        type: RatingApprovalDto,
    })
    @ApiResponse({ status: 200, description: 'Рейтинг успішно рецензовано' })
    @ApiResponse({ status: 400, description: 'Невірні дані' })
    @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
    @ApiResponse({ status: 403, description: 'Недостатньо прав для доступу' })
    @ApiResponse({ status: 404, description: 'Рейтинг або відповідь не знайдено' })
    async reviewRating(
        @Param('ratingId', ParseIntPipe) ratingId: number,
        @Body() dto: RatingApprovalDto,
        @Req() req: Request,
    ) {
        const userId = req.user.id
        const respondentId = parseInt(req.params.respondentId);
        return this.ratingService.reviewRating(ratingId, dto, userId, respondentId);
    }
}
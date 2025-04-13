import {
    Controller, Post, Get, Body, Param, UseGuards, Req, ParseIntPipe,
} from '@nestjs/common';
import { RatingService } from '../services/rating.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('ratings/response')
@UseGuards(JwtAuthGuard)
@Controller('ratings')
@ApiBearerAuth()
export class RatingResponseController {
    constructor(private readonly ratingService: RatingService) { }

    @Get(':id/respondent')
    @ApiOperation({
        summary: 'Отримати рейтинг для заповнення',
        description: 'Повертає рейтинг, який поточний користувач повинен заповнити як респондент.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID рейтингу',
        required: true,
        type: Number,
    })
    @ApiResponse({ status: 200, description: 'Рейтинг для заповнення' })
    @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
    @ApiResponse({ status: 403, description: 'Користувач не є респондентом цього рейтингу' })
    @ApiResponse({ status: 404, description: 'Рейтинг не знайдено' })
    async getRatingForRespondent(@Param('id') id: number, @Req() req: any) {
        return this.ratingService.getRatingForRespondent(+id, req.user.id);
    }

    @Post(':id/respondent-fill')
    @ApiOperation({
        summary: 'Заповнити рейтинг',
        description: 'Дозволяє респонденту заповнити рейтинг, вказавши бали та додавши документи для кожного пункту.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID рейтингу для заповнення',
        required: true,
        type: Number,
    })
    @ApiBody({
        description: 'Дані заповнення рейтингу',
        schema: {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1, description: 'ID пункту рейтингу' },
                            score: { type: 'number', example: 5, description: 'Оцінка за пунктом (бал)' },
                            documents: { 
                                type: 'array', 
                                items: { type: 'string' }, 
                                example: ['doc1.pdf', 'doc2.pdf'], 
                                description: 'Список документів, що підтверджують бал' 
                            }
                        },
                        required: ['id', 'score']
                    }
                }
            },
            required: ['items']
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Рейтинг успішно заповнено',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Рейтинг успішно заповнено' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Невірні дані або рейтинг вже заповнено' })
    @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
    @ApiResponse({ status: 403, description: 'Користувач не є респондентом цього рейтингу' })
    @ApiResponse({ status: 404, description: 'Рейтинг не знайдено' })
    async fillRating(
        @Param('id', ParseIntPipe) ratingId: number,
        @Req() req: Request,
        @Body() dto: { items: { id: number, score: number, documents: string[] }[] },
    ) {
        const userId = req.user.id;
        return this.ratingService.fillRating(ratingId, userId, dto);
    }

    @Post(':id/respondent-fill-send')
    async fillRespondentRating(
        @Param('id', ParseIntPipe) ratingId: number,
        @Req() req: Request,
    ) {
        const userId = req.user.id;
        return this.ratingService.fillRespondentRating(ratingId, userId);
    }
}
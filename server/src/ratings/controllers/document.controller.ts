import {
    Controller, Post, Get, Param, UseGuards, UseInterceptors, UploadedFile, NotFoundException, Delete
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService, fileFilter } from '../services/document.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiConsumes, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentController {
    constructor(private readonly documentService: DocumentService) { }
    
    @Post('upload')
    @ApiOperation({
        summary: 'Завантажити новий документ',
        description: 'Завантажує новий документ у систему. Для авторизованих користувачів.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Файл документа для завантаження',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Файл документа',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Документ успішно завантажено' })
    @ApiResponse({ status: 400, description: 'Помилка завантаження документа' })
    @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
    @UseInterceptors(
        FileInterceptor('file', {
          limits: {
            fileSize: 5 * 1024 * 1024,
          },
          fileFilter,
        })
      )
      async uploadDocument(@UploadedFile() file: File) {
        return await this.documentService.uploadDocument(file);
      }
    
    @Get(':id')
    @ApiOperation({
        summary: 'Отримати документ за ID',
        description: 'Повертає документ за його унікальним ID. Для авторизованих користувачів.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID документа',
        required: true,
        type: String,
    })
    @ApiResponse({ status: 200, description: 'Документ знайдено' })
    @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
    @ApiResponse({ status: 404, description: 'Документ не знайдено' })
    async getDocument(@Param('id') id: string) {
        const document = await this.documentService.getDocument(id);
        if (!document) {
            throw new NotFoundException('Документ не знайдено');
        }
        return document;
    }

    @Delete(':id/documents')
    @ApiOperation({ summary: 'Видалити всі документи рейтингу' })
    @ApiResponse({
      status: 200,
      description: 'Документи успішно видалено',
    })
    @ApiResponse({
      status: 404,
      description: 'Рейтинг не знайдено',
    })
    async deleteAllRatingDocuments(@Param('id') id: number) {
      return this.documentService.deleteAllRatingDocuments(id);
    }
}
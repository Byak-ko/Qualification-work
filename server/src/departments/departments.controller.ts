import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({
    summary: 'Отримати всі підрозділи',
    description: 'Повертає список всіх підрозділів.',
  })
  @ApiResponse({ status: 200, description: 'Список підрозділів успішно отримано' })
  @ApiResponse({ status: 500, description: 'Помилка сервера' })
  async getAllDepartments() {
    return this.departmentsService.findAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Створити новий підрозділ',
    description: 'Створює новий підрозділ з наданими даними.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Відділ розробки', description: 'Назва підрозділу' },
        unitId: { type: 'number', example: 1, description: 'ID підрозділу, до якого належить відділ' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Підрозділ успішно створено' })
  @ApiResponse({ status: 400, description: 'Невірні дані' })
  @ApiResponse({ status: 500, description: 'Помилка сервера' })
  async createDepartment(@Body() body: { name: string; unitId: number }) {
    return this.departmentsService.create(body);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Оновити підрозділ',
    description: 'Оновлює інформацію про підрозділ за наданим ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID підрозділу для оновлення',
    required: true,
    type: Number,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Відділ розробки', description: 'Нова назва підрозділу' },
        unitId: { type: 'number', example: 1, description: 'Новий ID підрозділу, до якого належить відділ' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Підрозділ успішно оновлено' })
  @ApiResponse({ status: 400, description: 'Невірні дані' })
  @ApiResponse({ status: 404, description: 'Підрозділ не знайдено' })
  @ApiResponse({ status: 500, description: 'Помилка сервера' })
  async updateDepartment(@Param('id') id: number, @Body() body: { name: string; unitId: number }) {
    return this.departmentsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Видалити підрозділ',
    description: 'Видаляє підрозділ за наданим ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID підрозділу для видалення',
    required: true,
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'Підрозділ успішно видалено' })
  @ApiResponse({ status: 404, description: 'Підрозділ не знайдено' })
  @ApiResponse({ status: 500, description: 'Помилка сервера' })
  async deleteDepartment(@Param('id') id: number) {
    return this.departmentsService.delete(id);
  }
}
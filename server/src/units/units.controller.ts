import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity'
import { UnitType } from 'src/entities/unit.entity';


@ApiTags('units')
@Controller('units')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @ApiOperation({ summary: 'Отримати всі підрозділи' })
  @ApiResponse({ status: 200, description: 'Список підрозділів університету' })
  @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
  @ApiResponse({ status: 500, description: 'Помилка сервера' })
  async getAllUnits() {
    return this.unitsService.findAll();
  }

  @Post()
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Створити новий підрозділ' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Факультет інформаційних технологій', description: 'Назва підрозділу' },
        type: { type: 'string', example: 'факультет', description: 'Тип підрозділу (наприклад, інститут, факультет)' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Підрозділ успішно створено' })
  @ApiResponse({ status: 400, description: 'Невірні дані' })
  @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав для доступу' })
  @ApiResponse({ status: 500, description: 'Помилка сервера' })
  async createUnit(@Body() body: { name: string; type: UnitType }) {
    console.log("Unit body", body);
    return this.unitsService.create(body);
  }

  @Patch(':id')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Оновити підрозділ за ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID підрозділу' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Факультет інформаційних технологій', description: 'Нова назва підрозділу' },
        type: { type: 'string', example: 'факультет', description: 'Новий тип підрозділу' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Підрозділ успішно оновлено' })
  @ApiResponse({ status: 400, description: 'Невірні дані' })
  @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав для доступу' })
  @ApiResponse({ status: 404, description: 'Підрозділ не знайдено' })
  @ApiResponse({ status: 500, description: 'Помилка сервера' })
  async updateUnit(@Param('id') id: number, @Body() body: { name: string; type: UnitType }) {
    return this.unitsService.update(id, body);
  }

  @Delete(':id')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Видалити підрозділ за ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID підрозділу' })
  @ApiResponse({ status: 200, description: 'Підрозділ успішно видалено' })
  @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав для доступу' })
  @ApiResponse({ status: 404, description: 'Підрозділ не знайдено' })
  @ApiResponse({ status: 500, description: 'Помилка сервера' })
  async deleteUnit(@Param('id') id: number) {
    return this.unitsService.delete(id);
  }
}
import { Controller, Get, Post, Patch, Req, Delete, Body, Param, UseGuards, ConflictException } from '@nestjs/common';
import { UserService } from './users.service';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../entities/user.entity';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Role(UserRole.ADMIN) 
  @ApiOperation({
    summary: 'Отримати всіх користувачів',
    description: 'Повертає список всіх користувачів у системі. Доступно тільки для адміністраторів.',
  })
  @ApiResponse({ status: 200, description: 'Список користувачів', type: [User] })
  @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав для доступу' })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('current')
  @ApiOperation({
    summary: 'Отримати поточного користувача',
    description: 'Повертає поточного користувача, який виконує запит.',
  })
  @ApiResponse({ status: 200, description: 'Поточний користувач знайдений', type: User })
  @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
  getCurrentUser(@Req() req) {
    return this.userService.findById(req.user.userId);
  }

  @Get(':id')
  @Role(UserRole.ADMIN) 
  @ApiOperation({
    summary: 'Отримати користувача за ID',
    description: 'Повертає користувача за його унікальним ID. Доступно тільки для адміністраторів.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID користувача',
    required: true,
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'Користувач знайдений', type: User })
  @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав для доступу' })
  @ApiResponse({ status: 404, description: 'Користувач не знайдений' })
  findOne(@Param('id') id: number): Promise<User> {
    return this.userService.findById(id);
  }

  @Post()
  @Role(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Створити нового користувача',
    description: 'Створює нового користувача в системі з наданими даними. Доступно тільки для адміністраторів.',
  })
  @ApiBody({
    description: 'Дані для створення нового користувача',
    type: CreateUserDto,
  })
  @ApiResponse({ status: 201, description: 'Користувач успішно створений', type: User })
  @ApiResponse({ status: 400, description: 'Невірні дані' })
  @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав для доступу' })
  @ApiResponse({ status: 409, description: 'Email вже використовується' })
  async create(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Цей email вже використовується');
    }
    return this.userService.create(createUserDto);
  }

  @Patch(':id')
  @Role(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Оновити дані користувача',
    description: 'Оновлює інформацію про користувача за наданим ID. Доступно тільки для адміністраторів.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID користувача для оновлення',
    required: true,
    type: Number,
  })
  @ApiBody({
    description: 'Дані для оновлення користувача',
    type: UpdateUserDto,
  })
  @ApiResponse({ status: 200, description: 'Користувач успішно оновлений', type: User })
  @ApiResponse({ status: 400, description: 'Невірні дані' })
  @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав для доступу' })
  @ApiResponse({ status: 404, description: 'Користувач не знайдений' })
  @ApiResponse({ status: 409, description: 'Email вже використовується' })
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    const existingUser = await this.userService.findByEmail(updateUserDto.email);
    if (existingUser && existingUser.id !== id) {
      throw new ConflictException('Цей email вже використовується');
    }
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Role(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Видалити користувача',
    description: 'Видаляє користувача за наданим ID. Доступно тільки для адміністраторів.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID користувача для видалення',
    required: true,
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'Користувач успішно видалений' })
  @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав для доступу' })
  @ApiResponse({ status: 404, description: 'Користувач не знайдений' })
  async remove(@Param('id') id: number) {
    return this.userService.delete(id);
  }
}
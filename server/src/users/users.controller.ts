import { Controller, Get, Post, Patch, Req, Delete, Body, Param, UseGuards, ConflictException } from '@nestjs/common';
import { UserService } from './users.service';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../entities/user.entity';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('current')
  getCurrentUser(@Req() req) {
    return this.userService.findById(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<User> {
    return this.userService.findById(id);
  }

  @Post()
  @Role(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Цей email вже використовується');
    }
    return this.userService.create(createUserDto);
  }

  @Patch(':id')
  @Role(UserRole.ADMIN)
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    const existingUser = await this.userService.findByEmail(updateUserDto.email);
    if (existingUser && existingUser.id !== id) {
      throw new ConflictException('Цей email вже використовується');
    }
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Role(UserRole.ADMIN)
  async remove(@Param('id') id: number) {
    return this.userService.delete(id)
  }
}

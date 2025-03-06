import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { UserService } from './users.service';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../entities/user.entity';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Post()
  @Role(UserRole.ADMIN)
  async createUser(
    @Body() 
    body: { 
      lastName: string; 
      firstName: string; 
      email: string; 
      password: string; 
      role: UserRole;
      departmentId: number;
      degree: string;
      position: string;
    }
  ) {
    if (!body.lastName || !body.firstName || !body.email || !body.password || !body.role || 
        !body.departmentId || !body.degree || !body.position) {
      throw new BadRequestException('Усі поля є обов’язковими');
    }

    if (!Object.values(UserRole).includes(body.role)) {
      throw new BadRequestException('Неправильна роль');
    }

    if (body.password.length < 6) {
      throw new BadRequestException('Пароль має бути не менше 6 символів');
    }

    return this.userService.create(body);
  }

  @Put(':id')
  @Role(UserRole.ADMIN)
  async updateUser(
    @Param('id') id: number,
    @Body() body: { 
      lastName?: string; 
      firstName?: string; 
      email?: string; 
      password?: string; 
      role?: UserRole;
      departmentId?: number;
      degree?: string;
      position?: string;
    }
  ) {
    return this.userService.update(id, body);
  }

  @Delete(':id')
  @Role(UserRole.ADMIN)
  async deleteUser(@Param('id') id: number) {
    return this.userService.delete(id);
  }
}

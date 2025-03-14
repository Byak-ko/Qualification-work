import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../entities/user.entity';
import { Department } from 'src/entities/department.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Department]),
  ],
  providers: [UserService],
  controllers: [UsersController],
  exports: [UserService],
})
export class UsersModule {}

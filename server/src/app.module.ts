import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Department } from './entities/department.entity';
import { Unit } from './entities/unit.entity';
import { Rating } from './entities/rating.entity';
import { RatingItem } from './entities/rating-item.entity';
import { RatingApproval } from './entities/rating-approval.entity';
import { Document } from './entities/document.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RatingsModule } from './ratings/rating.module';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UnitsModule } from './units/units.module';
import { DepartmentsModule } from './departments/departments.module';
import { DepartmentsController } from './departments/departments.controller';
import { DepartmentsService } from './departments/departments.service';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '11111111',
      database: 'qualification',
      entities: [User, Department, Unit, Rating, RatingItem, RatingApproval, Document], 
      autoLoadEntities: true,
      synchronize: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([User, Department, Unit, Rating, RatingItem, RatingApproval, Document]),
    UsersModule,
    AuthModule,
    RatingsModule,
    UnitsModule,
    DepartmentsModule,
    MailModule
  ],
  controllers: [AuthController, DepartmentsController],
  providers: [AuthService, DepartmentsService],
})
export class AppModule {}

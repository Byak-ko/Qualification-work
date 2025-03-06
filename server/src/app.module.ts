import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { RatingItemsModule } from './rating-items/rating-items.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '11111111',
      database: 'qualification',
      entities: [User, Department, Unit, Rating, RatingItem, RatingApproval, Document], //what to chose
      autoLoadEntities: true,
      synchronize: true, //production off?
    }),
    TypeOrmModule.forFeature([User, Department, Unit, Rating, RatingItem, RatingApproval, Document]),
    UsersModule,
    AuthModule,
    RatingsModule,
    RatingItemsModule,
  ],
})
export class AppModule {}

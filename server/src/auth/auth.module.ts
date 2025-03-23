import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from  '../entities/user.entity'
import { UserService } from 'src/users/users.service';
import { MailService } from 'src/mail/mail.service';
import { Department } from 'src/entities/department.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Department]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy, UserService, MailService],
  exports: [AuthService],
})
export class AuthModule {}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService
  ) {}
  private revokedTokens = new Set<number>();
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    throw new UnauthorizedException('Невірний логін або пароль');
  }

  async login(user: User) {
    const payload = { sub: user.id, role: user.role };
  
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });
  
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d', 
    });
  
    return {
      access_token: accessToken,
      refresh_token: refreshToken, 
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const newAccessToken = this.jwtService.sign(
        { sub: payload.sub, role: payload.role },
        { secret: process.env.JWT_SECRET, expiresIn: '15m' }
      );

      return { access_token: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
  

  async logout(userId: number) {
    this.revokedTokens.add(userId); 
  }

  isTokenRevoked(userId: number): boolean {
    return this.revokedTokens.has(userId);
  }
}

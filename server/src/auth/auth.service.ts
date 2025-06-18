import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserService } from "../users/users.service";
import * as bcrypt from 'bcrypt';
import { Response, Request } from 'express';
import { MailService } from "../mail/mail.service";
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mailService: MailService
  
  ) {}
  private revokedTokens = new Set<number>();
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    //no password check here, for testing purposes
    if (user ) { //&& await bcrypt.compare(password, user?.password) 
      return user;
    }
    throw new UnauthorizedException('Невірний логін або пароль');
  }

  async login(user: User, res: Response) {
    const payload = { sub: user.id, role: user.role };
  
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });
  
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
    });
  
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { message: 'Login successful' };
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies?.refresh_token;
  
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
  
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
  
      const newAccessToken = this.jwtService.sign(
        { sub: payload.sub, role: payload.role },
        { secret: process.env.JWT_SECRET, expiresIn: '15m' }
      );
  
      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 15 * 60 * 1000, 
      });
  
      return { access_token: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
  

  async logout(userId: number, res: Response) {
    this.revokedTokens.add(userId);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }

  isTokenRevoked(userId: number): boolean {
    return this.revokedTokens.has(userId);
  }

  async sendPasswordResetEmail(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException("Користувача з таким email не знайдено.");
    }

    const token = this.jwtService.sign(
      { userId: user.id },
      { secret: process.env.JWT_RESET_SECRET, expiresIn: "15m" }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.mailService.sendMail({
      to: email,
      subject: "Відновлення паролю",
      text: `Перейдіть за посиланням, щоб скинути пароль: ${resetLink}`,
      html: `<p>Перейдіть за <a href="${resetLink}">цим посиланням</a>, щоб скинути пароль.</p>`,
    });

    return { message: "Лист із інструкціями надіслано на email." };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload: any = this.jwtService.verify(token, { secret: process.env.JWT_RESET_SECRET });
      const user = await this.userService.findById(payload.userId);
      if (!user) throw new NotFoundException("Користувача не знайдено.");
      await this.userService.updatePassword(user.id, newPassword);

      return { message: "Пароль успішно змінено." };
    } catch (error) {
      throw new BadRequestException("Невалідний або прострочений токен.");
    }
  }
}

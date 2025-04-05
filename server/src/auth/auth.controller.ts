import { Controller, Post, Req, Body, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiOperation({
    summary: 'Увійти в систему',
    description: 'Автентифікує користувача за допомогою email та пароля.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'user@example.com', description: 'Електронна пошта користувача' },
        password: { type: 'string', example: 'password123', description: 'Пароль користувача' },
      },
    },
  })
  @ApiResponse({
    status: 200, 
    description: 'Успішна автентифікація', 
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Невірний email або пароль' })
  @ApiResponse({ status: 500, description: 'Помилка сервера' })
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const { email, password } = body;
    const user = await this.authService.validateUser(email, password);
    return this.authService.login(user, res);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Оновити токен доступу',
    description: 'Оновлює токен доступу за допомогою refresh токена.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['refreshToken'],
      properties: {
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Refresh токен' },
      },
    },
  })
  @ApiResponse({
    status: 200, 
    description: 'Токен успішно оновлено', 
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Невірний або прострочений refresh токен' })
  @ApiResponse({ status: 500, description: 'Помилка сервера' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refreshToken(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Вийти з системи',
    description: 'Видаляє токен доступу та завершує сесію користувача.',
  })
  @ApiResponse({
    status: 200, 
    description: 'Вихід з акаунту успішний', 
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Вихід з акаунту успішний'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Неавторизований користувач' })
  @ApiResponse({ status: 500, description: 'Помилка сервера' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Not authorized');
    await this.authService.logout(userId, res);
    return { message: 'Вихід з акаунту успішний' };
  }

  @Post("forgot-password")
  @ApiOperation({
    summary: 'Запит на відновлення пароля',
    description: 'Надсилає електронний лист із посиланням для скидання пароля на вказану адресу електронної пошти.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string', example: 'user@example.com', description: 'Електронна пошта користувача' },
      },
    },
  })
  @ApiResponse({
    status: 200, 
    description: 'Лист для відновлення пароля надіслано', 
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Інструкції для відновлення пароля надіслано на вашу електронну пошту' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Користувач з вказаною електронною поштою не знайдений' })
  @ApiResponse({ status: 500, description: 'Помилка сервера' })
  async forgotPassword(@Body("email") email: string) {
    return this.authService.sendPasswordResetEmail(email);
  }

  @Post("reset-password")
  @ApiOperation({
    summary: 'Скинути пароль',
    description: 'Скидає пароль користувача за допомогою токена, отриманого електронною поштою.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['token', 'newPassword'],
      properties: {
        token: { type: 'string', example: 'reset-token-123', description: 'Токен для скидання пароля' },
        newPassword: { type: 'string', example: 'newSecurePassword123', description: 'Новий пароль користувача' },
      },
    },
  })
  @ApiResponse({
    status: 200, 
    description: 'Пароль успішно змінено', 
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Пароль успішно змінено' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Невірний або прострочений токен' })
  @ApiResponse({ status: 500, description: 'Помилка сервера' })
  async resetPassword(
    @Body("token") token: string,
    @Body("newPassword") newPassword: string
  ) {
    return this.authService.resetPassword(token, newPassword);
  }
}
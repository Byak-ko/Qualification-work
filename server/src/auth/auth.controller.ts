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
      properties: {
        email: { type: 'string', example: 'user@example.com', description: 'Електронна пошта користувача' },
        password: { type: 'string', example: 'password123', description: 'Пароль користувача' },
      },
    },
  })
  @ApiResponse({
    status: 200, description: 'Успішна автентифікація', schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' }
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
      properties: {
        refreshToken: { type: 'string', example: 'your-refresh-token', description: 'Refresh токен' },
      },
    },
  })
  @ApiResponse({
    status: 200, description: 'Токен успішно оновлено', schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' }
      }
    }
  }
  )
  @ApiResponse({ status: 401, description: 'Невірний refresh токен' })
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
    status: 200, description: 'Вихід з акаунту успішний', schema: {
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
    return { message: 'Logout successful' };
  }

  @Post("forgot-password")
  async forgotPassword(@Body("email") email: string) {
    return this.authService.sendPasswordResetEmail(email);
  }

  @Post("reset-password")
  async resetPassword(
    @Body("token") token: string,
    @Body("newPassword") newPassword: string
  ) {
    return this.authService.resetPassword(token, newPassword);
  }
}
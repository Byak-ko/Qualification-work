import { Controller, Post, Req, Request, Body, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @ApiResponse({ status: 200, description: 'Успішна автентифікація', schema: { 
    type: 'object', 
    properties: { 
      accessToken: { type: 'string' }, 
      refreshToken: { type: 'string' } 
    } 
  }
})
  @ApiResponse({ status: 401, description: 'Невірний email або пароль' })
  @ApiResponse({ status: 500, description: 'Помилка сервера' })
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    const user = await this.authService.validateUser(email, password);
    return this.authService.login(user);
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
  @ApiResponse({ status: 200, description: 'Токен успішно оновлено', schema: { 
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
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth() 
  @ApiOperation({
    summary: 'Вийти з системи',
    description: 'Видаляє токен доступу та завершує сесію користувача.',
  })
  @ApiResponse({ status: 200, description: 'Вихід з акаунту успішний', schema: { 
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
  async logout(@Request() req, @Res() res: Response) {
    if (!req.user) {
      return res.status(401).json({ message: 'Неавторизований користувач' });
    }

    await this.authService.logout(req.user.userId);
    res.clearCookie('jwt');

    return res.status(200).json({ message: 'Вихід з акаунту успішний' });
  }
}
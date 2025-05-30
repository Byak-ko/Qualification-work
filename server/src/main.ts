import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    forbidNonWhitelisted: true,
    transform: true 
  }));
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL,  
    credentials: true,  
  });
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const config = new DocumentBuilder()
    .setTitle('Teacher rating system API')
    .setDescription('A system of teacher rating with multi-level verification of higher education institutions')
    .setVersion('1.0')
    .addBearerAuth() 
    .addTag('users', 'Операції з користувачами') 
    .addTag('ratings', 'Операції з рейтингами')
    .addTag('auth', 'Авторизація та аутентифікація')
    .build();
  
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document); 
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
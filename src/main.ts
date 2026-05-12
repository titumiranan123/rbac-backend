import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests',
    }),
  );
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: false,
      forbidNonWhitelisted: false,
    }),
  );
  const configService = app.get(ConfigService);
  const corsOrigin =
    configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000';
  app.enableCors({ origin: corsOrigin, credentials: true });
  const port = configService.get<string>('PORT') || '3000';
  const host = '0.0.0.0';
  await app.listen(port, host);
  console.log(`Application is running on: http://${host}:${port}/api`);
}
void bootstrap();

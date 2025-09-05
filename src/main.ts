import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';

import { SanitizationMiddleware } from './middleware/sanitization.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  // app.use(
  //   helmet({
  //     contentSecurityPolicy: {
  //       directives: {
  //         defaultSrc: ["'self'"],
  //         styleSrc: ["'self'", "'unsafe-inline'"],
  //         scriptSrc: ["'self'"],
  //         imgSrc: ["'self'", 'data:', 'https:'],
  //       },
  //     },
  //     hsts: {
  //       maxAge: 31536000,
  //       includeSubDomains: true,
  //     },
  //   }),
  // );

  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com']
        : ['http://localhost:3000', 'http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  // app.use(new SanitizationMiddleware());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties not in DTO
      forbidNonWhitelisted: true, // throws error if extra properties are sent
      transform: true, // auto-transforms payloads to DTO instances
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { setDefaultResultOrder } from 'node:dns';

async function bootstrap() {
  setDefaultResultOrder('ipv4first');
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const isProduction = process.env.NODE_ENV === 'production';

  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (isProduction) {
    logger.log('Running in production mode');
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Taska Backend API')
    .setDescription('REST API documentation for Taska backend services')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const configuredOrigins =
    process.env.CORS_ORIGINS ||
    process.env.CORS_ORIGIN ||
    process.env.FRONTEND_URL ||
    '';

  const corsOrigins = configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const defaultOrigins = [
    'https://taska-rho.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];

  const allowedOrigins = Array.from(new Set([...corsOrigins, ...defaultOrigins]));

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = Number(process.env.PORT) || 8000;
  await app.listen(port);

  const baseUrl =
    process.env.APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    `http://localhost:${port}`;

  logger.log(`Undocumented API URL: ${baseUrl}`);
  logger.log(`Documented API URL (Swagger): ${baseUrl}/api/docs`);
}
bootstrap();

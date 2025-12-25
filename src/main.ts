import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: '', method: RequestMethod.GET }],
  });

  const config = new DocumentBuilder()
    .setTitle('Backend API')
    .setDescription('API kết nối Frontend')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Đường dẫn vào xem swagger sẽ là /api
  SwaggerModule.setup('api', app, document);

  // 4. Bật CORS (để Flutter hoặc Web gọi được mà không bị chặn)
  app.enableCors();

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();

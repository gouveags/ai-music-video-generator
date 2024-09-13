import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const appOptions = { cors: true };
  const app = await NestFactory.create(AppModule, appOptions);
  app.setGlobalPrefix('api');

  const options = new DocumentBuilder()
    .setTitle('AI Music Video Generator')
    .setDescription(
      'AI Music Video Generator automates music video creation using AI for lyrics, images, music, and video. It integrates OpenAI for lyrics, DALL-E for images, Suno for music, and FFmpeg for video processing, with automatic uploads to YouTube and TikTok.',
    )
    .setVersion('0.1')
    .setBasePath('api')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(3000);
}
bootstrap();

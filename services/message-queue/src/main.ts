import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('MessageQueueService');
  
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    
    // 启用CORS
    app.enableCors();
    
    // 全局验证管道
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    
    const port = configService.get('port') || 3007;
    await app.listen(port);
    
    logger.log(`🚀 Message Queue Service is running on port ${port}`);
    logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`📊 Bull Board: http://localhost:${port}${configService.get('bullBoard.path')}`);
  } catch (error) {
    logger.error('❌ Error starting Message Queue Service', error);
    process.exit(1);
  }
}

bootstrap();
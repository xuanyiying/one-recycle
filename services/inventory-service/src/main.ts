import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用CORS
  app.enableCors();
  
  // 设置全局前缀
  app.setGlobalPrefix('api/v1');
  
  const port = process.env.PORT || 3006;
  await app.listen(port);
  console.log(`Inventory Service is running on: http://localhost:${port}`);
}
bootstrap();
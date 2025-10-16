import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    // 启用全局验证管道
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    
    const port = process.env.PORT || 3005;
    await app.listen(port);
    console.log(`Courier service is running on: http://localhost:${port}`);
}
bootstrap();
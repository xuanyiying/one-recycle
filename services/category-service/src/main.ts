import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    
    // 全局异常过滤器
    app.useGlobalFilters(new GlobalExceptionFilter());
    
    // 全局验证管道
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    
    app.setGlobalPrefix('api');
    
    // 配置静态文件服务
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });
    
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
    await app.listen(port);
    console.log(`Category service is running on: http://localhost:${port}`);
}
bootstrap();
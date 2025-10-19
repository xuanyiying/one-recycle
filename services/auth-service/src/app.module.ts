import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisModule } from '@one-recycle/shared';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // 限流模块
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1分钟
      limit: 100, // 每分钟最多100个请求
    }]),
    
    // Redis模块
    RedisModule,
    
    // 业务模块
    AuthModule,
  ],
})
export class AppModule {}
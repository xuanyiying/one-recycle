import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';

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
    
    // 数据库模块
    PrismaModule,
    
    // 业务模块
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
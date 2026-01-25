import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthRedisService } from './auth-redis.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { WeChatPlatform } from '@/modules/auth/platforms';
import { AlipayPlatform } from '@/modules/auth/platforms';
import { TikTokPlatform } from '@/modules/auth/platforms';
import { KuaishouPlatform } from '@/modules/auth/platforms';
import { AccountClient } from './clients/account.client';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '15m');
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: parseInt(expiresIn), // 类型断言以解决版本兼容性问题
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthRedisService,
    JwtStrategy,
    JwtAuthGuard,
    WeChatPlatform,
    AlipayPlatform,
    TikTokPlatform,
    KuaishouPlatform,
    AccountClient,
  ],
  exports: [AuthRedisService, JwtAuthGuard],
})
export class AuthModule {}

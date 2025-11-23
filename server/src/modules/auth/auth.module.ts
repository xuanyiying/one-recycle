import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthRedisService } from './auth-redis.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { WeChatPlatform } from './platforms/wechat.platform';
import { AlipayPlatform } from './platforms/alipay.platform';
import { TikTokPlatform } from './platforms/tiktok.platform';
import { KuaishouPlatform } from './platforms/kuaishou.platform';
import { AccountClient } from './clients/account.client';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '15m');
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: expiresIn as any, // 类型断言以解决版本兼容性问题
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
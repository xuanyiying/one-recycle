import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { WeChatPlatform } from './platforms/wechat.platform';
import { AlipayPlatform } from './platforms/alipay.platform';
import { TikTokPlatform } from './platforms/tiktok.platform';
import { KuaishouPlatform } from './platforms/kuaishou.platform';
import { AccountClient } from './clients/account.client';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    WeChatPlatform,
    AlipayPlatform,
    TikTokPlatform,
    KuaishouPlatform,
    AccountClient,
  ],
  exports: [AuthService],
})
export class AuthModule {}
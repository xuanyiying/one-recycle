import {
  AlipayPlatform,
  KuaishouPlatform,
  TikTokPlatform,
  WeChatPlatform,
} from '@/modules/auth/platforms';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import AuthRedisService from './auth-redis.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    forwardRef(() => UserModule),
    NotificationModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret && configService.get<string>('NODE_ENV') === 'production') {
          throw new Error('JWT_SECRET must be set in production environment');
        }
        if (!secret) {
          console.warn('[WARN] Using fallback JWT secret - DO NOT use in production!');
        }
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '15m');
        const parsedExpiresIn: number | string = /^\d+$/.test(expiresIn)
          ? parseInt(expiresIn, 10)
          : expiresIn;
        return {
          secret: secret || 'dev-only-secret-key-DO-NOT-USE-IN-PRODUCTION',
          signOptions: {
            expiresIn: parsedExpiresIn as any,
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
  ],
  exports: [AuthRedisService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}

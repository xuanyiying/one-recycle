import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import AuthRedisService from './auth-redis.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { WeChatPlatform } from '@/modules/auth/platforms';
import { AlipayPlatform } from '@/modules/auth/platforms';
import { TikTokPlatform } from '@/modules/auth/platforms';
import { KuaishouPlatform } from '@/modules/auth/platforms';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';

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
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '15m');
        return {
          secret: secret || 'dev-only-secret-key',
          signOptions: {
            expiresIn: parseInt(expiresIn),
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

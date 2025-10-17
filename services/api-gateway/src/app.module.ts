import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayController } from './gateway/gateway.controller';
import { LoadBalancerService } from './services/load-balancer.service';
import { ProxyService } from './services/proxy.service';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { AuthMiddleware } from './middleware/auth.middleware';
import { gatewayConfig } from './config/gateway.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [gatewayConfig],
    }),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: configService.get<number>('rateLimit.ttl') * 1000,
            limit: configService.get<number>('rateLimit.limit'),
          },
        ],
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<number>('jwt.expiresIn') || 3600,
        },
      }),
    }),
  ],
  controllers: [
    AppController,
    GatewayController,
  ],
  providers: [
    AppService,
    LoadBalancerService,
    ProxyService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('*');
    
    consumer
      .apply(AuthMiddleware)
      .forRoutes('api/*');
  }
}
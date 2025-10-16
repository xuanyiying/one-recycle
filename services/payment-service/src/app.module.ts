import { Module } from '@nestjs/common';
import { PaymentModule } from './payment/payment.module';
import { AccountModule } from './account/account.module';
import { WithdrawalModule } from './withdrawal/withdrawal.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { JwtStrategy } from './common/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '15m' },
    }),
    PrismaModule,
    PaymentModule,
    AccountModule,
    WithdrawalModule,
  ],
  controllers: [AppController],
  providers: [JwtStrategy],
})
export class AppModule {}
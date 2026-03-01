import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { VoiceOrderController } from './voice-order.controller';
import { VoiceOrderService } from './services/voice-order.service';
import { DialogTemplateService } from './services/dialog-template.service';
import { IntentEngine } from './engines/intent.engine';
import { EntityEngine } from './engines/entity.engine';
import { DialogFlowEngine } from './engines/dialog-flow.engine';
import { ASRProvider } from './providers/asr.provider';
import { AddressParser } from './utils/address-parser.util';
import { QuantityParser } from './utils/quantity-parser.util';
import { PrismaModule } from '@/prisma/prisma.module';
import { RedisModule } from '@/common/redis/redis.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    HttpModule,
    PrismaModule,
    RedisModule,
    ConfigModule,
    forwardRef(() => OrderModule),
  ],
  controllers: [VoiceOrderController],
  providers: [
    VoiceOrderService,
    DialogTemplateService,
    IntentEngine,
    EntityEngine,
    DialogFlowEngine,
    ASRProvider,
    AddressParser,
    QuantityParser,
  ],
  exports: [VoiceOrderService],
})
export class VoiceOrderModule {}

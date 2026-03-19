import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { VoiceOrderController } from './voice-order.controller';
import { VoiceOrderService } from './services/voice-order.service';
import { DialogTemplateService } from './services/dialog-template.service';
import { ASRProvider } from './providers/asr.provider';
import { AddressParser } from './utils/address-parser.util';
import { QuantityParser } from './utils/quantity-parser.util';
import { PrismaModule } from '@/prisma/prisma.module';
import { RedisModule } from '@/common/redis/redis.module';
import { OrderModule } from '../order/order.module';
import { AIModule } from '../ai/ai.module';

// AI 子模块
import {
  AIVoiceOrderService,
  IntentEngine,
  EntityEngine,
  DialogFlowEngine,
} from './ai';

@Module({
  imports: [
    HttpModule,
    PrismaModule,
    RedisModule,
    ConfigModule,
    AIModule,
    forwardRef(() => OrderModule),
  ],
  controllers: [VoiceOrderController],
  providers: [
    VoiceOrderService,
    DialogTemplateService,
    AIVoiceOrderService,
    IntentEngine,
    EntityEngine,
    DialogFlowEngine,
    ASRProvider,
    AddressParser,
    QuantityParser,
  ],
  exports: [VoiceOrderService, AIVoiceOrderService],
})
export class VoiceOrderModule {}

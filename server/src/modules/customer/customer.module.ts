import { Module } from '@nestjs/common';
import { CustomerServiceController } from './customer.controller';
import { SessionService } from './services/session.service';
import { MessageService } from './services/message.service';
import { AIReplyService } from './services/ai-reply.service';
import { TicketService } from './services/ticket.service';
import { KnowledgeService } from './services/knowledge.service';
import { QuickReplyService } from './services/quick-reply.service';
import { AICustomerService } from './services/ai-customer.service';
import { CustomerServiceGateway } from './gateway/customer.gateway';
import { PrismaModule } from '@/prisma/prisma.module';
import { RedisModule } from '@/common/redis/redis.module';
import { OrderModule } from '../order/order.module';
import { AuthModule } from '../auth/auth.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, RedisModule, OrderModule, AuthModule, AIModule],
  controllers: [CustomerServiceController],
  providers: [
    SessionService,
    MessageService,
    AIReplyService,
    TicketService,
    KnowledgeService,
    QuickReplyService,
    AICustomerService,
    CustomerServiceGateway,
  ],
  exports: [
    SessionService,
    MessageService,
    AIReplyService,
    TicketService,
    KnowledgeService,
    QuickReplyService,
    AICustomerService,
  ],
})
export class CustomerServiceModule {}

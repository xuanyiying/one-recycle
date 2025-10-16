# Message Queue Integration for Order Service

## Overview
This document describes how to integrate the message queue to publish `order-completed` events when an order status changes to COMPLETED.

## Integration Steps

### 1. Install Required Dependencies
```bash
cd services/order-service
npm install axios
```

### 2. Create Message Queue Client

Create a new file: `src/clients/message-queue.client.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface OrderCompletedEvent {
  orderId: string;
  userId: string;
  settlementAmount: number;
  completedAt: string;
  courierId?: string;
}

@Injectable()
export class MessageQueueClient {
  private readonly logger = new Logger(MessageQueueClient.name);
  private readonly httpClient: AxiosInstance;
  private readonly baseURL: string;

  constructor(private readonly configService: ConfigService) {
    this.baseURL = this.configService.get<string>('MESSAGE_QUEUE_URL') || 'http://localhost:3010';
    
    this.httpClient = axios.create({
      baseURL: this.baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Publish order completed event
   */
  async publishOrderCompleted(event: OrderCompletedEvent): Promise<void> {
    try {
      this.logger.log(`Publishing order completed event: ${event.orderId}`);
      
      await this.httpClient.post('/queue/order/completed', event);
      
      this.logger.log(`Order completed event published successfully: ${event.orderId}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish order completed event: ${event.orderId}`,
        error.message
      );
      // Don't throw error to prevent order update failure
      // The event can be republished later if needed
    }
  }
}
```

### 3. Update Order Module

Add the MessageQueueClient to your order module providers:

```typescript
// src/order/order.module.ts
import { MessageQueueClient } from '../clients/message-queue.client';

@Module({
  imports: [
    // ... existing imports
  ],
  providers: [
    OrderService,
    MessageQueueClient,
    // ... other providers
  ],
  exports: [OrderService],
})
export class OrderModule {}
```

### 4. Update Order Service

Inject and use the MessageQueueClient in your OrderService:

```typescript
// src/order/services/order.service.ts
import { MessageQueueClient } from '../../clients/message-queue.client';

@Injectable()
export class OrderService implements IOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messageQueueClient: MessageQueueClient,
  ) {}

  async update(id: number, data: UpdateOrderData): Promise<OrderEntity> {
    const updateData: any = {};
    
    // ... existing update logic
    
    const order = await this.prisma.order.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        items: true,
        assignments: true,
      },
    });

    const orderEntity = this.mapToOrderEntity(order);

    // Publish order completed event if status changed to COMPLETED
    if (data.status === OrderStatus.COMPLETED) {
      await this.publishOrderCompletedEvent(orderEntity);
    }

    return orderEntity;
  }

  private async publishOrderCompletedEvent(order: OrderEntity): Promise<void> {
    try {
      await this.messageQueueClient.publishOrderCompleted({
        orderId: order.orderNo,
        userId: order.userId.toString(),
        settlementAmount: order.settlementAmount || order.estimatedAmount,
        completedAt: new Date().toISOString(),
        courierId: order.assignments?.[0]?.courierId?.toString(),
      });
    } catch (error) {
      this.logger.error(
        `Failed to publish order completed event for order ${order.id}`,
        error
      );
      // Log but don't throw - event publishing failure shouldn't block order update
    }
  }
}
```

### 5. Add Environment Variable

Add to `.env`:
```
MESSAGE_QUEUE_URL=http://localhost:3010
```

### 6. Create Message Queue API Endpoint (in message-queue service)

Create a controller to receive events from order-service:

```typescript
// services/message-queue/src/queue/queue.controller.ts
import { Controller, Post, Body, Logger } from '@nestjs/common';
import { OrderQueueService } from './services/order-queue.service';
import { OrderCompletedEventDto } from './dto/order-events.dto';

@Controller('queue/order')
export class QueueController {
  private readonly logger = new Logger(QueueController.name);

  constructor(
    private readonly orderQueueService: OrderQueueService,
  ) {}

  @Post('completed')
  async handleOrderCompleted(@Body() data: OrderCompletedEventDto): Promise<{ success: boolean }> {
    this.logger.log(`Received order completed event: ${data.orderId}`);
    
    await this.orderQueueService.handleOrderCompleted(data);
    
    return { success: true };
  }
}
```

## Testing

### 1. Start Services
```bash
# Terminal 1: Start message-queue service
cd services/message-queue
npm run start:dev

# Terminal 2: Start payment-service
cd services/payment-service
npm run start:dev

# Terminal 3: Start order-service
cd services/order-service
npm run start:dev
```

### 2. Test Order Completion Flow

Use the order-service API to update an order status to COMPLETED:

```bash
curl -X PATCH http://localhost:3003/orders/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "settlementAmount": 100.50
  }'
```

### 3. Verify Results

Check the logs to verify:
1. Order-service publishes the event
2. Message-queue receives and processes the event
3. Payment-service increases the user balance
4. Transaction record is created

You can also check the database:
```sql
-- Check account balance
SELECT * FROM accounts WHERE user_id = 1;

-- Check transaction records
SELECT * FROM transactions WHERE order_id = 'ORDER_NO' ORDER BY created_at DESC;
```

## Error Handling

The integration includes several error handling mechanisms:

1. **Idempotency**: The payment-service checks if an order has already been credited
2. **Retry Mechanism**: Bull Queue automatically retries failed jobs (3 attempts with exponential backoff)
3. **Non-blocking**: Event publishing failures don't block order updates
4. **Logging**: All steps are logged for debugging

## Monitoring

Monitor the message queue dashboard at: http://localhost:3010/admin/queues

This shows:
- Pending jobs
- Active jobs
- Completed jobs
- Failed jobs
- Job details and error messages

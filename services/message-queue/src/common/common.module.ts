import { Module, Global } from '@nestjs/common';
import { IdempotencyService } from './services/idempotency.service';

@Global()
@Module({
  providers: [IdempotencyService],
  exports: [IdempotencyService],
})
export class CommonModule {}
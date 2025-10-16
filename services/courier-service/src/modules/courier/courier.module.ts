import { Module } from '@nestjs/common';
import { CourierController } from './controllers/courier.controller';
import { CourierService } from './services/courier.service';

@Module({
  controllers: [CourierController],
  providers: [CourierService],
  exports: [CourierService],
})
export class CourierModule {}
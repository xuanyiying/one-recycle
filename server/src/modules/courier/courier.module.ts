import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { CourierService } from './services/courier.service';
import { CourierController } from './controllers/courier.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CourierController],
  providers: [CourierService],
  exports: [CourierService],
})
export class CourierModule {}


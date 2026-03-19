import { Module } from '@nestjs/common';
import { CustomerUserController } from './customer-user.controller';
import { CustomerUserService } from './customer-user.service';
import { PointsRecordService } from '../points/services/points-record.service';

@Module({
  controllers: [CustomerUserController],
  providers: [CustomerUserService, PointsRecordService],
  exports: [CustomerUserService],
})
export class CustomerUserModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PointsRecordService } from '../points/services/points-record.service';
import { CustomerUserController } from './customer-user.controller';
import { CustomerUserService } from './customer-user.service';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerUserController],
  providers: [CustomerUserService, PointsRecordService],
  exports: [CustomerUserService],
})
export class CustomerUserModule { }

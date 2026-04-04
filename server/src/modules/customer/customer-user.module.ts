import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PointsRecordService } from '../points/services/points-record.service';
import { CustomerUserController } from './customer-user.controller';
import { CustomerUserService } from './customer-user.service';

/**
 * 客服用户模块
 *
 * 管理客服人员的后台操作，包括：
 * - 客服用户管理
 * - 积分记录查询
 * - 客服操作日志
 *
 * @module CustomerUserModule
 */
@Module({
  imports: [PrismaModule],
  controllers: [CustomerUserController],
  providers: [CustomerUserService, PointsRecordService],
  exports: [CustomerUserService],
})
export class CustomerUserModule {}

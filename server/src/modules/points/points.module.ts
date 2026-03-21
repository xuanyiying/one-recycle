import { Module } from '@nestjs/common';
import { PointsController } from './points.controller';
import { PointsAdminController } from './points-admin.controller';
import { PointsService } from './points.service';
import { PointsProductService } from './services/points-product.service';
import { PointsOrderService } from './services/points-order.service';
import { PointsRecordService } from './services/points-record.service';
import { SignInService } from './services/sign-in.service';
import { PointsTaskService } from './services/points-task.service';
import { InviteService } from './services/invite.service';
import { ReferralRewardService } from './services/referral-reward.service';
import { PointsMallConfigService } from './services/points-mall-config.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PointsController, PointsAdminController],
  providers: [
    PointsService,
    PointsProductService,
    PointsOrderService,
    PointsRecordService,
    SignInService,
    PointsTaskService,
    InviteService,
    ReferralRewardService,
    PointsMallConfigService,
  ],
  exports: [
    PointsService,
    PointsProductService,
    PointsOrderService,
    PointsRecordService,
    SignInService,
    PointsTaskService,
    InviteService,
    ReferralRewardService,
    PointsMallConfigService,
  ],
})
export class PointsModule {}

import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { PointsAdminController } from './points-admin.controller';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';
import { ReferralController } from './referral.controller';
import { InviteService } from './services/invite.service';
import { PointsOrderService } from './services/points-order.service';
import { PointsProductService } from './services/points-product.service';
import { PointsRecordService } from './services/points-record.service';
import { PointsTaskService } from './services/points-task.service';
import { ReferralRewardService } from './services/referral-reward.service';
import { SignInService } from './services/sign-in.service';

@Module({
  imports: [PrismaModule],
  controllers: [PointsController, PointsAdminController, ReferralController],
  providers: [
    PointsService,
    PointsProductService,
    PointsOrderService,
    PointsRecordService,
    SignInService,
    PointsTaskService,
    InviteService,
    ReferralRewardService,
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
  ],
})
export class PointsModule { }

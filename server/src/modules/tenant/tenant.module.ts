import { Module, forwardRef } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { SettlementService } from './settlement.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { StaffService } from './services/staff.service';
import { AuthController } from './controllers/auth.controller';
import { StaffController } from './controllers/staff.controller';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '@/common/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule, forwardRef(() => AuthModule)],
  controllers: [AuthController, StaffController],
  providers: [TenantService, SettlementService, StaffService],
  exports: [TenantService, SettlementService, StaffService],
})
export class TenantModule {}

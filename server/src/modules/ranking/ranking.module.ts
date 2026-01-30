import { Module } from '@nestjs/common';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { SystemModule } from '../system/system.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [SystemModule, PrismaModule],
  controllers: [RankingController],
  providers: [RankingService],
})
export class RankingModule {}

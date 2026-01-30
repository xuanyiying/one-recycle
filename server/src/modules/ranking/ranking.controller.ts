import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RankingService } from './ranking.service';
import { RankingQueryDto, RankingResponseDto } from './dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { UserId } from '@/common/decorators/auth.decorator';

@ApiTags('ranking')
@Controller('eco-ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get()
  @ApiOperation({ summary: '获取环保榜单' })
  @ApiResponse({ status: 200, type: [RankingResponseDto] })
  getRankings(@Query() query: RankingQueryDto) {
    return this.rankingService.getRankings(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的排名' })
  @ApiResponse({ status: 200, type: RankingResponseDto })
  getMyRank(@UserId() userId: bigint, @Query() query: RankingQueryDto) {
    return this.rankingService.getMyRank(userId, query);
  }
}

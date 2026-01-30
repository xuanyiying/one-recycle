import { Controller, Get, UseFilters, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { SystemService } from './system.service';
import {
  BannerResponseDto,
  ArticleResponseDto,
  QAResponseDto,
  RankingResponseDto,
} from './dto';
import { GlobalExceptionFilter } from '../../common/filters/global-exception.filter';
import { CACHE_TTL } from '@/common';

@ApiTags('system')
@Controller('system')
@UseFilters(GlobalExceptionFilter)
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('banners')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(CACHE_TTL.SHORT)
  @ApiOperation({ summary: '获取轮播图列表' })
  @ApiResponse({ status: 200, type: [BannerResponseDto] })
  getBanners(): BannerResponseDto[] {
    return this.systemService.getBanners();
  }

  @Get('articles')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(CACHE_TTL.SHORT)
  @ApiOperation({ summary: '获取文章列表' })
  @ApiResponse({ status: 200, type: [ArticleResponseDto] })
  getArticles(): ArticleResponseDto[] {
    return this.systemService.getArticles();
  }

  @Get('news-briefs')
  @ApiOperation({ summary: '获取简讯列表 (Mock)' })
  @ApiResponse({ status: 200 })
  getNewsBriefs() {
    return this.systemService.getNewsBriefs();
  }

  @Get('qa')
  @ApiOperation({ summary: '获取问答列表' })
  @ApiResponse({ status: 200, type: [QAResponseDto] })
  getQA() {
    return this.systemService.getQA();
  }

  @Get('rankings')
  @ApiOperation({ summary: '获取环保榜单' })
  @ApiResponse({ status: 200, type: [RankingResponseDto] })
  getRankings() {
    return this.systemService.getRankings();
  }
}

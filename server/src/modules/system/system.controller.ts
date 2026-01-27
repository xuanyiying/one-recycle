import { Controller, Get, UseFilters, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { SystemService } from './system.service';
import { BannerResponseDto, ArticleResponseDto } from './dto';
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
  async getBanners(): Promise<BannerResponseDto[]> {
    return this.systemService.getBanners();
  }

  @Get('articles')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(CACHE_TTL.SHORT)
  @ApiOperation({ summary: '获取文章列表' })
  @ApiResponse({ status: 200, type: [ArticleResponseDto] })
  async getArticles(): Promise<ArticleResponseDto[]> {
    return this.systemService.getArticles();
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ContentConfigService } from './content-config.service';
import {
  CreateFAQDto,
  UpdateFAQDto,
  QueryFAQDto,
  CreateRecycleRuleDto,
  UpdateRecycleRuleDto,
  QueryRecycleRuleDto,
} from './dto';
import { CACHE_TTL } from '@/common';

@ApiTags('content-config')
@Controller('content-config')
export class ContentConfigController {
  constructor(private readonly contentConfigService: ContentConfigService) {}

  // ==================== FAQ 公开接口 ====================

  @Get('faqs')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(CACHE_TTL.SHORT)
  @ApiOperation({ summary: '获取启用的FAQ列表（公开）' })
  @ApiResponse({ status: 200, description: '返回FAQ列表' })
  async getActiveFAQs() {
    return this.contentConfigService.getActiveFAQs();
  }

  @Get('faqs/categories')
  @ApiOperation({ summary: '获取FAQ分类统计' })
  @ApiResponse({ status: 200, description: '返回分类统计' })
  async getFAQCategories() {
    return this.contentConfigService.getFAQCategories();
  }

  // ==================== FAQ 管理接口 ====================

  @Get('admin/faqs')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取FAQ列表（管理端）' })
  @ApiResponse({ status: 200, description: '返回FAQ列表' })
  async findAllFAQs(@Query() dto: QueryFAQDto) {
    return this.contentConfigService.findAllFAQ(dto);
  }

  @Get('admin/faqs/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取单个FAQ详情' })
  @ApiResponse({ status: 200, description: '返回FAQ详情' })
  async findOneFAQ(@Param('id') id: string) {
    return this.contentConfigService.findOneFAQ(id);
  }

  @Post('admin/faqs')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建FAQ' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createFAQ(@Body() dto: CreateFAQDto) {
    return this.contentConfigService.createFAQ(dto);
  }

  @Put('admin/faqs/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新FAQ' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateFAQ(@Param('id') id: string, @Body() dto: UpdateFAQDto) {
    return this.contentConfigService.updateFAQ(id, dto);
  }

  @Delete('admin/faqs/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除FAQ' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteFAQ(@Param('id') id: string) {
    await this.contentConfigService.deleteFAQ(id);
    return { success: true };
  }

  // ==================== 回收规则公开接口 ====================

  @Get('recycle-rules')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(CACHE_TTL.SHORT)
  @ApiOperation({ summary: '获取启用的回收规则列表（公开）' })
  @ApiResponse({ status: 200, description: '返回回收规则列表' })
  async getActiveRecycleRules() {
    return this.contentConfigService.getActiveRecycleRules();
  }

  @Get('recycle-rules/categories')
  @ApiOperation({ summary: '获取回收规则分类统计' })
  @ApiResponse({ status: 200, description: '返回分类统计' })
  async getRecycleRuleCategories() {
    return this.contentConfigService.getRecycleRuleCategories();
  }

  // ==================== 回收规则管理接口 ====================

  @Get('admin/recycle-rules')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取回收规则列表（管理端）' })
  @ApiResponse({ status: 200, description: '返回回收规则列表' })
  async findAllRecycleRules(@Query() dto: QueryRecycleRuleDto) {
    return this.contentConfigService.findAllRecycleRules(dto);
  }

  @Get('admin/recycle-rules/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取单个回收规则详情' })
  @ApiResponse({ status: 200, description: '返回回收规则详情' })
  async findOneRecycleRule(@Param('id') id: string) {
    return this.contentConfigService.findOneRecycleRule(id);
  }

  @Post('admin/recycle-rules')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建回收规则' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createRecycleRule(@Body() dto: CreateRecycleRuleDto) {
    return this.contentConfigService.createRecycleRule(dto);
  }

  @Put('admin/recycle-rules/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新回收规则' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateRecycleRule(
    @Param('id') id: string,
    @Body() dto: UpdateRecycleRuleDto,
  ) {
    return this.contentConfigService.updateRecycleRule(id, dto);
  }

  @Delete('admin/recycle-rules/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除回收规则' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteRecycleRule(@Param('id') id: string) {
    await this.contentConfigService.deleteRecycleRule(id);
    return { success: true };
  }
}

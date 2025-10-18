import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { QueryCategoryDto, CategoryTreeDto, BatchOperationDto } from '../dto/query-category.dto';
import { CategoryEntity, CategoryTreeEntity, CategorySearchResultEntity, CategoryBatchResultEntity } from '../entities/category.entity';
import { CreateCategoryData, UpdateCategoryData, CategoryFilters, CategoryTreeOptions, BatchOperationOptions, FileUploadResult, CategorySortOptions, PaginationOptions } from '../interfaces/category.interface';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * 创建分类
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
    const categoryData: CreateCategoryData = {
      name: createCategoryDto.name,
      description: createCategoryDto.description,
      type: createCategoryDto.type,
      parentId: createCategoryDto.parentId,
      priceInfo: createCategoryDto.priceInfo,
      icon: createCategoryDto.icon,
      sortOrder: createCategoryDto.sortOrder,
      isVisible: createCategoryDto.isVisible,
      isFeatured: createCategoryDto.isFeatured,
      seo: createCategoryDto.seo,
      attributes: createCategoryDto.attributes
    };

    return await this.categoryService.create(categoryData);
  }

  /**
   * 获取所有分类（分页）
   */
  @Get()
  async findAll(@Query() query: QueryCategoryDto): Promise<CategorySearchResultEntity> {
    const filters: CategoryFilters = {
      type: query.type,
      status: query.status,
      parentId: query.parentId,
      isVisible: query.isVisible,
      isFeatured: query.isFeatured,
      level: query.level,
      priceRange: query.priceRange ? {
        min: query.priceRange.min,
        max: query.priceRange.max
      } : undefined,
      keyword: query.keyword,
      tags: query.tags,
      createdAfter: query.createdAfter ? new Date(query.createdAfter) : undefined,
      createdBefore: query.createdBefore ? new Date(query.createdBefore) : undefined,
      updatedAfter: query.updatedAfter ? new Date(query.updatedAfter) : undefined,
      updatedBefore: query.updatedBefore ? new Date(query.updatedBefore) : undefined
    };

    const sortOptions: CategorySortOptions = {
      field: (query.sortField as any) || 'createdAt',
      direction: query.sortDirection || 'desc'
    };

    const paginationOptions: PaginationOptions = {
      page: query.page || 1,
      pageSize: query.pageSize || 10
    };

    return await this.categoryService.findAll(filters, sortOptions, paginationOptions);
  }

  /**
   * 根据ID获取分类
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CategoryEntity> {
    const category = await this.categoryService.findById(id);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    return category;
  }

  /**
   * 更新分类
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto
  ): Promise<CategoryEntity> {
    const updateData: UpdateCategoryData = {
      name: updateCategoryDto.name,
      description: updateCategoryDto.description,
      type: updateCategoryDto.type,
      parentId: updateCategoryDto.parentId,
      priceInfo: updateCategoryDto.priceInfo,
      icon: updateCategoryDto.icon,
      sortOrder: updateCategoryDto.sortOrder,
      isVisible: updateCategoryDto.isVisible,
      isFeatured: updateCategoryDto.isFeatured,
      seo: updateCategoryDto.seo,
      attributes: updateCategoryDto.attributes
    };

    const category = await this.categoryService.update(id, updateData);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    return category;
  }

  /**
   * 删除分类
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const success = await this.categoryService.delete(id);
    if (!success) {
      throw new NotFoundException('分类不存在');
    }
  }

  /**
   * 获取分类树
   */
  @Get('tree/all')
  async getTree(@Query() query: CategoryTreeDto): Promise<CategoryTreeEntity[]> {
    const options: CategoryTreeOptions = {
      maxDepth: query.maxDepth,
      includeStats: query.includeStats || false,
      includeInactive: query.includeInactive || false,
      rootId: query.rootId
    };

    return await this.categoryService.getTree(options);
  }

  /**
   * 获取子分类
   */
  @Get(':id/children')
  async getChildren(@Param('id', ParseIntPipe) id: number): Promise<CategoryEntity[]> {
    return await this.categoryService.getChildren(id);
  }

  /**
   * 获取父分类路径
   */
  @Get(':id/parents')
  async getParents(@Param('id', ParseIntPipe) id: number): Promise<CategoryEntity[]> {
    return await this.categoryService.getParents(id);
  }

  /**
   * 获取分类路径
   */
  @Get(':id/path')
  async getPath(@Param('id', ParseIntPipe) id: number): Promise<CategoryEntity[]> {
    return await this.categoryService.getPath(id);
  }

  /**
   * 移动分类
   */
  @Put(':id/move')
  async move(
    @Param('id', ParseIntPipe) id: number,
    @Body('newParentId') newParentId: number
  ): Promise<CategoryEntity> {
    const category = await this.categoryService.moveCategory(id, newParentId);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    return category;
  }

  /**
   * 按类型查找分类
   */
  @Get('type/:type')
  async findByType(@Param('type') type: string): Promise<CategoryEntity[]> {
    return await this.categoryService.findByType(type as any);
  }

  /**
   * 获取活跃分类
   */
  @Get('status/active')
  async findActive(): Promise<CategoryEntity[]> {
    return await this.categoryService.findActive();
  }

  /**
   * 获取推荐分类
   */
  @Get('featured/all')
  async findFeatured(): Promise<CategoryEntity[]> {
    return await this.categoryService.findFeatured();
  }

  /**
   * 搜索分类
   */
  @Get('search/:keyword')
  async search(
    @Param('keyword') keyword: string,
    @Query() query: QueryCategoryDto
  ): Promise<CategorySearchResultEntity> {
    const filters: CategoryFilters = {
      type: query.type,
      status: query.status,
      parentId: query.parentId,
      isVisible: query.isVisible,
      isFeatured: query.isFeatured
    };

    const paginationOptions: PaginationOptions = {
      page: query.page || 1,
      pageSize: query.pageSize || 10
    };

    return await this.categoryService.search(keyword, filters, paginationOptions);
  }

  /**
   * 根据slug查找分类
   */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<CategoryEntity> {
    const category = await this.categoryService.findBySlug(slug);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    return category;
  }

  /**
   * 批量更新分类
   */
  @Put('batch/update')
  async batchUpdate(@Body() batchDto: BatchOperationDto): Promise<CategoryBatchResultEntity> {
    const options: BatchOperationOptions = {
      ids: batchDto.ids,
      operation: batchDto.operation as any,
      data: batchDto.data
    };

    return await this.categoryService.batchUpdate(options);
  }

  /**
   * 批量删除分类
   */
  @Delete('batch/delete')
  async batchDelete(@Body() batchDto: BatchOperationDto): Promise<CategoryBatchResultEntity> {
    return await this.categoryService.batchDelete(batchDto.ids);
  }

  /**
   * 获取分类统计
   */
  @Get(':id/stats')
  async getStats(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.getStats(id);
  }

  /**
   * 更新分类统计
   */
  @Put(':id/stats')
  async updateStats(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.updateStats(id);
  }

  /**
   * 获取热门分类
   */
  @Get('popular/top')
  async getPopular(@Query('limit') limit?: string): Promise<CategoryEntity[]> {
    const limitNum = limit ? parseInt(limit) : 10;
    return await this.categoryService.getPopularCategories(limitNum);
  }

  /**
   * 上传分类图标
   */
  @Post(':id/icon')
  async uploadIcon(
    @Param('id', ParseIntPipe) id: number,
    @Body() fileData: any
  ): Promise<FileUploadResult> {
    if (!fileData) {
      throw new BadRequestException('请提供文件数据');
    }

    return await this.categoryService.uploadIcon(fileData);
  }

  /**
   * 删除分类图标
   */
  @Delete(':id/icon')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteIcon(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const success = await this.categoryService.deleteIcon(String(id));
    if (!success) {
      throw new NotFoundException('分类不存在或图标不存在');
    }
  }

  /**
   * 验证slug唯一性
   */
  @Get('validate/slug/:slug')
  async validateSlug(@Param('slug') slug: string): Promise<{ isValid: boolean }> {
    const isValid = await this.categoryService.validateSlug(slug);
    return { isValid };
  }

  /**
   * 验证层级关系
   */
  @Get('validate/hierarchy/:parentId/:childId')
  async validateHierarchy(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Param('childId', ParseIntPipe) childId: number
  ): Promise<{ isValid: boolean }> {
    const isValid = await this.categoryService.validateHierarchy(parentId, childId);
    return { isValid };
  }

  /**
   * 清除缓存
   */
  @Delete('cache/clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCache(): Promise<void> {
    await this.categoryService.clearCache();
  }

  /**
   * 健康检查
   */
  @Get('health/check')
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }

  // 兼容旧版API
  /**
   * 获取回收分类（兼容旧版）
   */
  @Get('recycle/all')
  async getRecycleCategories(): Promise<CategoryEntity[]> {
    return await this.categoryService.findByType('recycle' as any);
  }

  /**
   * 获取销售分类（兼容旧版）
   */
  @Get('sale/all')
  async getSaleCategories(): Promise<CategoryEntity[]> {
    return await this.categoryService.findByType('sale' as any);
  }
}
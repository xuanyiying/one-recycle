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
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  QueryCategoryDto,
  CategoryResponseDto,
  CategoryListResponseDto,
  CategoryType,
} from '../dto';

@ApiTags('categories')
@Controller('category/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: '创建分类' })
  @ApiResponse({ status: 201, type: CategoryResponseDto })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // 5分钟缓存
  @ApiOperation({ summary: '获取分类列表' })
  @ApiResponse({ status: 200, type: CategoryListResponseDto })
  async findMany(
    @Query() query: QueryCategoryDto,
  ): Promise<CategoryListResponseDto> {
    return this.categoryService.findMany(query);
  }

  @Get('active')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @ApiOperation({ summary: '获取所有启用的分类' })
  @ApiResponse({ status: 200, type: [CategoryResponseDto] })
  async findActive(): Promise<CategoryResponseDto[]> {
    const query: QueryCategoryDto = {
      isVisible: true,
      page: 1,
      limit: 100,
    };
    const result = await this.categoryService.findMany(query);
    return result.items;
  }

  @Get('featured')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @ApiOperation({ summary: '获取推荐分类' })
  @ApiResponse({ status: 200, type: [CategoryResponseDto] })
  async findFeatured(): Promise<CategoryResponseDto[]> {
    const query: QueryCategoryDto = {
      isFeatured: true,
      isVisible: true,
      page: 1,
      limit: 10,
    };
    const result = await this.categoryService.findMany(query);
    return result.items;
  }

  @Get('tree')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @ApiOperation({ summary: '获取分类树' })
  @ApiResponse({ status: 200, type: [CategoryResponseDto] })
  async getTree(): Promise<CategoryResponseDto[]> {
    return this.categoryService.findTree();
  }

  @Get('type/:type')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @ApiOperation({ summary: '根据类型获取分类' })
  @ApiResponse({ status: 200, type: [CategoryResponseDto] })
  async findByType(
    @Param('type') type: string,
  ): Promise<CategoryResponseDto[]> {
    const query: Partial<QueryCategoryDto> = { type: type as CategoryType };
    const result = await this.categoryService.findMany(
      query as QueryCategoryDto,
    );
    return result.items;
  }

  @Get('parent/:parentId')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @ApiOperation({ summary: '获取子分类' })
  @ApiResponse({ status: 200, type: [CategoryResponseDto] })
  async findByParent(
    @Param('parentId') parentId: number,
  ): Promise<CategoryResponseDto[]> {
    const query: Partial<QueryCategoryDto> = {
      parentId: parentId,
      page: 1,
      limit: 20,
    };
    const result = await this.categoryService.findMany(
      query as QueryCategoryDto,
    );
    return result.items;
  }

  @Get(':id')
  @ApiOperation({ summary: '获取分类详情' })
  @ApiResponse({ status: 200, type: CategoryResponseDto })
  async findOne(@Param('id') id: number): Promise<CategoryResponseDto> {
    return this.categoryService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新分类' })
  @ApiResponse({ status: 200, type: CategoryResponseDto })
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除分类' })
  @ApiResponse({ status: 200 })
  async remove(@Param('id') id: number): Promise<void> {
    return this.categoryService.remove(id);
  }
}

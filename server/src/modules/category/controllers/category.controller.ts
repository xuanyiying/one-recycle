import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseFilters
} from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import {
    CreateCategoryDto,
    UpdateCategoryDto,
    QueryCategoryDto,
    CategoryResponseDto,
    CategoryListResponseDto, CategoryType
} from '../dto';
import { GlobalExceptionFilter } from '../../../common/filters/global-exception.filter';

@Controller('categories')
@UseFilters(GlobalExceptionFilter)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  async findMany(@Query() query: QueryCategoryDto): Promise<CategoryListResponseDto> {
    return this.categoryService.findMany(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<CategoryResponseDto> {
    return this.categoryService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto
  ): Promise<CategoryResponseDto> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.categoryService.remove(id);
  }

  @Get('tree')
  async getTree(): Promise<CategoryResponseDto[]> {
    return this.categoryService.findTree();
  }

  @Get('type/:type')
  async findByType(@Param('type') type: string): Promise<CategoryResponseDto[]> {
    const query: Partial<QueryCategoryDto> = { type: type as CategoryType };
    const result = await this.categoryService.findMany(query as QueryCategoryDto);
    return result.items;
  }

  @Get('parent/:parentId')
  async findByParent(@Param('parentId') parentId: number): Promise<CategoryResponseDto[]> {
    const query: Partial<QueryCategoryDto> = { parentId: parentId, page: 1, limit: 20 };
    const result = await this.categoryService.findMany(query as QueryCategoryDto);
    return result.items;
  }
}
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoryWarehouseService } from './category-warehouse.service';
import {
  CreateCategoryWarehouseDto,
  UpdateCategoryWarehouseDto,
  CategoryWarehouseResponseDto,
} from './dto';

@Controller('category-warehouse')
export class CategoryWarehouseController {
  constructor(private readonly service: CategoryWarehouseService) {}

  @Post()
  async create(
    @Body() dto: CreateCategoryWarehouseDto,
  ): Promise<CategoryWarehouseResponseDto> {
    return this.service.create(dto);
  }

  @Get()
  async findAll(): Promise<CategoryWarehouseResponseDto[]> {
    return this.service.findAll();
  }

  @Get('by-category/:categoryId')
  async findByCategoryId(
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<CategoryWarehouseResponseDto | null> {
    return this.service.findByCategoryId(categoryId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryWarehouseDto,
  ): Promise<CategoryWarehouseResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}

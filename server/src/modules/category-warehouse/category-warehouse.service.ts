import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCategoryWarehouseDto,
  UpdateCategoryWarehouseDto,
  CategoryWarehouseResponseDto,
} from './dto';

@Injectable()
export class CategoryWarehouseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateCategoryWarehouseDto,
  ): Promise<CategoryWarehouseResponseDto> {
    const existing = await this.prisma.categoryWarehouseConfig.findUnique({
      where: { categoryId: dto.categoryId },
    });

    if (existing) {
      throw new ConflictException('该分类已配置仓库');
    }

    const config = await this.prisma.categoryWarehouseConfig.create({
      data: {
        categoryId: dto.categoryId,
        warehouseId: dto.warehouseId,
        isActive: dto.isActive ?? true,
      },
      include: {
        category: true,
        warehouse: true,
      },
    });

    return this.mapToResponseDto(config);
  }

  async findAll(): Promise<CategoryWarehouseResponseDto[]> {
    const configs = await this.prisma.categoryWarehouseConfig.findMany({
      include: {
        category: true,
        warehouse: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return configs.map((config) => this.mapToResponseDto(config));
  }

  async findByCategoryId(
    categoryId: number,
  ): Promise<CategoryWarehouseResponseDto | null> {
    const config = await this.prisma.categoryWarehouseConfig.findUnique({
      where: { categoryId },
      include: {
        category: true,
        warehouse: true,
      },
    });

    if (!config) {
      return null;
    }

    return this.mapToResponseDto(config);
  }

  async findActiveByCategoryId(
    categoryId: number,
  ): Promise<CategoryWarehouseResponseDto | null> {
    const config = await this.prisma.categoryWarehouseConfig.findFirst({
      where: {
        categoryId,
        isActive: true,
      },
      include: {
        category: true,
        warehouse: true,
      },
    });

    if (!config) {
      return null;
    }

    return this.mapToResponseDto(config);
  }

  async update(
    id: number,
    dto: UpdateCategoryWarehouseDto,
  ): Promise<CategoryWarehouseResponseDto> {
    const existing = await this.prisma.categoryWarehouseConfig.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('配置不存在');
    }

    const config = await this.prisma.categoryWarehouseConfig.update({
      where: { id },
      data: {
        warehouseId: dto.warehouseId,
        isActive: dto.isActive,
      },
      include: {
        category: true,
        warehouse: true,
      },
    });

    return this.mapToResponseDto(config);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.prisma.categoryWarehouseConfig.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('配置不存在');
    }

    await this.prisma.categoryWarehouseConfig.delete({
      where: { id },
    });
  }

  private mapToResponseDto(config: any): CategoryWarehouseResponseDto {
    return {
      id: Number(config.id),
      categoryId: config.categoryId,
      categoryName: config.category?.name || '',
      warehouseId: Number(config.warehouseId),
      warehouseName: config.warehouse?.name || '',
      warehouseAddress: config.warehouse?.address || '',
      isActive: config.isActive,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }
}

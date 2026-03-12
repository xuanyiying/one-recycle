import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  PointsProduct,
  ProductStatus,
  ProductType,
  Prisma,
} from '@prisma/client';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { QueryProductDto } from '../dto/query-product.dto';

@Injectable()
export class PointsProductService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建商品（管理员）
   */
  async create(dto: CreateProductDto): Promise<PointsProduct> {
    return this.prisma.pointsProduct.create({
      data: {
        name: dto.name,
        description: dto.description,
        coverImage: dto.coverImage,
        images: dto.images || [],
        type: dto.type || ProductType.VIRTUAL,
        points: dto.points,
        stock: dto.stock,
        soldCount: 0,
        status: dto.status || ProductStatus.ACTIVE,
        sortOrder: dto.sortOrder || 0,
        categoryId: dto.categoryId,
        extraData: dto.extraData,
      },
    });
  }

  /**
   * 更新商品（管理员）
   */
  async update(id: bigint, dto: UpdateProductDto): Promise<PointsProduct> {
    const product = await this.prisma.pointsProduct.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`商品不存在: ${id}`);
    }

    return this.prisma.pointsProduct.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        coverImage: dto.coverImage,
        images: dto.images,
        type: dto.type,
        points: dto.points,
        stock: dto.stock,
        status: dto.status,
        sortOrder: dto.sortOrder,
        categoryId: dto.categoryId,
        extraData: dto.extraData,
      },
    });
  }

  /**
   * 删除商品（管理员）- 软删除，改为下架状态
   */
  async remove(id: bigint): Promise<PointsProduct> {
    const product = await this.prisma.pointsProduct.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`商品不存在: ${id}`);
    }

    return this.prisma.pointsProduct.update({
      where: { id },
      data: { status: ProductStatus.INACTIVE },
    });
  }

  /**
   * 获取商品详情
   */
  async findOne(id: bigint): Promise<PointsProduct | null> {
    return this.prisma.pointsProduct.findUnique({
      where: { id },
    });
  }

  /**
   * 获取商品列表（用户端）
   */
  async findList(query: QueryProductDto) {
    const { page = 1, limit = 20, status, type, categoryId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PointsProductWhereInput = {
      status: status || ProductStatus.ACTIVE,
    };

    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [data, total] = await Promise.all([
      this.prisma.pointsProduct.findMany({
        where,
        orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.pointsProduct.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取所有商品（管理员）
   */
  async findAll(query: QueryProductDto) {
    const { page = 1, limit = 20, status, type, categoryId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PointsProductWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [data, total] = await Promise.all([
      this.prisma.pointsProduct.findMany({
        where,
        orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.pointsProduct.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 扣减库存
   */
  async decreaseStock(
    productId: bigint,
    quantity: number,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    const client = tx || this.prisma;

    const result = await client.pointsProduct.updateMany({
      where: {
        id: productId,
        stock: { gte: quantity },
      },
      data: {
        stock: { decrement: quantity },
        soldCount: { increment: quantity },
      },
    });

    return result.count > 0;
  }

  /**
   * 恢复库存
   */
  async increaseStock(
    productId: bigint,
    quantity: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx || this.prisma;

    await client.pointsProduct.update({
      where: { id: productId },
      data: {
        stock: { increment: quantity },
        soldCount: { decrement: quantity },
      },
    });
  }

  /**
   * 获取商品分类列表
   */
  async getCategories() {
    return this.prisma.pointsProductCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'desc' },
    });
  }
}

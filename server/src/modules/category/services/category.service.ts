import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  QueryCategoryDto,
  CategoryResponseDto,
  CategoryListResponseDto,
  CategoryType,
} from '../dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    // 检查slug是否已存在
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        seo: {
          contains: `"slug":"${createCategoryDto.seo.slug}"`,
        },
      },
    });

    if (existingCategory) {
      throw new Error('分类slug已存在');
    }

    // 计算层级和路径
    let level = 0;
    let path = '0';

    if (createCategoryDto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: createCategoryDto.parentId },
      });

      if (parent) {
        level = parent.level + 1;
        path = `${parent.path}/${parent.id}`;
      }
    }

    const category = await this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        description: createCategoryDto.description,
        type: createCategoryDto.type,
        parentId: createCategoryDto.parentId,
        priceInfo: JSON.stringify(createCategoryDto.priceInfo),
        icon: createCategoryDto.iconUrl,
        sortOrder: createCategoryDto.sortOrder,
        isVisible: createCategoryDto.isVisible,
        isFeatured: createCategoryDto.isFeatured,
        level: level,
        path: path,
        seo: JSON.stringify(createCategoryDto.seo),
        attributes: createCategoryDto.attributes
          ? JSON.stringify(createCategoryDto.attributes)
          : null,
      },
    });

    return this.mapToCategoryResponse(category);
  }

  async findOne(id: number): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new Error('分类不存在');
    }

    return this.mapToCategoryResponse(category);
  }

  async findMany(query: QueryCategoryDto): Promise<CategoryListResponseDto> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ...filters
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    // 检查 QueryCategoryDto 中实际存在的属性
    if ('name' in filters && filters.name) {
      where.name = { contains: filters.name };
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.parentId !== undefined) {
      where.parentId = filters.parentId;
    }

    if (filters.isVisible !== undefined) {
      where.isVisible = filters.isVisible;
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters.keyword) {
      where.OR = [
        { name: { contains: filters.keyword } },
        { description: { contains: filters.keyword } },
      ];
    }

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      items: categories.map((category) => this.mapToCategoryResponse(category)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    // 检查分类是否存在
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new Error('分类不存在');
    }

    // 如果更新了slug，检查是否已存在
    if (
      updateCategoryDto.seo?.slug &&
      updateCategoryDto.seo.slug !== JSON.parse(existingCategory.seo).slug
    ) {
      const slugExists = await this.prisma.category.findFirst({
        where: {
          id: { not: id },
          seo: {
            contains: `"slug":"${updateCategoryDto.seo.slug}"`,
          },
        },
      });

      if (slugExists) {
        throw new Error('分类slug已存在');
      }
    }

    // 准备更新数据
    const updateData: any = {};

    if (updateCategoryDto.name !== undefined)
      updateData.name = updateCategoryDto.name;
    if (updateCategoryDto.description !== undefined)
      updateData.description = updateCategoryDto.description;
    if (updateCategoryDto.type !== undefined)
      updateData.type = updateCategoryDto.type;
    if (updateCategoryDto.parentId !== undefined)
      updateData.parentId = updateCategoryDto.parentId;
    if (updateCategoryDto.priceInfo !== undefined)
      updateData.priceInfo = JSON.stringify(updateCategoryDto.priceInfo);
    if (updateCategoryDto.iconUrl !== undefined)
      updateData.icon = updateCategoryDto.iconUrl;
    if (updateCategoryDto.sortOrder !== undefined)
      updateData.sortOrder = updateCategoryDto.sortOrder;
    if (updateCategoryDto.isVisible !== undefined)
      updateData.isVisible = updateCategoryDto.isVisible;
    if (updateCategoryDto.isFeatured !== undefined)
      updateData.isFeatured = updateCategoryDto.isFeatured;
    if (updateCategoryDto.seo !== undefined)
      updateData.seo = JSON.stringify(updateCategoryDto.seo);
    if (updateCategoryDto.attributes !== undefined)
      updateData.attributes = updateCategoryDto.attributes
        ? JSON.stringify(updateCategoryDto.attributes)
        : null;

    // 如果更新了父分类，需要重新计算层级和路径
    if (
      updateCategoryDto.parentId !== undefined &&
      updateCategoryDto.parentId !== existingCategory.parentId
    ) {
      let level = 0;
      let path = '0';

      if (updateCategoryDto.parentId) {
        const parent = await this.prisma.category.findUnique({
          where: { id: updateCategoryDto.parentId },
        });

        if (parent) {
          level = parent.level + 1;
          path = `${parent.path}/${parent.id}`;
        }
      }

      updateData.level = level;
      updateData.path = path;
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: updateData,
    });

    return this.mapToCategoryResponse(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new Error('分类不存在');
    }

    // 检查是否有子分类
    const childrenCount = await this.prisma.category.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new Error('存在子分类，无法删除');
    }

    await this.prisma.category.delete({
      where: { id },
    });
  }

  async findTree(
    parentId: number | null = null,
  ): Promise<CategoryResponseDto[]> {
    const categories = await this.prisma.category.findMany({
      where: { parentId },
      orderBy: { sortOrder: 'asc' },
    });

    const result: CategoryResponseDto[] = [];
    for (const category of categories) {
      const categoryDto = this.mapToCategoryResponse(category);
      // 递归获取子分类
      if (categoryDto.parentId === null || categoryDto.parentId === parentId) {
        const children = await this.findTree(category.id);
        // 注意：这里为了简化没有添加children属性，实际项目中可以扩展
      }
      result.push(categoryDto);
    }

    return result;
  }

  private mapToCategoryResponse(data: any): CategoryResponseDto {
    return {
      id: data.id.toString(),
      name: data.name,
      description: data.description,
      type: data.type as CategoryType,
      parentId: data.parentId,
      priceInfo: data.priceInfo ? JSON.parse(data.priceInfo) : undefined,
      iconUrl: data.icon,
      sortOrder: data.sortOrder,
      isVisible: data.isVisible,
      isFeatured: data.isFeatured,
      level: data.level,
      path: data.path,
      seo: data.seo ? JSON.parse(data.seo) : undefined,
      attributes: data.attributes ? JSON.parse(data.attributes) : undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}

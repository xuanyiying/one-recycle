import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { FAQCategory, RecycleRuleCategory, Prisma } from '@prisma/client';
import {
  CreateFAQDto,
  UpdateFAQDto,
  QueryFAQDto,
  CreateRecycleRuleDto,
  UpdateRecycleRuleDto,
  QueryRecycleRuleDto,
} from './dto';

@Injectable()
export class ContentConfigService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== FAQ 相关方法 ====================

  async createFAQ(dto: CreateFAQDto) {
    return this.prisma.fAQ.create({
      data: {
        question: dto.question,
        answer: dto.answer,
        category: dto.category || FAQCategory.GENERAL,
        sortOrder: dto.sortOrder || 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateFAQ(id: string, dto: UpdateFAQDto) {
    const faq = await this.prisma.fAQ.findUnique({
      where: { id: BigInt(id) },
    });

    if (!faq) {
      throw new Error('FAQ不存在');
    }

    return this.prisma.fAQ.update({
      where: { id: BigInt(id) },
      data: {
        question: dto.question,
        answer: dto.answer,
        category: dto.category,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
        updatedAt: new Date(),
      },
    });
  }

  async deleteFAQ(id: string): Promise<void> {
    await this.prisma.fAQ.delete({
      where: { id: BigInt(id) },
    });
  }

  async findOneFAQ(id: string) {
    return this.prisma.fAQ.findUnique({
      where: { id: BigInt(id) },
    });
  }

  async findAllFAQ(dto: QueryFAQDto): Promise<{ items: any[]; total: number }> {
    const where: Prisma.FAQWhereInput = {};

    if (dto.category) {
      where.category = dto.category;
    }

    if (dto.isActive !== undefined) {
      where.isActive = dto.isActive;
    }

    if (dto.keyword) {
      where.OR = [
        { question: { contains: dto.keyword, mode: 'insensitive' } },
        { answer: { contains: dto.keyword, mode: 'insensitive' } },
      ];
    }

    const page = dto.page || 1;
    const pageSize = dto.pageSize || 20;

    const [items, total] = await Promise.all([
      this.prisma.fAQ.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.fAQ.count({ where }),
    ]);

    return { items, total };
  }

  async getActiveFAQs(): Promise<any[]> {
    return this.prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  async getFAQCategories(): Promise<
    { category: FAQCategory; count: number }[]
  > {
    const results = await this.prisma.fAQ.groupBy({
      by: ['category'],
      _count: { id: true },
      where: { isActive: true },
    });

    return results.map((r) => ({
      category: r.category,
      count: r._count.id,
    }));
  }

  // ==================== 回收规则相关方法 ====================

  async createRecycleRule(dto: CreateRecycleRuleDto) {
    return this.prisma.recycleRule.create({
      data: {
        category: dto.category,
        title: dto.title,
        content: dto.content,
        icon: dto.icon,
        sortOrder: dto.sortOrder || 0,
        isActive: dto.isActive ?? true,
        extra: dto.extra ? JSON.parse(JSON.stringify(dto.extra)) : undefined,
      },
    });
  }

  async updateRecycleRule(id: string, dto: UpdateRecycleRuleDto) {
    const rule = await this.prisma.recycleRule.findUnique({
      where: { id: BigInt(id) },
    });

    if (!rule) {
      throw new Error('回收规则不存在');
    }

    return this.prisma.recycleRule.update({
      where: { id: BigInt(id) },
      data: {
        category: dto.category,
        title: dto.title,
        content: dto.content,
        icon: dto.icon,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
        extra: dto.extra ? JSON.parse(JSON.stringify(dto.extra)) : undefined,
        updatedAt: new Date(),
      },
    });
  }

  async deleteRecycleRule(id: string): Promise<void> {
    await this.prisma.recycleRule.delete({
      where: { id: BigInt(id) },
    });
  }

  async findOneRecycleRule(id: string) {
    return this.prisma.recycleRule.findUnique({
      where: { id: BigInt(id) },
    });
  }

  async findAllRecycleRules(
    dto: QueryRecycleRuleDto,
  ): Promise<{ items: any[]; total: number }> {
    const where: Prisma.RecycleRuleWhereInput = {};

    if (dto.category) {
      where.category = dto.category;
    }

    if (dto.isActive !== undefined) {
      where.isActive = dto.isActive;
    }

    const page = dto.page || 1;
    const pageSize = dto.pageSize || 20;

    const [items, total] = await Promise.all([
      this.prisma.recycleRule.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.recycleRule.count({ where }),
    ]);

    return { items, total };
  }

  async getActiveRecycleRules(): Promise<any[]> {
    return this.prisma.recycleRule.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  async getRecycleRulesByCategory(
    category: RecycleRuleCategory,
  ): Promise<any[]> {
    return this.prisma.recycleRule.findMany({
      where: { isActive: true, category },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  async getRecycleRuleCategories(): Promise<
    { category: RecycleRuleCategory; count: number }[]
  > {
    const results = await this.prisma.recycleRule.groupBy({
      by: ['category'],
      _count: { id: true },
      where: { isActive: true },
    });

    return results.map((r) => ({
      category: r.category,
      count: r._count.id,
    }));
  }
}

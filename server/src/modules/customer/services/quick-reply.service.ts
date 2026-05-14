import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CreateQuickReplyDto,
  QueryQuickReplyDto,
  UpdateQuickReplyDto,
} from '../dto';

@Injectable()
export class QuickReplyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateQuickReplyDto, agentId?: string): Promise<any> {
    return this.prisma.quickReply.create({
      data: {
        title: dto.title,
        content: dto.content,
        category: dto.category,
        sortOrder: dto.sortOrder || 0,
        isGlobal: dto.isGlobal || false,
        agentId: agentId ? BigInt(agentId) : null,
      },
    });
  }

  async update(id: string, dto: UpdateQuickReplyDto): Promise<any> {
    const quickReply = await this.prisma.quickReply.findUnique({
      where: { id: BigInt(id) },
    });

    if (!quickReply) {
      throw new NotFoundException('快捷回复不存在');
    }

    return this.prisma.quickReply.update({
      where: { id: BigInt(id) },
      data: {
        title: dto.title,
        content: dto.content,
        category: dto.category,
        sortOrder: dto.sortOrder,
        isGlobal: dto.isGlobal,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.quickReply.delete({
      where: { id: BigInt(id) },
    });
  }

  async findOne(id: string): Promise<any> {
    return this.prisma.quickReply.findUnique({
      where: { id: BigInt(id) },
    });
  }

  async findAll(
    dto: QueryQuickReplyDto,
    agentId?: string,
  ): Promise<{
    items: any[];
    total: number;
  }> {
    const where: Prisma.QuickReplyWhereInput = {};

    if (dto.category) {
      where.category = dto.category;
    }

    if (dto.isGlobal !== undefined) {
      where.isGlobal = dto.isGlobal;
    }

    if (agentId) {
      where.OR = [{ isGlobal: true }, { agentId: BigInt(agentId) }];
    }

    const page = dto.page || 1;
    const pageSize = dto.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.quickReply.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
      }),
      this.prisma.quickReply.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        id: item.id.toString(),
        agentId: item.agentId?.toString(),
      })),
      total,
    };
  }

  async getQuickRepliesForAgent(agentId?: string): Promise<any[]> {
    const where: Prisma.QuickReplyWhereInput = agentId
      ? { OR: [{ isGlobal: true }, { agentId: BigInt(agentId) }] }
      : { isGlobal: true };

    const items = await this.prisma.quickReply.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return items.map((item) => ({
      ...item,
      id: item.id.toString(),
      agentId: item.agentId?.toString(),
    }));
  }

  async getCategories(): Promise<string[]> {
    const results = await this.prisma.quickReply.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ['category'],
    });

    return results
      .map((r) => r.category)
      .filter((c): c is string => c !== null);
  }
}

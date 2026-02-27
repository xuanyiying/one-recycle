import {
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/common/redis/redis.service';
import { KnowledgeCategory, Prisma } from '@prisma/client';
import {
  CreateKnowledgeDto,
  UpdateKnowledgeDto,
  QueryKnowledgeDto,
} from '../dto';

@Injectable()
export class KnowledgeService {
  private readonly CACHE_PREFIX = 'knowledge:cache:';
  private readonly CACHE_TTL = 3600;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) { }

  async create(dto: CreateKnowledgeDto): Promise<any> {
    return this.prisma.knowledgeBase.create({
      data: {
        category: dto.category,
        question: dto.question,
        answer: dto.answer,
        keywords: dto.keywords || [],
        intent: dto.intent,
        priority: dto.priority || 0,
      },
    });
  }

  async update(id: string, dto: UpdateKnowledgeDto): Promise<any> {
    const knowledge = await this.prisma.knowledgeBase.findUnique({
      where: { id: BigInt(id) },
    });

    if (!knowledge) {
      throw new Error('知识条目不存在');
    }

    return this.prisma.knowledgeBase.update({
      where: { id: BigInt(id) },
      data: {
        category: dto.category,
        question: dto.question,
        answer: dto.answer,
        keywords: dto.keywords,
        intent: dto.intent,
        priority: dto.priority,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.knowledgeBase.delete({
      where: { id: BigInt(id) },
    });
  }

  async findOne(id: string): Promise<any | null> {
    return this.prisma.knowledgeBase.findUnique({
      where: { id: BigInt(id) },
    });
  }

  async findAll(dto: QueryKnowledgeDto): Promise<{
    items: any[];
    total: number;
  }> {
    const where: Prisma.KnowledgeBaseWhereInput = {};

    if (dto.category) {
      where.category = dto.category;
    }

    if (dto.isActive !== undefined) {
      where.isActive = dto.isActive;
    }

    if (dto.intent) {
      where.intent = dto.intent;
    }

    if (dto.keyword) {
      where.OR = [
        { question: { contains: dto.keyword, mode: 'insensitive' } },
        { answer: { contains: dto.keyword, mode: 'insensitive' } },
        { keywords: { has: dto.keyword } },
      ];
    }

    const page = dto.page || 1;
    const pageSize = dto.pageSize || 20;

    const [items, total] = await Promise.all([
      this.prisma.knowledgeBase.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { hitCount: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.knowledgeBase.count({ where }),
    ]);

    return { items, total };
  }

  async search(query: string): Promise<any | null> {
    const normalizedQuery = query.toLowerCase().trim();

    const cacheKey = `${this.CACHE_PREFIX}search:${normalizedQuery}`;
    const cached = await this.redisService.getClient().get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const results = await this.prisma.knowledgeBase.findMany({
      where: {
        isActive: true,
        OR: [
          { question: { contains: normalizedQuery, mode: 'insensitive' } },
          { answer: { contains: normalizedQuery, mode: 'insensitive' } },
          { keywords: { hasSome: this.extractKeywords(normalizedQuery) } },
        ],
      },
      orderBy: [{ priority: 'desc' }, { hitCount: 'desc' }],
      take: 1,
    });

    if (results.length > 0) {
      const result = results[0];
      await this.redisService.getClient().setex(
        cacheKey,
        this.CACHE_TTL,
        JSON.stringify(result),
      );
      return result;
    }

    return null;
  }

  async matchIntent(query: string): Promise<{
    id: string;
    intent: string;
    confidence: number;
  } | null> {
    const normalizedQuery = query.toLowerCase().trim();

    const results = await this.prisma.knowledgeBase.findMany({
      where: {
        isActive: true,
        intent: { not: null },
      },
      select: {
        id: true,
        intent: true,
        keywords: true,
        priority: true,
      },
    });

    let bestMatch: { id: string; intent: string; confidence: number } | null = null;
    let maxScore = 0;

    for (const item of results) {
      let score = 0;
      const keywords = item.keywords || [];

      for (const keyword of keywords) {
        if (normalizedQuery.includes(keyword.toLowerCase())) {
          score += keyword.length;
        }
      }

      score += item.priority * 0.5;

      if (score > maxScore) {
        maxScore = score;
        bestMatch = {
          id: item.id.toString(),
          intent: item.intent!,
          confidence: Math.min(score / 20, 0.95),
        };
      }
    }

    return bestMatch;
  }

  async incrementHitCount(id: string): Promise<void> {
    await this.prisma.knowledgeBase.update({
      where: { id: BigInt(id) },
      data: {
        hitCount: { increment: 1 },
      },
    });
  }

  async getCategories(): Promise<{
    category: KnowledgeCategory;
    count: number;
  }[]> {
    const results = await this.prisma.knowledgeBase.groupBy({
      by: ['category'],
      _count: { id: true },
      where: { isActive: true },
    });

    return results.map((r) => ({
      category: r.category,
      count: r._count.id,
    }));
  }

  async getHotQuestions(limit: number = 10): Promise<any[]> {
    return this.prisma.knowledgeBase.findMany({
      where: { isActive: true },
      orderBy: { hitCount: 'desc' },
      take: limit,
      select: {
        id: true,
        question: true,
        category: true,
      },
    });
  }

  private extractKeywords(query: string): string[] {
    const stopWords = new Set([
      '的', '了', '是', '在', '我', '有', '和', '就',
      '不', '人', '都', '一', '一个', '上', '也', '很',
      '到', '说', '要', '去', '你', '会', '着', '没有',
      '看', '好', '自己', '这', '那', '什么', '怎么',
      '吗', '呢', '啊', '吧', '嗯', '哦',
    ]);

    const words = query.split(/\s+/).filter((word) => {
      return word.length > 1 && !stopWords.has(word);
    });

    return [...new Set(words)];
  }
}

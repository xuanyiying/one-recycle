import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  ArticleResponseDto,
  BannerResponseDto,
  QAResponseDto,
  SystemRankingResponseDto as RankingResponseDto,
} from './dto';

@Injectable()
export class SystemService {
  constructor(private readonly prisma: PrismaService) {}

  async getBanners(): Promise<BannerResponseDto[]> {
    const banners = await this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });

    return banners.map((banner) => ({
      id: Number(banner.id),
      title: banner.title,
      subtitle: banner.subtitle || undefined,
      description: banner.description || undefined,
      image: banner.imageUrl,
      link: banner.linkUrl || undefined,
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    }));
  }

  async getArticles(): Promise<ArticleResponseDto[]> {
    const articles = await this.prisma.article.findMany({
      where: { isPublished: true },
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      take: 10,
    });

    return articles.map((article) => ({
      id: Number(article.id),
      title: article.title,
      content: article.content,
      summary: article.summary || '',
      image: article.coverImage || undefined,
      author: article.author || undefined,
      viewCount: article.viewCount,
      isPublished: article.isPublished,
      publishedAt: article.publishedAt || article.createdAt,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    }));
  }

  async getNewsBriefs(): Promise<any[]> {
    const completedOrders = await this.prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        user: {
          select: {
            nickname: true,
          },
        },
        items: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
    });

    return completedOrders.map((order, index) => {
      const totalWeight = order.items.reduce(
        (sum, item) => sum + Number(item.actualWeight || item.estimatedWeight),
        0,
      );
      const totalEarnings = Number(
        order.settlementAmount || order.estimatedAmount,
      );
      const categoryName =
        order.items.length > 0 ? order.items[0].category.name : '物品';
      const timeAgo = this.getTimeAgo(order.completedAt!);

      return {
        id: index + 1,
        nickname: this.maskNickname(order.user.nickname || '环保达人'),
        soldItems: categoryName,
        weight: parseFloat(totalWeight.toFixed(1)),
        earnings: parseFloat(totalEarnings.toFixed(2)),
        time: timeAgo,
      };
    });
  }

  async getQA(): Promise<QAResponseDto[]> {
    const faqs = await this.prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });

    return faqs.map((faq, index) => ({
      id: Number(faq.id),
      question: faq.question,
      answer: faq.answer,
      order: faq.sortOrder || index + 1,
    }));
  }

  async getRankings(): Promise<RankingResponseDto[]> {
    const topUsers = await this.prisma.user.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: { points: 'desc' },
      take: 5,
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        points: true,
      },
    });

    return topUsers.map((user, index) => ({
      id: Number(user.id),
      nickname: user.nickname || `环保达人${index + 1}`,
      avatar:
        user.avatarUrl ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
      score: user.points,
      rank: index + 1,
    }));
  }

  private maskNickname(nickname: string): string {
    if (!nickname || nickname.length <= 2) {
      return `${nickname || '环'}**`;
    }
    return nickname[0] + '**';
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return '刚刚';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}分钟前`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}小时前`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}天前`;
    }
  }
}

import { Injectable } from '@nestjs/common';
import {
  BannerResponseDto,
  ArticleResponseDto,
  QAResponseDto,
  SystemRankingResponseDto as RankingResponseDto,
} from './dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SystemService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly banners: BannerResponseDto[] = [
    {
      id: 1,
      title: '旧书回收，绿色生活',
      subtitle: '让知识循环利用',
      description: '专业旧书回收服务，上门取件',
      image: 'https://placehold.co/800x300/png?text=旧书回收',
      link: '/category/1',
      sortOrder: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      title: '旧衣回收，价格优惠',
      subtitle: '衣旧情深，爱心传递',
      description: '高价回收旧衣物，支持公益',
      image: 'https://placehold.co/800x300/png?text=旧衣回收',
      link: '/category/1',
      sortOrder: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      title: '电子产品回收专场',
      subtitle: '安全环保，高价回收',
      description: '手机电脑家电回收，隐私清除',
      image: 'https://placehold.co/800x300/png?text=电子回收',
      link: '/category/4',
      sortOrder: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private readonly articles: ArticleResponseDto[] = [
    {
      id: 1,
      title: '如何正确分类回收废品',
      content: '废品分类回收是环保的重要环节...',
      summary: '学习正确的废品分类方法，提高回收效率',
      image: 'https://placehold.co/400x200/png?text=分类回收',
      author: '环保专家',
      viewCount: 1250,
      isPublished: true,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      title: '旧物改造：旧T恤变环保袋',
      content: '家里的旧T恤不要扔，简单几步就能变成实用的环保袋...',
      summary: '创意DIY，让旧物焕发新生',
      image: 'https://placehold.co/400x200/png?text=旧物改造',
      author: '手工达人',
      viewCount: 850,
      isPublished: true,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  getBanners(): BannerResponseDto[] {
    return this.banners.filter((b) => b.isActive);
  }

  getArticles(): ArticleResponseDto[] {
    return this.articles.filter((a) => a.isPublished);
  }

  getNewsBriefs(): any[] {
    const items = [
      '旧书',
      '旧衣',
      '废纸箱',
      '塑料瓶',
      '旧家电',
      '金属',
      '废旧手机',
    ];
    const nicknames = [
      '张**',
      '李**',
      '王**',
      '赵**',
      '陈**',
      '刘**',
      '杨**',
      '周**',
      '吴**',
      '郑**',
    ];

    return Array.from({ length: 10 }).map((_, index) => {
      const item = items[Math.floor(Math.random() * items.length)];
      let weight = 0;
      let earnings = 0;

      // Calculate realistic weights and earnings based on item type
      if (['旧书', '废纸箱'].includes(item)) {
        weight = parseFloat((Math.random() * 20 + 5).toFixed(1)); // 5-25kg
        earnings = weight * 0.8;
      } else if (item === '旧衣') {
        weight = parseFloat((Math.random() * 10 + 2).toFixed(1)); // 2-12kg
        earnings = weight * 0.4;
      } else if (item === '塑料瓶') {
        weight = parseFloat((Math.random() * 5 + 1).toFixed(1)); // 1-6kg
        earnings = weight * 1.2;
      } else if (['旧家电', '废旧手机'].includes(item)) {
        weight = 1; // Count as 1 unit
        earnings = Math.floor(Math.random() * 100 + 20); // 20-120 yuan
      } else {
        weight = parseFloat((Math.random() * 10 + 2).toFixed(1));
        earnings = weight * 1.5;
      }

      // Random time
      const times = [
        '刚刚',
        '1分钟前',
        '3分钟前',
        '5分钟前',
        '10分钟前',
        '半小时前',
      ];
      const time = times[Math.floor(Math.random() * times.length)];

      return {
        id: index + 1,
        nickname: nicknames[Math.floor(Math.random() * nicknames.length)],
        soldItems: item,
        weight,
        earnings: parseFloat(earnings.toFixed(2)),
        time,
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

  getRankings(): RankingResponseDto[] {
    const nicknames = [
      '环保卫士',
      '绿色先锋',
      '低碳达人',
      '地球守护者',
      '回收小能手',
    ];
    return Array.from({ length: 5 })
      .map((_, index) => ({
        id: index + 1,
        nickname: nicknames[index] || `User${index + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
        score: Math.floor(Math.random() * 500) + 100, // 100-600 points
        rank: index + 1,
      }))
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }
}

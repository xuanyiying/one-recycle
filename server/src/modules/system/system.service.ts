import { Injectable } from '@nestjs/common';
import { BannerResponseDto, ArticleResponseDto } from './dto';

@Injectable()
export class SystemService {
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

  async getBanners(): Promise<BannerResponseDto[]> {
    return this.banners.filter((b) => b.isActive);
  }

  async getArticles(): Promise<ArticleResponseDto[]> {
    return this.articles.filter((a) => a.isPublished);
  }
}

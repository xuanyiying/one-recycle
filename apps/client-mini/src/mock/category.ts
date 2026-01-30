// 分类相关Mock数据
import { createMockResponse, MockResponse } from './index'
import {
  Category,
  CategoryType,
  CategoryStatus,
  PriceType
} from '@/types/category'

import { getPlaceholderSvg } from '@/utils/visuals'

// Banner数据类型 - 匹配 types/index.ts 的 Banner 接口
interface Banner {
  id: number
  title: string
  subtitle: string
  description: string
  image: string  // 修改为 image 以匹配 types
  link: string   // 修改为 link 以匹配 types
}

// 文章数据类型 - 匹配 types/index.ts 的 Article 接口
interface Article {
  id: number
  title: string
  summary: string
  imageUrl: string
  publishDate: string  // 修改为 publishDate 以匹配 types
  views: number        // 修改为 views 以匹配 types
}

// Mock Banner数据 - 使用本地生成的 3D 插画风格 SVG
const mockBanners: Banner[] = [
  {
    id: 1,
    title: '旧书回收，绿色生活',
    subtitle: '让知识循环利用',
    description: '专业旧书回收服务，上门取件，最高1.2元/kg',
    image: getPlaceholderSvg('book', 750, 300),
    link: '/category/books'
  },
  {
    id: 2,
    title: '旧衣回收，公益环保',
    subtitle: '衣旧情深，爱心传递',
    description: '高价回收旧衣物，支持公益事业，最高0.8元/kg',
    image: getPlaceholderSvg('clothes', 750, 300),
    link: '/category/clothes'
  },
  {
    id: 3,
    title: '电子产品回收专场',
    subtitle: '安全环保，高价回收',
    description: '手机电脑家电回收，数据清除保护隐私',
    image: getPlaceholderSvg('electronics', 750, 300),
    link: '/category/electronics'
  }
]

// Mock Articles数据 - 使用本地生成的 3D 插画风格 SVG
const mockArticles: Article[] = [
  {
    id: 1,
    title: '如何正确分类回收废品',
    summary: '学习正确的废品分类方法，提高回收效率，为地球环保贡献一份力量',
    imageUrl: getPlaceholderSvg('article', 690, 360),
    publishDate: '2024-01-10',
    views: 1250
  },
  {
    id: 2,
    title: '旧衣物回收再利用指南',
    summary: '了解旧衣物的回收流程和再利用价值，让爱心衣物找到新归宿',
    imageUrl: getPlaceholderSvg('article', 690, 360),
    publishDate: '2024-01-12',
    views: 2180
  },
  {
    id: 3,
    title: '电子废弃物的环保处理',
    summary: '电子产品回收的安全须知和环保要求，保护个人隐私与环境',
    imageUrl: getPlaceholderSvg('article', 690, 360),
    publishDate: '2024-01-14',
    views: 1567
  },
  {
    id: 4,
    title: '废纸回收的经济与环保价值',
    summary: '每回收1吨废纸可节约17棵树木，了解废纸回收的重要意义',
    imageUrl: getPlaceholderSvg('article', 690, 360),
    publishDate: '2024-01-16',
    views: 980
  },
  {
    id: 5,
    title: '塑料制品分类与回收技巧',
    summary: '认识塑料回收标识，掌握不同塑料的回收方法，减少白色污染',
    imageUrl: getPlaceholderSvg('article', 690, 360),
    publishDate: '2024-01-18',
    views: 1423
  }
]

// Mock分类数据
const mockCategories: Category[] = [
  {
    id: 1,
    name: '衣服',
    description: '各种衣服回收',
    type: CategoryType.RECYCLE,
    status: CategoryStatus.ACTIVE,
    priceInfo: {
      type: PriceType.FIXED,
      unitPrice: 0.8,
      unit: '件',
      currency: 'CNY'
    },
    level: 0,
    path: '5',
    sortOrder: 5,
    isVisible: true,
    isFeatured: false,
    seo: {
      slug: 'clothing'
    },
    icon: {
      url: 'https://placehold.co/64x64/png?text=%E8%A1%A3',
      filename: 'clothing.png',
      uploadedAt: '2024-01-01T00:00:00Z'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: '旧书',
    description: '各类旧书回收',
    type: CategoryType.RECYCLE,
    status: CategoryStatus.ACTIVE,
    priceInfo: {
      type: PriceType.FIXED,
      unitPrice: 0.8,
      unit: 'kg',
      currency: 'CNY'
    },
    level: 0,
    path: '6',
    sortOrder: 6,
    isVisible: true,
    isFeatured: true,
    seo: {
      slug: 'books'
    },
    icon: {
      url: 'https://placehold.co/64x64/png?text=%E4%B9%A6',
      filename: 'books.png',
      uploadedAt: '2024-01-01T00:00:00Z'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  }
]

// Mock获取活跃分类
export const mockGetActiveCategories = async (): Promise<MockResponse<Category[]>> => {
  const activeCategories = mockCategories.filter(cat => cat.status === CategoryStatus.ACTIVE)
  return createMockResponse(activeCategories, true, '获取活跃分类成功')
}

// Mock获取所有分类
export const mockGetAllCategories = async (): Promise<MockResponse<Category[]>> => {
  return createMockResponse(mockCategories, true, '获取所有分类成功')
}

// Mock获取分类详情
export const mockGetCategoryDetail = async (id: string): Promise<MockResponse<Category | null>> => {
  const categoryId = parseInt(id)
  const category = mockCategories.find(cat => cat.id === categoryId)

  if (!category) {
    return createMockResponse(null, false, '分类不存在')
  }

  return createMockResponse(category, true, '获取分类详情成功')
}

// Mock根据类型获取分类
export const mockGetCategoriesByType = async (type: CategoryType): Promise<MockResponse<Category[]>> => {
  const categories = mockCategories.filter(cat => cat.type === type)
  return createMockResponse(categories, true, '根据类型获取分类成功')
}

// Mock获取推荐分类
export const mockGetFeaturedCategories = async (): Promise<MockResponse<Category[]>> => {
  const featuredCategories = mockCategories.filter(cat => cat.isFeatured)
  return createMockResponse(featuredCategories, true, '获取推荐分类成功')
}

// Mock获取Banner列表
export const mockGetBanners = async (): Promise<MockResponse<Banner[]>> => {
  return createMockResponse(mockBanners, true, '获取Banner列表成功')
}

// Mock获取文章列表
export const mockGetArticles = async (categoryId?: string): Promise<MockResponse<Article[]>> => {
  // 简化后的接口不再包含 categoryId，所以返回所有文章
  void categoryId
  return createMockResponse(mockArticles, true, '获取文章列表成功')
}

// Mock获取文章详情
export const mockGetArticleDetail = async (id: string): Promise<MockResponse<Article | null>> => {
  const articleId = parseInt(id)
  const article = mockArticles.find(art => art.id === articleId)

  if (!article) {
    return createMockResponse(null, false, '文章不存在')
  }

  return createMockResponse(article, true, '获取文章详情成功')
}

// 导出所有分类相关mock函数
export const categoryMockData = {
  getActiveCategories: mockGetActiveCategories,
  getAllCategories: mockGetAllCategories,
  getCategoryDetail: mockGetCategoryDetail,
  getCategoriesByType: mockGetCategoriesByType,
  getFeaturedCategories: mockGetFeaturedCategories,
  getBanners: mockGetBanners,
  getArticles: mockGetArticles,
  getArticleDetail: mockGetArticleDetail
}
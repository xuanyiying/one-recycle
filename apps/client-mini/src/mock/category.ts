// 分类相关Mock数据
import { createMockResponse, MockResponse } from './index'
import { Category } from '@/types/category'

// Banner数据类型
interface Banner {
  id: number
  title: string
  imageUrl: string
  linkUrl?: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// 文章数据类型
interface Article {
  id: number
  title: string
  content: string
  summary: string
  imageUrl?: string
  categoryId?: number
  author: string
  publishedAt: string
  isPublished: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
}

// Mock Banner数据
const mockBanners: Banner[] = [
  {
    id: 1,
    title: '环保回收，绿色生活',
    imageUrl: 'https://via.placeholder.com/800x300?text=环保回收',
    linkUrl: '/category/1',
    sortOrder: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    title: '废纸回收，价格优惠',
    imageUrl: 'https://via.placeholder.com/800x300?text=废纸回收',
    linkUrl: '/category/1',
    sortOrder: 2,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 3,
    title: '电子产品回收专场',
    imageUrl: 'https://via.placeholder.com/800x300?text=电子回收',
    linkUrl: '/category/4',
    sortOrder: 3,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  }
]

// Mock Articles数据
const mockArticles: Article[] = [
  {
    id: 1,
    title: '如何正确分类回收废品',
    content: '废品分类回收是环保的重要环节...',
    summary: '学习正确的废品分类方法，提高回收效率',
    imageUrl: 'https://via.placeholder.com/400x200?text=分类回收',
    categoryId: 1,
    author: '环保专家',
    publishedAt: '2024-01-10T10:00:00Z',
    isPublished: true,
    viewCount: 1250,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    title: '废纸回收的经济价值',
    content: '废纸回收不仅环保，还有很好的经济效益...',
    summary: '了解废纸回收的经济价值和市场前景',
    imageUrl: 'https://via.placeholder.com/400x200?text=废纸价值',
    categoryId: 1,
    author: '回收专家',
    publishedAt: '2024-01-12T14:30:00Z',
    isPublished: true,
    viewCount: 890,
    createdAt: '2024-01-12T14:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 3,
    title: '电子产品回收注意事项',
    content: '电子产品回收需要注意数据安全和环保处理...',
    summary: '电子产品回收的安全须知和环保要求',
    imageUrl: 'https://via.placeholder.com/400x200?text=电子回收',
    categoryId: 4,
    author: '技术专家',
    publishedAt: '2024-01-14T09:15:00Z',
    isPublished: true,
    viewCount: 567,
    createdAt: '2024-01-14T09:15:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  }
]

// Mock分类数据
const mockCategories: Category[] = [
  {
    id: 1,
    name: '废纸类',
    description: '各种废纸制品回收',
    unitPrice: 1.2,
    icon: 'https://via.placeholder.com/64x64?text=纸',
    sortOrder: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: '塑料类',
    description: '各种塑料制品回收',
    unitPrice: 2.5,
    icon: 'https://via.placeholder.com/64x64?text=塑',
    sortOrder: 2,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 3,
    name: '金属类',
    description: '各种金属制品回收',
    unitPrice: 15.0,
    icon: 'https://via.placeholder.com/64x64?text=金',
    sortOrder: 3,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 4,
    name: '电子产品',
    description: '废旧电子设备回收',
    unitPrice: 50.0,
    icon: 'https://via.placeholder.com/64x64?text=电',
    sortOrder: 4,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 5,
    name: '衣服',
    description: '各种衣服回收',
    unitPrice: 0.8,
    icon: 'https://via.placeholder.com/64x64?text=玻',
    sortOrder: 5,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  }
]

// Mock获取活跃分类
export const mockGetActiveCategories = async (): Promise<MockResponse<Category[]>> => {
  const activeCategories = mockCategories.filter(cat => cat.isActive)
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

// Mock获取Banner列表
export const mockGetBanners = async (): Promise<MockResponse<Banner[]>> => {
  const activeBanners = mockBanners.filter(banner => banner.isActive)
  return createMockResponse(activeBanners, true, '获取Banner列表成功')
}

// Mock获取文章列表
export const mockGetArticles = async (categoryId?: string): Promise<MockResponse<Article[]>> => {
  let articles = mockArticles.filter(article => article.isPublished)
  
  if (categoryId) {
    const catId = parseInt(categoryId)
    articles = articles.filter(article => article.categoryId === catId)
  }
  
  return createMockResponse(articles, true, '获取文章列表成功')
}

// Mock获取文章详情
export const mockGetArticleDetail = async (id: string): Promise<MockResponse<Article | null>> => {
  const articleId = parseInt(id)
  const article = mockArticles.find(art => art.id === articleId && art.isPublished)
  
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
  getBanners: mockGetBanners,
  getArticles: mockGetArticles,
  getArticleDetail: mockGetArticleDetail
}
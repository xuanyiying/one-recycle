// 分类相关Mock数据
import { createMockResponse, MockResponse } from './index'
import { 
  Category,
  CategoryType,
  CategoryStatus,
  PriceType
} from '@/types/category'

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
    title: '旧书回收，绿色生活',
    imageUrl: 'https://placehold.co/800x300/png?text=%E6%97%A7%E4%B9%A6%E5%9B%9E%E6%94%B6',
    linkUrl: '/category/1',
    sortOrder: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    title: '旧衣回收，价格优惠',
    imageUrl: 'https://placehold.co/800x300/png?text=%E5%BA%9F%E7%BA%B8%E5%9B%9E%E6%94%B6',
    linkUrl: '/category/1',
    sortOrder: 2,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 3,
    title: '电子产品回收专场',
    imageUrl: 'https://placehold.co/800x300/png?text=%E7%94%B5%E5%AD%90%E5%9B%9E%E6%94%B6',
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
    imageUrl: 'https://placehold.co/400x200/png?text=%E5%88%86%E7%B1%BB%E5%9B%9E%E6%94%B6',
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
    imageUrl: 'https://placehold.co/400x200/png?text=%E5%BA%9F%E7%BA%B8%E4%BB%B7%E5%80%BC',
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
    imageUrl: 'https://placehold.co/400x200/png?text=%E7%94%B5%E5%AD%90%E5%9B%9E%E6%94%B6',
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
  getCategoriesByType: mockGetCategoriesByType,
  getFeaturedCategories: mockGetFeaturedCategories,
  getBanners: mockGetBanners,
  getArticles: mockGetArticles,
  getArticleDetail: mockGetArticleDetail
}
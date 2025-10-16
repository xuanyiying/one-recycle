import { CreateCategoryDto } from '../src/modules/category/dto/create-category.dto';
import { UpdateCategoryDto } from '../src/modules/category/dto/update-category.dto';

/**
 * 创建测试用的分类数据
 */
export function createTestCategory(overrides: Partial<any> = {}) {
  return {
    id: 1,
    name: '测试分类',
    description: '测试分类描述',
    type: 'PRODUCT',
    priceInfo: {
      type: 'UNIT',
      unitPrice: 5.0,
      unit: 'kg',
      currency: 'CNY'
    },
    icon: {
      url: 'https://example.com/test-icon.png',
      filename: 'test-icon.png'
    },
    sortOrder: 1,
    isVisible: true,
    isFeatured: false,
    seo: {
      slug: 'test-category'
    },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

/**
 * 创建测试用的创建分类DTO
 */
export function createTestCreateCategoryDto(overrides: Partial<CreateCategoryDto> = {}): CreateCategoryDto {
  return {
    name: '新分类',
    description: '新分类描述',
    type: 'PRODUCT' as any,
    priceInfo: {
      type: 'UNIT' as any,
      unitPrice: 8.0,
      unit: 'kg',
      currency: 'CNY'
    },
    icon: {
      url: 'https://example.com/new-icon.png',
      filename: 'new-icon.png'
    },
    sortOrder: 2,
    isVisible: true,
    isFeatured: false,
    seo: {
      slug: 'new-category'
    },
    ...overrides,
  };
}

/**
 * 创建测试用的Prisma数据（用于直接插入数据库）
 */
export function createTestPrismaCategoryData(overrides: any = {}) {
  return {
    name: '新分类',
    description: '新分类描述',
    type: 'PRODUCT',
    priceInfo: {
      type: 'UNIT',
      unitPrice: 8.0,
      unit: 'kg',
      currency: 'CNY'
    },
    icon: {
      url: 'https://example.com/new-icon.png',
      filename: 'new-icon.png'
    },
    sortOrder: 2,
    isVisible: true,
    isFeatured: false,
    seo: {
      slug: 'new-category'
    },
    ...overrides,
  };
}

/**
 * 创建测试用的更新分类DTO
 */
export function createTestUpdateCategoryDto(overrides: Partial<UpdateCategoryDto> = {}): UpdateCategoryDto {
  return {
    name: '更新分类',
    description: '更新分类描述',
    priceInfo: {
      type: 'UNIT' as any,
      unitPrice: 12.0,
      unit: 'kg',
      currency: 'CNY'
    },
    icon: {
      url: 'https://example.com/updated-icon.png',
      filename: 'updated-icon.png'
    },
    sortOrder: 3,
    isVisible: false,
    ...overrides,
  };
}

/**
 * 创建多个测试分类
 */
export function createTestCategories(count: number = 3) {
  return Array.from({ length: count }, (_, index) =>
    createTestCategory({
      id: index + 1,
      name: `测试分类${index + 1}`,
      description: `测试分类${index + 1}描述`,
      sortOrder: index + 1,
      unitPrice: (index + 1) * 5,
    })
  );
}

/**
 * 创建Mock的PrismaService
 */
export const createMockPrismaService = () => {
  const mockPrismaService = {
    category: {
      create: jest.fn().mockResolvedValue(createTestCategory()),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue(createTestCategory()),
      delete: jest.fn().mockResolvedValue(createTestCategory()),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
  };
  
  return mockPrismaService as any;
};

/**
 * 创建Mock的ImageProcessingService
 */
export function createMockImageProcessingService() {
  return {
    processImage: jest.fn().mockResolvedValue('processed-image.jpg'),
    deleteImage: jest.fn().mockResolvedValue(undefined),
    getImageUrl: jest.fn().mockReturnValue('/uploads/icons/processed-image.jpg'),
  };
}
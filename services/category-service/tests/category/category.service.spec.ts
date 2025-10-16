import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../../src/modules/category/services/category.service';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CategoryType, CategoryStatus, PriceType } from '../../src/modules/category/entities/category.entity';
import { CreateCategoryData } from '../../src/modules/category/interfaces/category.interface';

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryService],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createCategoryDto: CreateCategoryData = {
        name: '新分类',
        description: '新分类描述',
        type: CategoryType.RECYCLE,
        priceInfo: {
          type: PriceType.FIXED,
          unitPrice: 8.0,
          unit: 'kg',
          currency: 'CNY'
        },
        icon: {
          url: 'https://example.com/new-icon.png',
          filename: 'new-icon.png'
        },
        sortOrder: 1,
        isVisible: true,
        isFeatured: false,
        seo: {
          slug: 'new-category'
        }
      };

      const result = await service.create(createCategoryDto);

      expect(result).toBeDefined();
      expect(result.name).toBe(createCategoryDto.name);
      expect(result.description).toBe(createCategoryDto.description);
      expect(result.type).toBe(createCategoryDto.type);
      expect(result.status).toBe(CategoryStatus.ACTIVE);
    });

    it('should throw ConflictException for duplicate slug', async () => {
      const createCategoryDto: CreateCategoryData = {
        name: '电子产品',
        description: '电子产品描述',
        type: CategoryType.RECYCLE,
        priceInfo: {
          type: PriceType.FIXED,
          unitPrice: 8.0,
          unit: 'kg',
          currency: 'CNY'
        },
        sortOrder: 1,
        isVisible: true,
        isFeatured: false,
        seo: {
          slug: 'electronics' // 这个slug已经存在
        }
      };

      await expect(service.create(createCategoryDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('should return a category when found', async () => {
      const result = await service.findById(1);

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.name).toBe('电子产品');
    });

    it('should return null when category not found', async () => {
      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(result.categories).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should filter categories by type', async () => {
      const result = await service.findAll({ type: CategoryType.RECYCLE });

      expect(result).toBeDefined();
      expect(result.categories.every(cat => cat.type === CategoryType.RECYCLE)).toBe(true);
    });

    it('should filter categories by visibility', async () => {
      const result = await service.findAll({ isVisible: true });

      expect(result).toBeDefined();
      expect(result.categories.every(cat => cat.isVisible === true)).toBe(true);
    });
  });

  describe('update', () => {
    it('should update an existing category', async () => {
      const updateData = {
        name: '更新的分类名称',
        description: '更新的描述'
      };

      const result = await service.update(1, updateData);

      expect(result).toBeDefined();
      expect(result.name).toBe(updateData.name);
      expect(result.description).toBe(updateData.description);
    });

    it('should throw NotFoundException for non-existent category', async () => {
      const updateData = {
        name: '更新的分类名称'
      };

      await expect(service.update(999, updateData)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing category', async () => {
      // 先创建一个新分类用于删除
      const createData: CreateCategoryData = {
        name: '待删除分类',
        description: '待删除分类描述',
        type: CategoryType.RECYCLE,
        priceInfo: {
          type: PriceType.FIXED,
          unitPrice: 8.0,
          unit: 'kg',
          currency: 'CNY'
        },
        sortOrder: 1,
        isVisible: true,
        isFeatured: false,
        seo: {
          slug: 'to-delete-category'
        }
      };

      const created = await service.create(createData);
      const result = await service.delete(created.id);

      expect(result).toBe(true);
    });

    it('should throw NotFoundException for non-existent category', async () => {
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTree', () => {
    it('should return category tree', async () => {
      const result = await service.getTree();

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
    });

    it('should return tree with max depth', async () => {
      const result = await service.getTree({ maxDepth: 1 });

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('searchCategories', () => {
    it('should search categories by keyword', async () => {
      const result = await service.searchCategories('电子');

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      expect(result.some(cat => cat.name.includes('电子'))).toBe(true);
    });

    it('should return empty array for non-matching keyword', async () => {
      const result = await service.searchCategories('不存在的关键词');

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0);
    });
  });

  describe('findBySlug', () => {
    it('should find category by slug', async () => {
      const result = await service.findBySlug('electronics');

      expect(result).toBeDefined();
      expect(result?.seo.slug).toBe('electronics');
    });

    it('should return null for non-existent slug', async () => {
      const result = await service.findBySlug('non-existent-slug');

      expect(result).toBeNull();
    });
  });

  describe('findFeatured', () => {
    it('should return featured categories', async () => {
      const result = await service.findFeatured();

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      expect(result.every(cat => cat.isFeatured === true)).toBe(true);
    });
  });

  describe('findActive', () => {
    it('should return active categories', async () => {
      const result = await service.findActive();

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      expect(result.every(cat => cat.status === CategoryStatus.ACTIVE)).toBe(true);
    });
  });
});
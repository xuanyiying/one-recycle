import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CategoryController } from '../../src/modules/category/controllers/category.controller';
import { CategoryService } from '../../src/modules/category/services/category.service';
import { ImageProcessingService } from '../../src/upload/image-processing.service';
import { CategoryType, CategoryStatus, PriceType } from '../../src/modules/category/entities/category.entity';
import { CreateCategoryDto } from '../../src/modules/category/dto/create-category.dto';
import { UpdateCategoryDto } from '../../src/modules/category/dto/update-category.dto';
import { QueryCategoryDto } from '../../src/modules/category/dto/query-category.dto';

describe('CategoryController', () => {
  let controller: CategoryController;
  let categoryService: CategoryService;
  let imageProcessingService: ImageProcessingService;

  const mockCategoryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findActive: jest.fn(),
    findFeatured: jest.fn(),
    findByType: jest.fn(),
    searchCategories: jest.fn(),
    findBySlug: jest.fn(),
    getTree: jest.fn(),
    batchUpdate: jest.fn(),
    clearCache: jest.fn(),
    refreshCache: jest.fn(),
  };

  const mockImageProcessingService = {
    processImage: jest.fn(),
    deleteImage: jest.fn(),
    validateImage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
        {
          provide: ImageProcessingService,
          useValue: mockImageProcessingService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    categoryService = module.get<CategoryService>(CategoryService);
    imageProcessingService = module.get<ImageProcessingService>(ImageProcessingService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createCategoryDto: CreateCategoryDto = {
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
          url: 'https://example.com/icon.png',
          filename: 'icon.png'
        },
        sortOrder: 1,
        isVisible: true,
        isFeatured: false,
        seo: {
          slug: 'new-category'
        }
      };

      const expectedCategory = {
        id: 1,
        name: '新分类',
        description: '新分类描述',
        type: CategoryType.RECYCLE,
        status: CategoryStatus.ACTIVE,
        priceInfo: createCategoryDto.priceInfo,
        icon: createCategoryDto.icon,
        sortOrder: 1,
        isVisible: true,
        isFeatured: false,
        seo: createCategoryDto.seo,
        level: 0,
        path: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCategoryService.create.mockResolvedValue(expectedCategory);

      const result = await controller.create(createCategoryDto);

      expect(categoryService.create).toHaveBeenCalledWith(createCategoryDto);
      expect(result).toEqual(expectedCategory);
    });

    it('should handle creation errors', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: '新分类',
        description: '新分类描述',
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
          slug: 'new-category'
        }
      };

      const error = new BadRequestException('创建失败');
      mockCategoryService.create.mockRejectedValue(error);

      await expect(controller.create(createCategoryDto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should return all categories with query parameters', async () => {
      const query: QueryCategoryDto = {
        type: CategoryType.RECYCLE,
        isVisible: true,
        page: 1,
        pageSize: 10
      };

      const expectedResult = {
        categories: [
          {
            id: 1,
            name: '电子产品',
            type: CategoryType.RECYCLE,
            status: CategoryStatus.ACTIVE,
            isVisible: true,
            isFeatured: false,
            sortOrder: 1,
            level: 0,
            path: '1',
            priceInfo: {
              type: PriceType.FIXED,
              unitPrice: 8.0,
              unit: 'kg',
              currency: 'CNY'
            },
            seo: {
              slug: 'electronics'
            },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      mockCategoryService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(categoryService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const categoryId = 1;
      const expectedCategory = {
        id: 1,
        name: '电子产品',
        type: CategoryType.RECYCLE,
        status: CategoryStatus.ACTIVE,
        isVisible: true,
        isFeatured: false,
        sortOrder: 1,
        level: 0,
        path: '1',
        priceInfo: {
          type: PriceType.FIXED,
          unitPrice: 8.0,
          unit: 'kg',
          currency: 'CNY'
        },
        seo: {
          slug: 'electronics'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCategoryService.findById.mockResolvedValue(expectedCategory);

      const result = await controller.findOne(categoryId);

      expect(categoryService.findById).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual(expectedCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      const categoryId = 999;
      mockCategoryService.findById.mockResolvedValue(null);

      await expect(controller.findOne(categoryId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const categoryId = 1;
      const updateCategoryDto: UpdateCategoryDto = {
        name: '更新的分类名称',
        description: '更新的描述'
      };

      const expectedCategory = {
        id: 1,
        name: '更新的分类名称',
        description: '更新的描述',
        type: CategoryType.RECYCLE,
        status: CategoryStatus.ACTIVE,
        isVisible: true,
        isFeatured: false,
        sortOrder: 1,
        level: 0,
        path: '1',
        priceInfo: {
          type: PriceType.FIXED,
          unitPrice: 8.0,
          unit: 'kg',
          currency: 'CNY'
        },
        seo: {
          slug: 'electronics'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCategoryService.update.mockResolvedValue(expectedCategory);

      const result = await controller.update(categoryId, updateCategoryDto);

      expect(categoryService.update).toHaveBeenCalledWith(categoryId, updateCategoryDto);
      expect(result).toEqual(expectedCategory);
    });

    it('should handle update errors', async () => {
      const categoryId = 999;
      const updateCategoryDto: UpdateCategoryDto = {
        name: '更新的分类名称'
      };

      const error = new NotFoundException('分类不存在');
      mockCategoryService.update.mockRejectedValue(error);

      await expect(controller.update(categoryId, updateCategoryDto)).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      const categoryId = 1;
      mockCategoryService.delete.mockResolvedValue(true);

      const result = await controller.remove(categoryId);

      expect(categoryService.delete).toHaveBeenCalledWith(categoryId);
      expect(result).toBe(true);
    });

    it('should handle deletion errors', async () => {
      const categoryId = 999;
      const error = new NotFoundException('分类不存在');
      mockCategoryService.delete.mockRejectedValue(error);

      await expect(controller.remove(categoryId)).rejects.toThrow(error);
    });
  });

  describe('findActive', () => {
    it('should return active categories', async () => {
      const expectedCategories = [
        {
          id: 1,
          name: '电子产品',
          type: CategoryType.RECYCLE,
          status: CategoryStatus.ACTIVE,
          isVisible: true,
          isFeatured: false,
          sortOrder: 1,
          level: 0,
          path: '1',
          priceInfo: {
            type: PriceType.FIXED,
            unitPrice: 8.0,
            unit: 'kg',
            currency: 'CNY'
          },
          seo: {
            slug: 'electronics'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockCategoryService.findActive.mockResolvedValue(expectedCategories);

      const result = await controller.findActive();

      expect(categoryService.findActive).toHaveBeenCalled();
      expect(result).toEqual(expectedCategories);
    });
  });

  describe('search', () => {
    it('should search categories by keyword', async () => {
      const keyword = '电子';
      const query: QueryCategoryDto = {
        page: 1,
        pageSize: 10
      };
      const expectedResults = {
        categories: [
          {
            id: 1,
            name: '电子产品',
            type: CategoryType.RECYCLE,
            status: CategoryStatus.ACTIVE,
            isVisible: true,
            isFeatured: false,
            sortOrder: 1,
            level: 0,
            path: '1',
            priceInfo: {
              type: PriceType.FIXED,
              unitPrice: 8.0,
              unit: 'kg',
              currency: 'CNY'
            },
            seo: {
              slug: 'electronics'
            },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      mockCategoryService.searchCategories.mockResolvedValue(expectedResults);

      const result = await controller.search(keyword, query);

      expect(categoryService.searchCategories).toHaveBeenCalledWith(keyword, query);
      expect(result).toEqual(expectedResults);
    });
  });

  describe('getTree', () => {
    it('should return category tree', async () => {
      const query = { includeInactive: false };
      const expectedTree = [
        {
          id: 1,
          name: '电子产品',
          type: CategoryType.RECYCLE,
          status: CategoryStatus.ACTIVE,
          isVisible: true,
          isFeatured: false,
          sortOrder: 1,
          level: 0,
          path: '1',
          children: [],
          priceInfo: {
            type: PriceType.FIXED,
            unitPrice: 8.0,
            unit: 'kg',
            currency: 'CNY'
          },
          seo: {
            slug: 'electronics'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockCategoryService.getTree.mockResolvedValue(expectedTree);

      const result = await controller.getTree(query);

      expect(categoryService.getTree).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedTree);
    });
  });
});
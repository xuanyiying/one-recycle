import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { 
  CategoryEntity, 
  CategoryTreeEntity, 
  CategorySearchResultEntity, 
  CategoryBatchResultEntity,
  CategoryType,
  CategoryStatus,
  PriceType
} from '../entities/category.entity';
import { 
  ICategoryService,
  CreateCategoryData,
  UpdateCategoryData,
  CategoryFilters,
  CategorySortOptions,
  PaginationOptions,
  CategoryTreeOptions,
  BatchOperationOptions,
  FileUploadResult
} from '../interfaces/category.interface';

@Injectable()
export class CategoryService implements ICategoryService {
  // 模拟数据存储
  private categories = new Map<number, CategoryEntity>();
  private nextId = 1;

  constructor() {
    // 初始化一些示例数据
    this.initializeData();
  }

  private initializeData() {
    const sampleCategories = [
      {
        id: 1,
        name: '电子产品',
        description: '各类电子设备和配件',
        type: CategoryType.BOTH,
        status: CategoryStatus.ACTIVE,
        priceInfo: {
          type: PriceType.RANGE,
          minPrice: 10,
          maxPrice: 5000,
          unit: '台',
          currency: 'CNY'
        },
        level: 0,
        path: '1',
        sortOrder: 1,
        isVisible: true,
        isFeatured: true,
        seo: {
          slug: 'electronics',
          metaTitle: '电子产品回收',
          metaDescription: '专业的电子产品回收服务'
        }
      },
      {
        id: 2,
        name: '手机',
        description: '智能手机和功能手机',
        type: CategoryType.BOTH,
        status: CategoryStatus.ACTIVE,
        parentId: 1,
        priceInfo: {
          type: PriceType.RANGE,
          minPrice: 50,
          maxPrice: 3000,
          unit: '台',
          currency: 'CNY'
        },
        level: 1,
        path: '1/2',
        sortOrder: 1,
        isVisible: true,
        isFeatured: false,
        seo: {
          slug: 'mobile-phones',
          metaTitle: '手机回收',
          metaDescription: '高价回收各品牌手机'
        }
      }
    ];

    sampleCategories.forEach(category => {
      this.categories.set(category.id, new CategoryEntity(category));
    });
    this.nextId = 3;
  }

  async create(data: CreateCategoryData): Promise<CategoryEntity> {
    // 验证slug唯一性
    const slugExists = await this.validateSlug(data.seo.slug);
    if (!slugExists) {
      throw new ConflictException('Slug已存在');
    }

    // 验证层级关系
    if (data.parentId) {
      const isValidHierarchy = await this.validateHierarchy(data.parentId);
      if (!isValidHierarchy) {
        throw new BadRequestException('无效的层级关系');
      }
    }

    const categoryId = this.nextId++;
    
    const categoryData: Partial<CategoryEntity> = {
      id: categoryId,
      name: data.name,
      description: data.description,
      type: data.type,
      status: CategoryStatus.ACTIVE,
      parentId: data.parentId,
      priceInfo: data.priceInfo,
      sortOrder: data.sortOrder,
      isVisible: data.isVisible,
      isFeatured: data.isFeatured,
      seo: data.seo,
      attributes: data.attributes,
      level: data.parentId ? await this.calculateLevel(data.parentId) : 0,
      path: data.parentId ? await this.calculatePath(data.parentId, categoryId) : String(categoryId),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 如果有icon数据，确保包含uploadedAt字段
    if (data.icon) {
      categoryData.icon = {
        url: data.icon.url,
        filename: data.icon.filename,
        size: data.icon.size,
        mimeType: data.icon.mimeType,
        uploadedAt: new Date()
      };
    }

    const category = new CategoryEntity(categoryData);

    this.categories.set(category.id, category);
    return category;
  }

  async findById(id: number): Promise<CategoryEntity | null> {
    return this.categories.get(id) || null;
  }

  async findAll(
    filters?: CategoryFilters, 
    sort?: CategorySortOptions, 
    pagination?: PaginationOptions
  ): Promise<CategorySearchResultEntity> {
    let categories = Array.from(this.categories.values());

    // 应用过滤器
    if (filters) {
      categories = this.applyFilters(categories, filters);
    }

    // 应用排序
    if (sort) {
      categories = this.applySorting(categories, sort);
    }

    // 计算分页
    const total = categories.length;
    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const paginatedCategories = categories.slice(startIndex, endIndex);

    return new CategorySearchResultEntity({
      categories: paginatedCategories,
      total,
      page,
      pageSize
    });
  }

  async update(id: number, data: UpdateCategoryData): Promise<CategoryEntity> {
    const category = await this.findById(id);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 验证slug唯一性（如果更新了slug）
    if (data.seo?.slug && data.seo.slug !== category.seo.slug) {
      const slugExists = await this.validateSlug(data.seo.slug, id);
      if (!slugExists) {
        throw new ConflictException('Slug已存在');
      }
    }

    // 验证层级关系（如果更新了父分类）
    if (data.parentId !== undefined && data.parentId !== category.parentId) {
      const isValidHierarchy = await this.validateHierarchy(data.parentId, id);
      if (!isValidHierarchy) {
        throw new BadRequestException('无效的层级关系');
      }
    }

    // 更新分类
    Object.assign(category, data, { updatedAt: new Date() });

    // 如果更新了父分类，需要重新计算层级和路径
    if (data.parentId !== undefined) {
      category.level = data.parentId ? await this.calculateLevel(data.parentId) : 0;
      category.path = data.parentId ? await this.calculatePath(data.parentId, id) : String(id);
    }

    this.categories.set(id, category);
    return category;
  }

  async delete(id: number): Promise<boolean> {
    const category = await this.findById(id);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 检查是否有子分类
    const children = await this.getChildren(id);
    if (children.length > 0) {
      throw new BadRequestException('存在子分类，无法删除');
    }

    return this.categories.delete(id);
  }

  async getTree(options?: CategoryTreeOptions): Promise<CategoryTreeEntity[]> {
    const categories = Array.from(this.categories.values());
    const rootCategories = categories.filter(cat => 
      !cat.parentId && 
      (options?.includeInactive || cat.status === CategoryStatus.ACTIVE)
    );

    const buildTree = (parentCategories: CategoryEntity[], currentDepth = 0): CategoryTreeEntity[] => {
      if (options?.maxDepth && currentDepth >= options.maxDepth) {
        return [];
      }

      return parentCategories.map(parent => {
        const children = categories.filter(cat => 
          cat.parentId === parent.id &&
          (options?.includeInactive || cat.status === CategoryStatus.ACTIVE)
        );

        return new CategoryTreeEntity({
          ...parent,
          children: buildTree(children, currentDepth + 1)
        });
      });
    };

    return buildTree(rootCategories);
  }

  async getChildren(parentId: number, includeInactive = false): Promise<CategoryEntity[]> {
    const categories = Array.from(this.categories.values());
    return categories.filter(cat => 
      cat.parentId === parentId &&
      (includeInactive || cat.status === CategoryStatus.ACTIVE)
    );
  }

  async getParents(id: number): Promise<CategoryEntity[]> {
    const category = await this.findById(id);
    if (!category) return [];

    const parents: CategoryEntity[] = [];
    let currentId = category.parentId;

    while (currentId) {
      const parent = await this.findById(currentId);
      if (parent) {
        parents.unshift(parent);
        currentId = parent.parentId;
      } else {
        break;
      }
    }

    return parents;
  }

  async getPath(id: number): Promise<CategoryEntity[]> {
    const parents = await this.getParents(id);
    const category = await this.findById(id);
    
    if (category) {
      return [...parents, category];
    }
    
    return parents;
  }

  async moveCategory(id: number, newParentId?: number, newSortOrder?: number): Promise<CategoryEntity> {
    const updateData: UpdateCategoryData = {};
    
    if (newParentId !== undefined) {
      updateData.parentId = newParentId;
    }
    
    if (newSortOrder !== undefined) {
      updateData.sortOrder = newSortOrder;
    }

    return this.update(id, updateData);
  }

  async findByType(type: CategoryType, includeInactive = false): Promise<CategoryEntity[]> {
    const categories = Array.from(this.categories.values());
    return categories.filter(cat => 
      cat.type === type &&
      (includeInactive || cat.status === CategoryStatus.ACTIVE)
    );
  }

  async findActive(): Promise<CategoryEntity[]> {
    const categories = Array.from(this.categories.values());
    return categories.filter(cat => cat.status === CategoryStatus.ACTIVE);
  }

  async findFeatured(): Promise<CategoryEntity[]> {
    const categories = Array.from(this.categories.values());
    return categories.filter(cat => 
      cat.isFeatured && 
      cat.status === CategoryStatus.ACTIVE
    );
  }

  async search(
    keyword: string, 
    filters?: CategoryFilters, 
    pagination?: PaginationOptions
  ): Promise<CategorySearchResultEntity> {
    const searchFilters = {
      ...filters,
      keyword
    };

    return this.findAll(searchFilters, undefined, pagination);
  }

  async searchCategories(keyword: string): Promise<CategoryEntity[]> {
    const allCategories = Array.from(this.categories.values());
    return allCategories.filter(category => 
      category.name.includes(keyword) || 
      (category.description && category.description.includes(keyword))
    );
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const categories = Array.from(this.categories.values());
    return categories.find(cat => cat.seo.slug === slug) || null;
  }

  async batchUpdate(options: BatchOperationOptions): Promise<CategoryBatchResultEntity> {
    const result = new CategoryBatchResultEntity({});

    for (const id of options.ids) {
      try {
        switch (options.operation) {
          case 'activate':
            await this.update(id, { status: CategoryStatus.ACTIVE });
            break;
          case 'deactivate':
            await this.update(id, { status: CategoryStatus.INACTIVE });
            break;
          case 'archive':
            await this.update(id, { status: CategoryStatus.ARCHIVED });
            break;
          case 'delete':
            await this.delete(id);
            break;
          case 'updateParent':
            await this.update(id, { parentId: options.data?.parentId });
            break;
          case 'updateSort':
            await this.update(id, { sortOrder: options.data?.sortOrder });
            break;
        }
        result.successCount++;
        result.processedIds.push(id);
      } catch (error) {
        result.failureCount++;
        result.errors.push({
          id,
          error: error.message
        });
      }
    }

    return result;
  }

  async batchDelete(ids: number[]): Promise<CategoryBatchResultEntity> {
    return this.batchUpdate({
      ids,
      operation: 'delete'
    });
  }

  async getStats(id: number): Promise<any> {
    // 模拟统计数据
    return {
      totalItems: Math.floor(Math.random() * 1000),
      totalOrders: Math.floor(Math.random() * 500),
      totalRevenue: Math.floor(Math.random() * 50000),
      averagePrice: Math.floor(Math.random() * 500),
      lastOrderDate: new Date()
    };
  }

  async updateStats(id: number): Promise<void> {
    const category = await this.findById(id);
    if (category) {
      category.stats = await this.getStats(id);
      this.categories.set(id, category);
    }
  }

  async getPopularCategories(limit = 10): Promise<CategoryEntity[]> {
    const categories = await this.findActive();
    // 模拟按受欢迎程度排序
    return categories
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  }

  async uploadIcon(file: any): Promise<FileUploadResult> {
    // 模拟文件上传
    const filename = `category-icon-${Date.now()}.${file.mimetype.split('/')[1]}`;
    const url = `/uploads/categories/${filename}`;

    return {
      filename,
      url,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date()
    };
  }

  async deleteIcon(filename: string): Promise<boolean> {
    // 模拟文件删除
    return true;
  }

  async validateSlug(slug: string, excludeId?: number): Promise<boolean> {
    const categories = Array.from(this.categories.values());
    const existingCategory = categories.find(cat => 
      cat.seo.slug === slug && cat.id !== excludeId
    );
    return !existingCategory;
  }

  async validateHierarchy(parentId?: number, childId?: number): Promise<boolean> {
    if (!parentId) return true;
    if (parentId === childId) return false;

    // 检查父分类是否存在
    const parent = await this.findById(parentId);
    if (!parent) return false;

    // 检查是否会形成循环引用
    if (childId) {
      const childPath = await this.getPath(childId);
      return !childPath.some(cat => cat.id === parentId);
    }

    return true;
  }

  async clearCache(): Promise<void> {
    // 模拟清除缓存
    console.log('Cache cleared');
  }

  async refreshCache(): Promise<void> {
    // 模拟刷新缓存
    console.log('Cache refreshed');
  }

  // 私有辅助方法
  private applyFilters(categories: CategoryEntity[], filters: CategoryFilters): CategoryEntity[] {
    return categories.filter(category => {
      if (filters.type && category.type !== filters.type) return false;
      if (filters.status && category.status !== filters.status) return false;
      if (filters.parentId !== undefined && category.parentId !== filters.parentId) return false;
      if (filters.isVisible !== undefined && category.isVisible !== filters.isVisible) return false;
      if (filters.isFeatured !== undefined && category.isFeatured !== filters.isFeatured) return false;
      if (filters.level !== undefined && category.level !== filters.level) return false;
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const nameMatch = category.name.toLowerCase().includes(keyword);
        const descMatch = category.description?.toLowerCase().includes(keyword);
        if (!nameMatch && !descMatch) return false;
      }
      if (filters.priceRange) {
        const { min, max } = filters.priceRange;
        if (min !== undefined && category.priceInfo.unitPrice && category.priceInfo.unitPrice < min) return false;
        if (max !== undefined && category.priceInfo.unitPrice && category.priceInfo.unitPrice > max) return false;
      }
      if (filters.createdAfter && category.createdAt < new Date(filters.createdAfter)) return false;
      if (filters.createdBefore && category.createdAt > new Date(filters.createdBefore)) return false;
      if (filters.updatedAfter && category.updatedAt < new Date(filters.updatedAfter)) return false;
      if (filters.updatedBefore && category.updatedAt > new Date(filters.updatedBefore)) return false;

      return true;
    });
  }

  private applySorting(categories: CategoryEntity[], sort: CategorySortOptions): CategoryEntity[] {
    return categories.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sort.field) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'sortOrder':
          aValue = a.sortOrder;
          bValue = b.sortOrder;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'updatedAt':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        case 'level':
          aValue = a.level;
          bValue = b.level;
          break;
        case 'totalOrders':
          aValue = a.stats?.totalOrders || 0;
          bValue = b.stats?.totalOrders || 0;
          break;
        default:
          aValue = a.sortOrder;
          bValue = b.sortOrder;
      }

      if (sort.direction === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });
  }

  private async calculateLevel(parentId: number): Promise<number> {
    const parent = await this.findById(parentId);
    return parent ? parent.level + 1 : 0;
  }

  private async calculatePath(parentId: number, childId: number): Promise<string> {
    const parent = await this.findById(parentId);
    return parent ? `${parent.path}/${childId}` : String(childId);
  }
}
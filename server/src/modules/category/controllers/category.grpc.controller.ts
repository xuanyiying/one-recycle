import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CategoryService } from '../services/category.service';
import {
  PricingService,
  PricingItemInput,
} from '../../pricing/pricing.service';
import {
  GetCategoryRequest,
  ListCategoriesRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  DeleteCategoryRequest,
  GetCategoryTreeRequest,
  PricingEstimateRequest,
  CategoryResponse,
  ListCategoriesResponse,
  CategoryTreeResponse,
  PricingEstimateResponse,
  Empty,
  PricingItem,
} from '@/proto/category.pb';
import { CategoryType } from '../dto';

@Controller()
export class CategoryGrpcController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly pricingService: PricingService,
  ) {}

  @GrpcMethod('CategoryService', 'GetCategory')
  async getCategory(data: GetCategoryRequest): Promise<CategoryResponse> {
    const result = await this.categoryService.findOne(data.id);
    return this.mapToCategoryResponse(result);
  }

  @GrpcMethod('CategoryService', 'ListCategories')
  async listCategories(
    data: ListCategoriesRequest,
  ): Promise<ListCategoriesResponse> {
    const result = await this.categoryService.findMany({
      type: data.type as CategoryType,
      parentId: data.parentId,
      isVisible: data.isVisible,
      isFeatured: data.isFeatured,
      keyword: data.keyword,
      page: data.page || 1,
      limit: data.limit || 20,
    });
    return {
      items: result.items.map((item) => this.mapToCategoryResponse(item)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @GrpcMethod('CategoryService', 'CreateCategory')
  async createCategory(data: CreateCategoryRequest): Promise<CategoryResponse> {
    const result = await this.categoryService.create({
      name: data.name,
      description: data.description,
      type: data.type as CategoryType,
      parentId: data.parentId,
      priceInfo: {
        type: (data.priceType || 'fixed') as any,
        unitPrice: data.unitPrice,
        unit: data.unit || 'kg',
        currency: data.currency || 'CNY',
      },
      iconUrl: data.iconUrl,
      sortOrder: data.sortOrder,
      isVisible: data.isVisible,
      isFeatured: data.isFeatured,
      seo: { slug: data.slug || data.name },
      pricingRule: data.basePrice
        ? {
            basePrice: data.basePrice,
            minWeight: data.minWeight,
            maxWeight: data.maxWeight,
          }
        : undefined,
    });
    return this.mapToCategoryResponse(result);
  }

  @GrpcMethod('CategoryService', 'UpdateCategory')
  async updateCategory(data: UpdateCategoryRequest): Promise<CategoryResponse> {
    const result = await this.categoryService.update(data.id, {
      name: data.name,
      description: data.description,
      type: data.type as CategoryType,
      parentId: data.parentId,
      priceInfo:
        data.unitPrice || data.priceType
          ? {
              type: (data.priceType || 'fixed') as any,
              unitPrice: data.unitPrice,
              unit: data.unit || 'kg',
              currency: data.currency || 'CNY',
            }
          : undefined,
      iconUrl: data.iconUrl,
      sortOrder: data.sortOrder,
      isVisible: data.isVisible,
      isFeatured: data.isFeatured,
      seo: data.slug ? { slug: data.slug } : undefined,
      pricingRule: data.basePrice
        ? {
            basePrice: data.basePrice,
            minWeight: data.minWeight,
            maxWeight: data.maxWeight,
          }
        : undefined,
    });
    return this.mapToCategoryResponse(result);
  }

  @GrpcMethod('CategoryService', 'DeleteCategory')
  async deleteCategory(data: DeleteCategoryRequest): Promise<Empty> {
    await this.categoryService.remove(data.id);
    return {};
  }

  @GrpcMethod('CategoryService', 'GetCategoryTree')
  async getCategoryTree(
    data: GetCategoryTreeRequest,
  ): Promise<CategoryTreeResponse> {
    const items = await this.categoryService.findTree(data.parentId ?? null);
    return {
      items: items.map((item) => this.mapToCategoryResponse(item)),
    };
  }

  @GrpcMethod('CategoryService', 'GetPricingEstimate')
  async getPricingEstimate(
    data: PricingEstimateRequest,
  ): Promise<PricingEstimateResponse> {
    const items: PricingItemInput[] = (data.items || []).map(
      (item: PricingItem) => ({
        categoryId: String(item.categoryId),
        categoryName: item.categoryName,
        condition: item.condition,
        weight: item.weight,
        quantity: item.quantity,
      }),
    );
    const result = await this.pricingService.estimatePricing(
      items,
      data.tenantId,
      data.orderType,
    );
    return {
      itemsTotal: result.pricing.itemsTotal,
      serviceFee: result.pricing.serviceFee,
      totalEstimate: result.pricing.totalEstimate,
      breakdown: result.pricing.breakdown.map((b) => ({
        itemId: Number(b.itemId),
        itemName: b.itemName,
        quantity: b.quantity,
        weight: b.weight,
        unitPrice: b.unitPrice,
        subtotal: b.subtotal,
      })),
    };
  }

  private mapToCategoryResponse(data: any): CategoryResponse {
    return {
      id: Number(data.id),
      name: data.name,
      description: data.description,
      type: data.type,
      parentId: data.parentId,
      priceType: data.priceInfo?.type,
      unitPrice: data.priceInfo?.unitPrice,
      unit: data.priceInfo?.unit,
      currency: data.priceInfo?.currency,
      iconUrl: data.iconUrl,
      sortOrder: data.sortOrder,
      isVisible: data.isVisible,
      isFeatured: data.isFeatured,
      level: data.level,
      path: data.path,
      slug: data.seo?.slug,
      basePrice: data.pricingRule?.basePrice,
      createdAt: data.createdAt?.toISOString?.() || data.createdAt,
      updatedAt: data.updatedAt?.toISOString?.() || data.updatedAt,
    };
  }
}

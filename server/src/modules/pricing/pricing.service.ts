import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

const DEFAULT_CONDITION_MULTIPLIERS: Record<string, number> = {
  new: 1.2,
  good: 1.0,
  fair: 0.7,
};

const DEFAULT_SERVICE_FEE_PERCENTAGE = 0.05;
const DEFAULT_MINIMUM_SERVICE_FEE = 2;
const DEFAULT_VARIANCE = 0.2;

export interface PricingItemInput {
  id?: string;
  categoryId: string;
  categoryName?: string;
  condition?: string;
  weight?: number;
  quantity?: number;
}

export interface PriceRange {
  min: number;
  max: number;
  currency: 'CNY';
}

export interface PriceBreakdown {
  itemId: string;
  itemName: string;
  quantity: number;
  weight: number;
  unitPrice: number;
  subtotal: PriceRange;
}

export interface OrderPricing {
  itemsTotal: PriceRange;
  serviceFee: number;
  totalEstimate: PriceRange;
  breakdown: PriceBreakdown[];
}

export interface ItemPricingResult {
  itemId: string;
  unitPrice: number;
  subtotal: PriceRange;
  weight: number;
  quantity: number;
}

interface CategoryPriceInfo {
  type?: string;
  unitPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  unit?: string;
  currency?: string;
}

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async estimatePricing(
    items: PricingItemInput[],
    tenantId?: string | number,
    orderType?: string,
  ) {
    const normalizedItems = items || [];
    if (normalizedItems.length === 0) {
      return {
        pricing: this.emptyPricing(),
        itemResults: [],
      };
    }
    const normalizedOrderType =
      typeof orderType === 'string' && orderType.trim()
        ? orderType.toUpperCase()
        : 'RECYCLE';

    const categoryIds = Array.from(
      new Set(normalizedItems.map((item) => Number(item.categoryId))),
    ).filter((id) => !Number.isNaN(id));

    const [rules, categories, activeProvider] = await this.prisma.$transaction([
      this.prisma.recyclePricingRule.findMany({
        where: {
          isActive: true,
          categoryId: { in: categoryIds },
          ...(tenantId ? { tenantId: Number(tenantId) } : {}),
        },
      }),
      this.prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, priceInfo: true, name: true },
      }),
      this.prisma.logisticsProvider.findFirst({
        where: {
          isActive: true,
          ...(tenantId ? { tenantId: String(tenantId) } : {}),
        },
        orderBy: { createdAt: 'desc' },
        select: { config: true },
      }),
    ]);

    const pricingConfig = this.parseProviderConfig(activeProvider?.config);
    const varianceRatio = this.normalizeRatio(
      pricingConfig?.pricing?.variance ?? pricingConfig?.variance,
      DEFAULT_VARIANCE,
    );
    const serviceFeePercentage = this.normalizeRatio(
      pricingConfig?.pricing?.serviceFeePercentage ??
        pricingConfig?.serviceFeePercentage,
      DEFAULT_SERVICE_FEE_PERCENTAGE,
    );
    const minimumServiceFee = this.normalizeMoney(
      pricingConfig?.pricing?.minimumServiceFee ??
        pricingConfig?.minimumServiceFee,
      DEFAULT_MINIMUM_SERVICE_FEE,
    );

    const ruleMap = new Map<number, (typeof rules)[number]>();
    rules.forEach((rule) => {
      ruleMap.set(Number(rule.categoryId), rule);
    });
    const categoryMap = new Map<number, (typeof categories)[number]>();
    categories.forEach((category) => {
      categoryMap.set(Number(category.id), category);
    });

    const breakdown: PriceBreakdown[] = [];
    const itemResults: ItemPricingResult[] = [];
    let itemsMinTotal = 0;
    let itemsMaxTotal = 0;
    const missingPricingCategoryIds = new Set<number>();

    normalizedItems.forEach((item) => {
      const itemId = item.id || item.categoryId;
      const rawWeight = typeof item.weight === 'number' ? item.weight : 0;
      const rawQuantity = typeof item.quantity === 'number' ? item.quantity : 0;
      const hasWeight = rawWeight > 0;
      const hasQuantity = rawQuantity > 0;
      const quantity = hasWeight ? 1 : hasQuantity ? rawQuantity : 0;
      const weight = hasWeight ? rawWeight : 0;
      const categoryId = Number(item.categoryId);
      const rule = ruleMap.get(categoryId);
      const category = categoryMap.get(categoryId);

      const ruleJson = this.parseRuleJson(rule?.ruleJson);
      const basePriceFromRule =
        typeof rule?.basePrice === 'number' ? rule.basePrice : 0;
      const basePrice =
        typeof ruleJson?.basePrice === 'number'
          ? ruleJson.basePrice
          : basePriceFromRule;

      const conditionMultiplier =
        (ruleJson?.conditionMultipliers &&
          item.condition &&
          typeof ruleJson?.conditionMultipliers[item.condition] === 'number' &&
          ruleJson.conditionMultipliers[item.condition]) ||
        (item.condition
          ? DEFAULT_CONDITION_MULTIPLIERS[item.condition]
          : undefined) ||
        1;

      const weightFactor = hasWeight ? this.calculateWeightFactor(weight) : 1;
      const priceInfo = this.parsePriceInfo(category?.priceInfo);
      const isRuleApplicable =
        hasWeight &&
        this.isRuleApplicable(
          rule
            ? {
                minWeight:
                  rule.minWeight !== null ? Number(rule.minWeight) : null,
                maxWeight:
                  rule.maxWeight !== null ? Number(rule.maxWeight) : null,
              }
            : undefined,
          weight,
        );

      let unitPrice = 0;
      let priceRange: PriceRange | undefined;

      if (isRuleApplicable && basePrice > 0) {
        const unitPriceBase = this.applyWeightTiers(
          ruleJson?.weightTiers,
          weight,
          basePrice,
        );
        unitPrice = unitPriceBase * conditionMultiplier * weightFactor;
        const totalPrice = unitPrice * weight;
        const variance = totalPrice * varianceRatio;
        const minPrice = Math.max(totalPrice - variance, 0);
        const maxPrice = totalPrice + variance;
        priceRange = {
          min: Math.round(minPrice * 100) / 100,
          max: Math.round(maxPrice * 100) / 100,
          currency: 'CNY',
        };
      } else if (
        priceInfo?.type === 'range' &&
        typeof priceInfo.minPrice === 'number' &&
        typeof priceInfo.maxPrice === 'number' &&
        priceInfo.minPrice > 0 &&
        priceInfo.maxPrice > 0
      ) {
        const minUnit = priceInfo.minPrice * conditionMultiplier * weightFactor;
        const maxUnit = priceInfo.maxPrice * conditionMultiplier * weightFactor;
        const dimensionMultiplier = hasWeight ? weight : quantity;
        const minTotal = Math.max(minUnit, 0) * dimensionMultiplier;
        const maxTotal = Math.max(maxUnit, 0) * dimensionMultiplier;
        unitPrice = (minUnit + maxUnit) / 2;
        priceRange = {
          min: Math.round(minTotal * 100) / 100,
          max: Math.round(maxTotal * 100) / 100,
          currency: 'CNY',
        };
      } else if (
        priceInfo?.type === 'fixed' &&
        typeof priceInfo.unitPrice === 'number' &&
        priceInfo.unitPrice > 0
      ) {
        const unitPriceBase = priceInfo.unitPrice;
        unitPrice = unitPriceBase * conditionMultiplier * weightFactor;
        const totalPrice = unitPrice * (hasWeight ? weight : quantity);
        const variance = totalPrice * varianceRatio;
        const minPrice = Math.max(totalPrice - variance, 0);
        const maxPrice = totalPrice + variance;
        priceRange = {
          min: Math.round(minPrice * 100) / 100,
          max: Math.round(maxPrice * 100) / 100,
          currency: 'CNY',
        };
      } else if (!hasWeight && basePrice > 0) {
        unitPrice = basePrice * conditionMultiplier;
        const totalPrice = unitPrice * quantity;
        const variance = totalPrice * varianceRatio;
        const minPrice = Math.max(totalPrice - variance, 0);
        const maxPrice = totalPrice + variance;
        priceRange = {
          min: Math.round(minPrice * 100) / 100,
          max: Math.round(maxPrice * 100) / 100,
          currency: 'CNY',
        };
      }

      if (!priceRange || unitPrice <= 0) {
        missingPricingCategoryIds.add(categoryId);
        return;
      }

      breakdown.push({
        itemId,
        itemName: item.categoryName || category?.name || '',
        quantity,
        weight,
        unitPrice: Math.round(unitPrice * 100) / 100,
        subtotal: priceRange,
      });

      itemResults.push({
        itemId,
        unitPrice: Math.round(unitPrice * 100) / 100,
        subtotal: priceRange,
        weight,
        quantity,
      });

      itemsMinTotal += priceRange.min;
      itemsMaxTotal += priceRange.max;
    });

    if (missingPricingCategoryIds.size > 0) {
      throw new BadRequestException({
        message: 'Pricing data missing for categories',
        categoryIds: Array.from(missingPricingCategoryIds),
        tenantId: tenantId ? Number(tenantId) : undefined,
      });
    }

    const averageItemsTotal = (itemsMinTotal + itemsMaxTotal) / 2;
    const serviceFee =
      normalizedOrderType === 'RECYCLE'
        ? 0
        : Math.max(
            Math.round(averageItemsTotal * serviceFeePercentage * 100) / 100,
            minimumServiceFee,
          );

    const totalMin = Math.round((itemsMinTotal + serviceFee) * 100) / 100;
    const totalMax = Math.round((itemsMaxTotal + serviceFee) * 100) / 100;

    const pricing: OrderPricing = {
      itemsTotal: {
        min: Math.round(itemsMinTotal * 100) / 100,
        max: Math.round(itemsMaxTotal * 100) / 100,
        currency: 'CNY',
      },
      serviceFee,
      totalEstimate: {
        min: totalMin,
        max: totalMax,
        currency: 'CNY',
      },
      breakdown,
    };

    return { pricing, itemResults };
  }

  private emptyPricing(): OrderPricing {
    return {
      itemsTotal: { min: 0, max: 0, currency: 'CNY' },
      serviceFee: 0,
      totalEstimate: { min: 0, max: 0, currency: 'CNY' },
      breakdown: [],
    };
  }

  private calculateWeightFactor(weight: number) {
    if (weight <= 0) return 1.0;
    const factor = 1 + (weight - 1) * 0.1;
    return Math.min(factor, 2.0);
  }

  private parseRuleJson(ruleJson: unknown): any {
    if (!ruleJson) return undefined;
    if (typeof ruleJson === 'string') {
      try {
        return JSON.parse(ruleJson);
      } catch {
        return undefined;
      }
    }
    return ruleJson;
  }

  private applyWeightTiers(
    weightTiers:
      | Array<{
          min?: number;
          max?: number;
          multiplier?: number;
          price?: number;
        }>
      | undefined,
    weight: number,
    basePrice: number,
  ) {
    if (!weightTiers || weightTiers.length === 0) return basePrice;
    const tier = weightTiers.find((tierItem) => {
      const minOk =
        typeof tierItem.min === 'number' ? weight >= tierItem.min : true;
      const maxOk =
        typeof tierItem.max === 'number' ? weight <= tierItem.max : true;
      return minOk && maxOk;
    });
    if (!tier) return basePrice;
    if (typeof tier.price === 'number') return tier.price;
    if (typeof tier.multiplier === 'number') return basePrice * tier.multiplier;
    return basePrice;
  }

  private parsePriceInfo(raw: unknown): CategoryPriceInfo | undefined {
    if (!raw) return undefined;
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return undefined;
      }
    }
    if (typeof raw === 'object') {
      return raw as CategoryPriceInfo;
    }
    return undefined;
  }

  private parseProviderConfig(raw: unknown): any {
    if (!raw) return undefined;
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return undefined;
      }
    }
    if (typeof raw === 'object') {
      return raw as any;
    }
    return undefined;
  }

  private normalizeRatio(value: unknown, fallback: number) {
    const numeric =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? Number(value)
          : NaN;
    if (!Number.isFinite(numeric)) return fallback;
    if (numeric < 0) return 0;
    if (numeric > 1) return 1;
    return numeric;
  }

  private normalizeMoney(value: unknown, fallback: number) {
    const numeric =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? Number(value)
          : NaN;
    if (!Number.isFinite(numeric)) return fallback;
    return Math.max(0, numeric);
  }

  private isRuleApplicable(
    rule: { minWeight: number | null; maxWeight: number | null } | undefined,
    weight: number,
  ) {
    if (!rule) return false;
    if (typeof rule.minWeight === 'number' && weight < rule.minWeight)
      return false;
    if (typeof rule.maxWeight === 'number' && weight > rule.maxWeight)
      return false;
    return true;
  }
}

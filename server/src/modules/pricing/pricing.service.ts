import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

const DEFAULT_CONDITION_MULTIPLIERS: Record<string, number> = {
  new: 1.2,
  good: 1.0,
  fair: 0.7,
};

const SERVICE_FEE_PERCENTAGE = 0.05;
const MINIMUM_SERVICE_FEE = 2;
const VARIANCE = 0.2;

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

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async estimatePricing(items: PricingItemInput[], tenantId?: string | number) {
    const normalizedItems = items || [];
    if (normalizedItems.length === 0) {
      return {
        pricing: this.emptyPricing(),
        itemResults: [],
      };
    }

    const categoryIds = Array.from(
      new Set(normalizedItems.map((item) => Number(item.categoryId))),
    ).filter((id) => !Number.isNaN(id));

    const rules = await this.prisma.recyclePricingRule.findMany({
      where: {
        isActive: true,
        categoryId: { in: categoryIds },
        ...(tenantId ? { tenantId: Number(tenantId) } : {}),
      },
    });

    const ruleMap = new Map<number, (typeof rules)[number]>();
    rules.forEach((rule) => {
      ruleMap.set(Number(rule.categoryId), rule);
    });

    const breakdown: PriceBreakdown[] = [];
    const itemResults: ItemPricingResult[] = [];
    let itemsMinTotal = 0;
    let itemsMaxTotal = 0;

    normalizedItems.forEach((item) => {
      const itemId =
        item.id || `${item.categoryId}-${Math.random().toString(36).slice(2)}`;
      const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
      const weight = item.weight && item.weight > 0 ? item.weight : 1;
      const rule = ruleMap.get(Number(item.categoryId));

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
          typeof ruleJson.conditionMultipliers[item.condition] === 'number' &&
          ruleJson.conditionMultipliers[item.condition]) ||
        (item.condition
          ? DEFAULT_CONDITION_MULTIPLIERS[item.condition]
          : undefined) ||
        1;

      const weightFactor = this.calculateWeightFactor(weight);
      const unitPriceBase = this.applyWeightTiers(
        ruleJson?.weightTiers,
        weight,
        basePrice,
      );
      const unitPrice = unitPriceBase * conditionMultiplier * weightFactor;
      const totalPrice = unitPrice * quantity;

      const variance = totalPrice * VARIANCE;
      const minPrice = Math.max(totalPrice - variance, 0);
      const maxPrice = totalPrice + variance;

      const priceRange: PriceRange = {
        min: Math.round(minPrice * 100) / 100,
        max: Math.round(maxPrice * 100) / 100,
        currency: 'CNY',
      };

      breakdown.push({
        itemId,
        itemName: item.categoryName || String(item.categoryId),
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

    const averageItemsTotal = (itemsMinTotal + itemsMaxTotal) / 2;
    const serviceFee = Math.max(
      Math.round(averageItemsTotal * SERVICE_FEE_PERCENTAGE * 100) / 100,
      MINIMUM_SERVICE_FEE,
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
}

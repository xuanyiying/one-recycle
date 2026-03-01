import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AddressParser } from '../utils/address-parser.util';
import { QuantityParser } from '../utils/quantity-parser.util';

@Injectable()
export class EntityEngine {
  private readonly logger = new Logger(EntityEngine.name);
  private itemCategories: Map<number, { id: number; name: string; synonyms: string[] }> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly addressParser: AddressParser,
    private readonly quantityParser: QuantityParser,
  ) {
    this.loadItemCategories();
  }

  /**
   * 加载物品分类数据
   */
  private async loadItemCategories(): Promise<void> {
    try {
      const categories = await this.prisma.category.findMany({
        where: { isVisible: true },
        select: {
          id: true,
          name: true,
          attributes: true, // 存储同义词
        },
      });

      this.itemCategories.clear();
      for (const category of categories) {
        const synonyms = category.attributes ? JSON.parse(category.attributes) : [];
        this.itemCategories.set(category.id, {
          id: category.id,
          name: category.name,
          synonyms: synonyms || [],
        });
      }

      this.logger.log(`Loaded ${this.itemCategories.size} item categories`);
    } catch (error) {
      this.logger.error('Failed to load item categories', error);
    }
  }

  /**
   * 从文本中抽取所有实体
   */
  async extractAllEntities(text: string): Promise<Record<string, any>> {
    // 并行抽取各类实体
    const [itemType, quantity, address, time, contact] = await Promise.all([
      this.extractItemType(text),
      this.extractQuantity(text),
      this.extractAddress(text),
      this.extractTime(text),
      this.extractContact(text),
    ]);

    return {
      ...itemType,
      ...quantity,
      ...address,
      ...time,
      ...contact,
    };
  }

  /**
   * 抽取物品类型
   */
  async extractItemType(text: string): Promise<{ itemCategoryId?: number; itemName?: string; matchedKeyword?: string }> {
    // 1. 从分类数据中匹配
    for (const [id, category] of this.itemCategories.entries()) {
      const allNames = [category.name, ...category.synonyms];
      for (const name of allNames) {
        if (text.includes(name)) {
          return {
            itemCategoryId: id,
            itemName: category.name,
            matchedKeyword: name,
          };
        }
      }
    }

    // 2. 模糊匹配（编辑距离）
    const fuzzyMatch = await this.fuzzyItemTypeMatch(text);
    if (fuzzyMatch) {
      return fuzzyMatch;
    }

    return {};
  }

  /**
   * 模糊匹配物品类型
   */
  private async fuzzyItemTypeMatch(text: string): Promise<{ itemCategoryId?: number; itemName?: string; matchedKeyword?: string } | null> {
    // 简化的模糊匹配实现
    // 实际项目中可以使用 edit-distance 或 node-nlp 库

    const keywords = ['衣服', '书', '家电', '家具', '纸板', '塑料', '金属'];

    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        // 找到最接近的分类
        for (const [id, category] of this.itemCategories.entries()) {
          if (category.name.includes(keyword)) {
            return {
              itemCategoryId: id,
              itemName: category.name,
              matchedKeyword: keyword,
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * 抽取数量
   */
  async extractQuantity(text: string): Promise<{ quantity?: number; unit?: string }> {
    return this.quantityParser.parse(text);
  }

  /**
   * 抽取地址
   */
  async extractAddress(text: string): Promise<{
    province?: string;
    city?: string;
    district?: string;
    detail?: string;
    complete?: boolean;
  }> {
    const parsed = await this.addressParser.parse(text);

    // 检查地址完整性
    const hasAllFields = !!(parsed.province && parsed.city && parsed.district && parsed.detail);

    return {
      ...parsed,
      complete: hasAllFields,
    };
  }

  /**
   * 抽取时间
   */
  async extractTime(text: string): Promise<{
    timeType?: 'today' | 'tomorrow' | 'specific';
    timePeriod?: 'morning' | 'afternoon' | 'evening';
    hour?: number;
    minute?: number;
    month?: number;
    day?: number;
    dateString?: string;
  }> {
    const entities: any = {};

    // 相对日期
    if (text.includes('今天')) {
      entities.timeType = 'today';
      const today = new Date();
      entities.dateString = this.formatDate(today);
    } else if (text.includes('明天')) {
      entities.timeType = 'tomorrow';
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      entities.dateString = this.formatDate(tomorrow);
    } else if (text.includes('后天')) {
      entities.timeType = 'specific';
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      entities.dateString = this.formatDate(dayAfter);
    }

    // 具体日期
    const datePattern = /(\d{1,2}) 月 (\d{1,2}) 日？/;
    const dateMatch = datePattern.exec(text);
    if (dateMatch) {
      entities.timeType = 'specific';
      entities.month = parseInt(dateMatch[1]);
      entities.day = parseInt(dateMatch[2]);

      const year = new Date().getFullYear();
      const date = new Date(year, entities.month - 1, entities.day);
      entities.dateString = this.formatDate(date);
    }

    // 时间段
    if (text.includes('上午') || text.includes('早上')) {
      entities.timePeriod = 'morning';
      entities.hour = 9;
    } else if (text.includes('下午')) {
      entities.timePeriod = 'afternoon';
      entities.hour = 14;
    } else if (text.includes('晚上')) {
      entities.timePeriod = 'evening';
      entities.hour = 19;
    } else if (text.includes('中午')) {
      entities.timePeriod = 'noon';
      entities.hour = 12;
    }

    // 具体时间点
    const timePattern = /(\d{1,2})[点时](\d{1,2})?分？/;
    const timeMatch = timePattern.exec(text);
    if (timeMatch) {
      entities.hour = parseInt(timeMatch[1]);
      entities.minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;

      // 如果没有日期，默认为明天
      if (!entities.dateString) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        entities.dateString = this.formatDate(tomorrow);
        entities.timeType = 'tomorrow';
      }
    }

    return entities;
  }

  /**
   * 格式化日期
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 抽取联系方式
   */
  async extractContact(text: string): Promise<{
    phone?: string;
    useDefault?: boolean;
    isValid?: boolean;
  }> {
    const entities: any = {};

    // 手机号匹配
    const phonePattern = /1[3-9]\d{9}/g;
    const phoneMatch = text.match(phonePattern);
    if (phoneMatch && phoneMatch.length > 0) {
      const phone = phoneMatch[0];
      entities.phone = phone;
      entities.isValid = this.validatePhoneNumber(phone);
    }

    // 检查是否使用默认
    if (text.includes('使用默认') || text.includes('默认') || text.includes('本机')) {
      entities.useDefault = true;
    }

    return entities;
  }

  /**
   * 验证手机号
   */
  private validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * 验证数据完整性
   */
  validateEntities(entities: Record<string, any>): {
    isValid: boolean;
    missingFields: string[];
    errors: string[];
  } {
    const missingFields: string[] = [];
    const errors: string[] = [];

    // 检查物品类型
    if (!entities.itemCategoryId || !entities.itemName) {
      missingFields.push('物品类型');
    }

    // 检查数量
    if (!entities.quantity || entities.quantity <= 0) {
      missingFields.push('数量');
    }

    // 检查地址
    if (!entities.province) missingFields.push('省份');
    if (!entities.city) missingFields.push('城市');
    if (!entities.district) missingFields.push('区县');
    if (!entities.detail) missingFields.push('详细地址');

    // 检查联系方式
    if (!entities.phone && !entities.useDefault) {
      missingFields.push('联系电话');
    } else if (entities.phone && !entities.isValid) {
      errors.push('手机号格式不正确');
    }

    // 检查时间
    if (!entities.dateString && !entities.timeType) {
      missingFields.push('取件时间');
    }

    return {
      isValid: missingFields.length === 0 && errors.length === 0,
      missingFields,
      errors,
    };
  }
}

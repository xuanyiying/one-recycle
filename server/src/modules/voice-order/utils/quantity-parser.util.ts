import { Injectable } from '@nestjs/common';

export interface ParsedQuantity {
  quantity?: number;
  unit?: string;
  originalText?: string;
}

@Injectable()
export class QuantityParser {
  // Logger removed as it's not used

  // 中文数字映射
  private readonly chineseNumbers: Record<string, number> = {
    零: 0,
    一: 1,
    壹: 1,
    '1': 1,
    二: 2,
    两: 2,
    贰: 2,
    '2': 2,
    三: 3,
    叁: 3,
    '3': 3,
    四: 4,
    肆: 4,
    '4': 4,
    五: 5,
    伍: 5,
    '5': 5,
    六: 6,
    陆: 6,
    '6': 6,
    七: 7,
    柒: 7,
    '7': 7,
    八: 8,
    捌: 8,
    '8': 8,
    九: 9,
    玖: 9,
    '9': 9,
    十: 10,
    拾: 10,
    '10': 10,
  };

  // 重量单位
  private readonly weightUnits = [
    '公斤',
    'kg',
    'KG',
    '斤',
    '两',
    '吨',
    't',
    'T',
  ];

  // 数量单位
  private readonly countUnits = [
    '件',
    '个',
    '只',
    '条',
    '本',
    '台',
    '张',
    '箱',
    '袋',
    '包',
    '捆',
    '堆',
  ];

  /**
   * 解析数量文本
   */
  parse(text: string): ParsedQuantity {
    const result: ParsedQuantity = {
      originalText: text,
    };

    // 1. 尝试匹配数字 + 单位格式
    const numberUnitMatch = this.matchNumberWithUnit(text);
    if (numberUnitMatch) {
      return numberUnitMatch;
    }

    // 2. 尝试匹配中文数字
    const chineseMatch = this.matchChineseNumber(text);
    if (chineseMatch) {
      return chineseMatch;
    }

    // 3. 尝试匹配纯数字
    const pureNumberMatch = this.matchPureNumber(text);
    if (pureNumberMatch) {
      return pureNumberMatch;
    }

    return result;
  }

  /**
   * 匹配数字 + 单位格式
   */
  private matchNumberWithUnit(text: string): ParsedQuantity | null {
    // 匹配模式：数字 (小数) + 可选单位
    const pattern =
      /(\d+\.?\d*)\s*(公斤|kg|KG|斤 | 两 | 吨 |t|T|件 | 个 | 只 | 条 | 本 | 台 | 张 | 箱 | 袋 | 包 | 捆 | 堆)?/g;
    const matches = [...text.matchAll(pattern)];

    if (matches.length > 0) {
      const match = matches[0];
      const quantity = parseFloat(match[1]);
      const unit = match[2] || this.inferUnit(text, quantity);

      if (quantity > 0) {
        return {
          quantity,
          unit,
          originalText: match[0],
        };
      }
    }

    return null;
  }

  /**
   * 匹配中文数字
   */
  private matchChineseNumber(text: string): ParsedQuantity | null {
    // 查找中文数字
    for (const [cnChar, number] of Object.entries(this.chineseNumbers)) {
      // 检查是否包含中文数字且后面跟有单位
      for (const unit of [...this.weightUnits, ...this.countUnits]) {
        if (
          text.includes(cnChar + unit) ||
          text.includes(cnChar + '个' + unit)
        ) {
          return {
            quantity: number,
            unit,
            originalText: cnChar + unit,
          };
        }
      }

      // 单独使用中文数字
      if (text.includes(cnChar) && !text.match(/\d/)) {
        const unit = this.inferUnit(text, number);
        return {
          quantity: number,
          unit,
          originalText: cnChar,
        };
      }
    }

    return null;
  }

  /**
   * 匹配纯数字
   */
  private matchPureNumber(text: string): ParsedQuantity | null {
    const pureNumberPattern = /\b\d+(\.\d+)?\b/;
    const match = text.match(pureNumberPattern);

    if (match) {
      const quantity = parseFloat(match[0]);
      if (quantity > 0) {
        const unit = this.inferUnit(text, quantity);
        return {
          quantity,
          unit,
          originalText: match[0],
        };
      }
    }

    return null;
  }

  /**
   * 推断单位
   */
  private inferUnit(text: string, quantity: number): string {
    // 根据上下文推断单位
    if (text.includes('衣服') || text.includes('衣物') || text.includes('书')) {
      return '件';
    }

    if (text.includes('公斤') || text.includes('kg')) {
      return '公斤';
    }

    if (text.includes('斤')) {
      return '斤';
    }

    // 默认单位
    if (quantity < 10) {
      return '件';
    }

    return '公斤';
  }

  /**
   * 转换单位到标准单位（公斤）
   */
  convertToKilograms(quantity: number, unit: string): number {
    const conversionRates: Record<string, number> = {
      公斤: 1,
      kg: 1,
      KG: 1,
      斤: 0.5,
      两: 0.05,
      吨: 1000,
      t: 1000,
      T: 1000,
    };

    const rate = conversionRates[unit] || 1;
    return quantity * rate;
  }

  /**
   * 验证数量
   */
  validate(quantity: ParsedQuantity): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!quantity.quantity || quantity.quantity <= 0) {
      errors.push('数量必须大于 0');
    }

    if (quantity.quantity && quantity.quantity > 10000) {
      errors.push('数量过大，请确认是否正确');
    }

    if (!quantity.unit) {
      errors.push('缺少单位');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 格式化数量
   */
  format(quantity: ParsedQuantity): string {
    if (!quantity.quantity) {
      return '未知数量';
    }

    return `${quantity.quantity}${quantity.unit || ''}`;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import {
  VoiceOrderIntent,
  IntentRecognitionResult,
  DialogContext,
} from '../interfaces/voice-order.interface';

@Injectable()
export class IntentEngine {
  private readonly logger = new Logger(IntentEngine.name);

  // 意图关键词库
  private readonly intentKeywords: Map<VoiceOrderIntent, string[]> = new Map([
    // 物品类型
    [VoiceOrderIntent.PROVIDE_ITEM_TYPE, [
      '回收', '要卖', '有', '是', '想', '打算',
      '旧衣服', '衣服', '衣物', '服装',
      '旧书', '书籍', '书本', '图书', '书',
      '旧家电', '家电', '电器',
      '旧家具', '家具',
      '纸板', '纸箱', '盒子',
      '塑料', '瓶子',
      '金属', '铁', '铜', '铝',
    ]],

    // 数量
    [VoiceOrderIntent.PROVIDE_QUANTITY, [
      '公斤', 'kg', '斤', '两', '吨',
      '件', '个', '只', '条', '本', '台', '张',
      '箱', '袋', '包', '捆',
      '大概', '大约', '左右', '约',
      '多少', '几',
    ]],

    // 地址
    [VoiceOrderIntent.PROVIDE_ADDRESS, [
      '地址', '地方', '位置', '地点',
      '小区', '大厦', '号楼', '单元', '室', '户',
      '路', '街', '道', '巷', '胡同',
      '镇', '乡', '村',
      '附近', '旁边', '对面',
    ]],

    // 联系方式
    [VoiceOrderIntent.PROVIDE_CONTACT, [
      '电话', '手机号', '号码', '联系方式',
      '联系', '打给我', '找我',
      '使用默认', '默认', '本机',
    ]],

    // 时间
    [VoiceOrderIntent.PROVIDE_TIME, [
      '时间', '时候', '何时', '几点',
      '今天', '明天', '后天', '大后天',
      '上午', '下午', '晚上', '早上', '中午', '傍晚',
      '周一', '周二', '周三', '周四', '周五', '周六', '周日',
      '号', '日', '日',
      '方便', '合适', '可以', '行',
    ]],

    // 控制指令
    [VoiceOrderIntent.SKIP_STEP, ['跳过', '下一个', '不用', '不需要', '随便', '无所谓']],
    [VoiceOrderIntent.REPEAT_PROMPT, ['重复', '再说一遍', '没听清', '什么', '啥']],
    [VoiceOrderIntent.GO_BACK, ['返回', '上一步', '回去', '后退']],
    [VoiceOrderIntent.SWITCH_TO_MANUAL, ['手动', '填写', '输入', '打字', '不说了']],

    // 确认指令
    [VoiceOrderIntent.CONFIRM_ORDER, ['确认', '对的', '是的', '没错', '好', '行', '可以', '没问题']],
    [VoiceOrderIntent.MODIFY_INFO, ['修改', '改', '不对', '错了', '不是', '换']],
    [VoiceOrderIntent.CANCEL_ORDER, ['取消', '不要了', '算了', '不卖了', '撤销']],
  ]);

  // 物品类型同义词映射
  private readonly itemTypeMapping: Map<string, string> = new Map([
    ['旧衣服', '旧衣服'],
    ['衣服', '旧衣服'],
    ['衣物', '旧衣服'],
    ['服装', '旧衣服'],
    ['旧书', '旧书籍'],
    ['书籍', '旧书籍'],
    ['书本', '旧书籍'],
    ['图书', '旧书籍'],
    ['书', '旧书籍'],
    ['旧家电', '旧家电'],
    ['家电', '旧家电'],
    ['电器', '旧家电'],
    ['旧家具', '旧家具'],
    ['家具', '旧家具'],
    ['纸板', '纸板'],
    ['纸箱', '纸板'],
    ['盒子', '纸板'],
    ['塑料', '塑料'],
    ['瓶子', '塑料'],
    ['金属', '金属'],
    ['铁', '金属'],
    ['铜', '金属'],
    ['铝', '金属'],
  ]);

  constructor() { }

  /**
   * 识别用户意图
   */
  async recognize(text: string, context: DialogContext): Promise<IntentRecognitionResult> {
    // 1. 文本预处理
    const normalizedText = this.normalizeText(text);

    // 2. 基于规则的意图识别
    const ruleBasedResult = this.ruleBasedRecognition(normalizedText, context);

    // 3. 如果规则识别置信度低，尝试基于关键词的识别
    if (ruleBasedResult.confidence < 0.7) {
      const keywordResult = this.keywordBasedRecognition(normalizedText, context);
      if (keywordResult.confidence > ruleBasedResult.confidence) {
        return keywordResult;
      }
    }

    // 4. 实体抽取
    ruleBasedResult.entities = await this.extractEntities(
      normalizedText,
      ruleBasedResult.intent,
      context,
    );

    this.logger.debug(`Intent recognition: "${text}" -> ${ruleBasedResult.intent} (${ruleBasedResult.confidence})`);

    return ruleBasedResult;
  }

  /**
   * 文本预处理
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[,.!?!,.]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 基于规则的意图识别
   */
  private ruleBasedRecognition(
    text: string,
    context: DialogContext,
  ): IntentRecognitionResult {
    const currentStep = context.currentStep || 'GREETING';

    // 检查控制指令（优先级最高）
    const controlIntent = this.detectControlIntent(text);
    if (controlIntent) {
      return {
        intent: controlIntent,
        confidence: 0.95,
        matchedKeywords: [],
      };
    }

    // 根据当前步骤判断意图
    const stepIntentMap: Record<string, VoiceOrderIntent> = {
      'GREETING': VoiceOrderIntent.PROVIDE_ITEM_TYPE,
      'ITEM_TYPE': VoiceOrderIntent.PROVIDE_ITEM_TYPE,
      'QUANTITY': VoiceOrderIntent.PROVIDE_QUANTITY,
      'ADDRESS': VoiceOrderIntent.PROVIDE_ADDRESS,
      'CONTACT': VoiceOrderIntent.PROVIDE_CONTACT,
      'PICKUP_TIME': VoiceOrderIntent.PROVIDE_TIME,
      'CONFIRMATION': VoiceOrderIntent.CONFIRM_ORDER,
    };

    const expectedIntent = stepIntentMap[currentStep];

    // 检查文本是否包含当前步骤期望的信息
    if (expectedIntent && this.containsIntentKeywords(text, expectedIntent)) {
      return {
        intent: expectedIntent,
        confidence: 0.85,
        matchedKeywords: [],
      };
    }

    // 检查是否包含其他步骤的信息（智能跳过）
    for (const [step, intent] of Object.entries(stepIntentMap)) {
      if (step !== currentStep && this.containsIntentKeywords(text, intent)) {
        return {
          intent: intent,
          confidence: 0.75,
          matchedKeywords: [],
        };
      }
    }

    // 默认返回未知意图
    return {
      intent: VoiceOrderIntent.UNKNOWN,
      confidence: 0.3,
      matchedKeywords: [],
    };
  }

  /**
   * 检测控制指令
   */
  private detectControlIntent(text: string): VoiceOrderIntent | null {
    for (const [intent, keywords] of this.intentKeywords.entries()) {
      // 只检查控制类指令
      if ([
        VoiceOrderIntent.SKIP_STEP,
        VoiceOrderIntent.REPEAT_PROMPT,
        VoiceOrderIntent.GO_BACK,
        VoiceOrderIntent.SWITCH_TO_MANUAL,
        VoiceOrderIntent.CONFIRM_ORDER,
        VoiceOrderIntent.MODIFY_INFO,
        VoiceOrderIntent.CANCEL_ORDER,
      ].includes(intent)) {
        for (const keyword of keywords) {
          if (text.includes(keyword)) {
            return intent;
          }
        }
      }
    }
    return null;
  }

  /**
   * 基于关键词的意图识别
   */
  private keywordBasedRecognition(
    text: string,
    context: DialogContext,
  ): IntentRecognitionResult {
    let maxScore = 0;
    let detectedIntent = VoiceOrderIntent.UNKNOWN;
    let matchedKeywords: string[] = [];

    for (const [intent, keywords] of this.intentKeywords.entries()) {
      let score = 0;
      const currentMatchedKeywords: string[] = [];

      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          score += keyword.length;
          currentMatchedKeywords.push(keyword);
        }
      }

      if (score > maxScore) {
        maxScore = score;
        detectedIntent = intent;
        matchedKeywords = currentMatchedKeywords;
      }
    }

    const confidence = maxScore > 0 ? Math.min(maxScore / 10, 0.95) : 0.3;

    return {
      intent: detectedIntent,
      confidence,
      matchedKeywords,
    };
  }

  /**
   * 检查文本是否包含指定意图的关键词
   */
  private containsIntentKeywords(text: string, intent: VoiceOrderIntent): boolean {
    const keywords = this.intentKeywords.get(intent) || [];
    return keywords.some(keyword => text.includes(keyword));
  }

  /**
   * 抽取实体
   */
  private async extractEntities(
    text: string,
    intent: VoiceOrderIntent,
    context: DialogContext,
  ): Promise<Record<string, any>> {
    const entities: Record<string, any> = {};

    switch (intent) {
      case VoiceOrderIntent.PROVIDE_ITEM_TYPE:
        return this.extractItemType(text);

      case VoiceOrderIntent.PROVIDE_QUANTITY:
        return this.extractQuantity(text);

      case VoiceOrderIntent.PROVIDE_ADDRESS:
        return this.extractAddress(text);

      case VoiceOrderIntent.PROVIDE_TIME:
        return this.extractTime(text);

      case VoiceOrderIntent.PROVIDE_CONTACT:
        return this.extractContact(text);

      default:
        return entities;
    }
  }

  /**
   * 抽取物品类型
   */
  private extractItemType(text: string): Record<string, any> {
    const entities: Record<string, any> = {};

    // 从映射表中查找匹配的物品类型
    for (const [keyword, itemType] of this.itemTypeMapping.entries()) {
      if (text.includes(keyword)) {
        entities.itemType = itemType;
        entities.matchedKeyword = keyword;
        break;
      }
    }

    return entities;
  }

  /**
   * 抽取数量
   */
  private extractQuantity(text: string): Record<string, any> {
    const entities: Record<string, any> = {};

    // 匹配数字 + 单位
    const quantityPattern = /(\d+\.?\d*)\s*(公斤|kg|斤|两|吨|件 | 个 | 只 | 条 | 本 | 台 | 张 | 箱 | 袋 | 包 | 捆)?/g;
    const match = quantityPattern.exec(text);

    if (match) {
      entities.quantity = parseFloat(match[1]);
      entities.unit = match[2] || '件';
    }

    // 中文数字转换
    const chineseNumbers: Record<string, number> = {
      '一': 1, '二': 2, '两': 2, '三': 3, '四': 4,
      '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
    };

    for (const [cn, num] of Object.entries(chineseNumbers)) {
      if (text.includes(cn) && (text.includes('公斤') || text.includes('件'))) {
        entities.quantity = num;
        entities.unit = text.includes('公斤') ? '公斤' : '件';
        break;
      }
    }

    return entities;
  }

  /**
   * 抽取地址
   */
  private extractAddress(text: string): Record<string, any> {
    const entities: Record<string, any> = {};

    // 省市区匹配
    const provincePattern = /(北京 | 上海 | 广东 | 江苏 | 浙江 | 四川 | 湖北 | 湖南) 省？/;
    const cityPattern = /(北京 | 上海 | 广州 | 深圳 | 成都 | 武汉 | 南京 | 杭州) 市？/;
    const districtPattern = /(朝阳 | 海淀 | 浦东 | 天河 | 锦江 | 武昌 | 玄武 | 西湖) 区？/;

    const provinceMatch = provincePattern.exec(text);
    if (provinceMatch) {
      entities.province = provinceMatch[0].replace('省', '');
    }

    const cityMatch = cityPattern.exec(text);
    if (cityMatch) {
      entities.city = cityMatch[0].replace('市', '');
    }

    const districtMatch = districtPattern.exec(text);
    if (districtMatch) {
      entities.district = districtMatch[0].replace('区', '');
    }

    // 详细地址
    if (text.includes('小区') || text.includes('路') || text.includes('号')) {
      entities.detail = text;
    }

    return entities;
  }

  /**
   * 抽取时间
   */
  private extractTime(text: string): Record<string, any> {
    const entities: Record<string, any> = {};

    // 日期匹配
    const datePattern = /(\d{1,2}) 月 (\d{1,2}) 日？/;
    const dateMatch = datePattern.exec(text);
    if (dateMatch) {
      entities.month = parseInt(dateMatch[1]);
      entities.day = parseInt(dateMatch[2]);
    }

    // 相对日期
    if (text.includes('今天')) entities.timeType = 'today';
    if (text.includes('明天')) entities.timeType = 'tomorrow';
    if (text.includes('后天')) entities.timeType = 'day_after_tomorrow';

    // 时间段
    if (text.includes('上午')) entities.timePeriod = 'morning';
    if (text.includes('下午')) entities.timePeriod = 'afternoon';
    if (text.includes('晚上')) entities.timePeriod = 'evening';
    if (text.includes('早上')) entities.timePeriod = 'early_morning';
    if (text.includes('中午')) entities.timePeriod = 'noon';

    // 具体时间点
    const timePattern = /(\d{1,2})[点时](\d{1,2})?分？/;
    const timeMatch = timePattern.exec(text);
    if (timeMatch) {
      entities.hour = parseInt(timeMatch[1]);
      entities.minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    }

    return entities;
  }

  /**
   * 抽取联系方式
   */
  private extractContact(text: string): Record<string, any> {
    const entities: Record<string, any> = {};

    // 手机号匹配
    const phonePattern = /1[3-9]\d{9}/g;
    const phoneMatch = text.match(phonePattern);
    if (phoneMatch) {
      entities.phone = phoneMatch[0];
    }

    // 检查是否使用默认
    if (text.includes('使用默认') || text.includes('默认') || text.includes('本机')) {
      entities.useDefault = true;
    }

    return entities;
  }
}

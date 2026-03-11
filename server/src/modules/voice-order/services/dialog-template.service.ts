import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { DialogStep } from '../dto/voice-input.dto';

@Injectable()
export class DialogTemplateService {
  private readonly logger = new Logger(DialogTemplateService.name);
  private templateCache: Map<string, string[]> = new Map();

  constructor(private readonly prisma: PrismaService) {
    this.loadTemplates();
  }

  /**
   * 加载话术模板到缓存
   */
  async loadTemplates(): Promise<void> {
    try {
      const templates = await this.prisma.dialogTemplate.findMany({
        where: { isActive: true },
        orderBy: { priority: 'desc' },
      });

      this.templateCache.clear();
      for (const template of templates) {
        const key = template.step;
        if (!this.templateCache.has(key)) {
          this.templateCache.set(key, []);
        }
        this.templateCache.get(key)!.push(template.templateText);
      }

      this.logger.log(`Loaded ${templates.length} dialog templates`);
    } catch (error) {
      this.logger.error('Failed to load dialog templates', error);
    }
  }

  /**
   * 获取指定步骤的话术
   */
  getPrompt(step: DialogStep, variables?: Record<string, string>): string {
    const templates = this.templateCache.get(step) || [];
    
    if (templates.length === 0) {
      return this.getDefaultPrompt(step);
    }

    // 随机选择一个话术
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // 替换变量
    if (variables) {
      return this.replaceVariables(template, variables);
    }
    
    return template;
  }

  /**
   * 默认话术
   */
  private getDefaultPrompt(step: DialogStep): string {
    const defaultPrompts: Record<DialogStep, string> = {
      GREETING: '您好！我是您的回收AI助手，请问您今天想回收什么物品呢？',
      ITEM_TYPE: '好的，请问您要回收什么物品呢？我们有旧衣服、旧书籍等。',
      QUANTITY: '明白了，请问大概有多少呢？可以说"5 公斤"、"10 件"等。',
      ADDRESS: '好的，请问您的取件地址是？请详细到门牌号哦。',
      CONTACT: '请问您的联系电话是？说"使用默认"可以用当前账号的手机号。',
      PICKUP_TIME: '请问您希望什么时候上门取件？比如"明天上午"、"后天下午"等。',
      CONFIRMATION: '让我跟您确认一下订单信息，确认无误后我将为您创建订单。',
      COMPLETED: '订单创建成功！感谢您的使用。',
    };

    return defaultPrompts[step] || '请继续使用AI助手进行操作。';
  }

  /**
   * 替换话术中的变量
   */
  private replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
  }

  /**
   * 添加新的话术模板
   */
  async addTemplate(
    step: DialogStep,
    templateText: string,
    priority: number = 0,
  ): Promise<void> {
    await this.prisma.dialogTemplate.create({
      data: {
        step,
        templateCode: `tmpl_${Date.now()}`,
        templateText,
        priority,
        isActive: true,
      },
    });

    // 重新加载缓存
    await this.loadTemplates();
  }
}

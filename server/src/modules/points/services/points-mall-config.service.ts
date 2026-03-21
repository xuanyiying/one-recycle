import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

export interface PointsMallConfig {
  enabled: boolean;
  updatedAt: Date;
  updatedBy?: string;
}

@Injectable()
export class PointsMallConfigService {
  private readonly CONFIG_KEY = 'POINTS_MALL_ENABLED';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取积分商城配置状态
   */
  async getConfig(): Promise<PointsMallConfig> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key: this.CONFIG_KEY },
    });

    if (!config) {
      // 默认开启
      return {
        enabled: true,
        updatedAt: new Date(),
      };
    }

    return {
      enabled: config.value === 'true',
      updatedAt: config.updatedAt,
      updatedBy: config.description?.includes('by:')
        ? config.description.split('by:')[1]?.trim()
        : undefined,
    };
  }

  /**
   * 检查积分商城是否启用
   */
  async isEnabled(): Promise<boolean> {
    const config = await this.getConfig();
    return config.enabled;
  }

  /**
   * 切换积分商城状态
   * @param enabled 是否启用
   * @param operatorId 操作人ID
   * @param operatorName 操作人名称
   */
  async toggleStatus(
    enabled: boolean,
    operatorId?: string,
    operatorName?: string,
  ): Promise<PointsMallConfig> {
    const description = operatorId
      ? `Points mall status toggled by: ${operatorName || operatorId}`
      : 'Points mall status';

    const config = await this.prisma.systemConfig.upsert({
      where: { key: this.CONFIG_KEY },
      update: {
        value: enabled.toString(),
        description,
      },
      create: {
        key: this.CONFIG_KEY,
        value: enabled.toString(),
        description,
        isActive: true,
      },
    });

    return {
      enabled: config.value === 'true',
      updatedAt: config.updatedAt,
      updatedBy: operatorName || operatorId,
    };
  }
}

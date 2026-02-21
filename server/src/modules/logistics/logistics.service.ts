import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateLogisticsProviderDto } from './dto/create-provider.dto';
import { UpdateLogisticsProviderDto } from './dto/update-provider.dto';

@Injectable()
export class LogisticsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateLogisticsProviderDto) {
    return this.prisma.logisticsProvider.create({
      data: createDto,
    });
  }

  async findAll() {
    return this.prisma.logisticsProvider.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const provider = await this.prisma.logisticsProvider.findUnique({
      where: { id },
    });
    if (!provider) {
      throw new NotFoundException(`Logistics provider with ID ${id} not found`);
    }
    return provider;
  }

  async update(id: number, updateDto: UpdateLogisticsProviderDto) {
    await this.findOne(id);
    return this.prisma.logisticsProvider.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.logisticsProvider.delete({
      where: { id },
    });
  }

  async calculateFreight(weight: number, volume: number, distance: number) {
    // 实际应根据 isActive 的 provider 调用外部 API 或使用 config 中的规则
    const activeProviders = await this.prisma.logisticsProvider.findMany({
      where: { isActive: true },
    });

    // 模拟返回首个可用服务商的价格
    if (activeProviders.length > 0) {
      // 假设基础运费 10元 + 2元/kg + 0.5元/km
      return {
        provider: activeProviders[0].name,
        cost: 10 + weight * 2 + distance * 0.5,
      };
    }

    return {
      provider: 'Default',
      cost: 10 + weight * 2, // 默认兜底
    };
  }
}

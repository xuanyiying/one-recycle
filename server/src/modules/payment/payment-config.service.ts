import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import axios from 'axios';
import { CreatePaymentConfigDto } from './dto/create-payment-config.dto';
import { UpdatePaymentConfigDto } from './dto/update-payment-config.dto';

export interface PaymentConfigQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  provider?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class PaymentConfigService {
  private readonly logger = new Logger(PaymentConfigService.name);

  constructor(private prisma: PrismaService) {}

  private maskSecret(secret: string): string {
    if (!secret || secret.length <= 8) return '****';
    return (
      secret.substring(0, 4) + '****' + secret.substring(secret.length - 4)
    );
  }

  private sanitizeConfig(config: any) {
    const sanitized = { ...config };
    if (sanitized.appSecret)
      sanitized.appSecret = this.maskSecret(sanitized.appSecret);
    if (sanitized.privateKey)
      sanitized.privateKey = this.maskSecret(sanitized.privateKey);
    if (sanitized.publicKey)
      sanitized.publicKey = this.maskSecret(sanitized.publicKey);
    return sanitized;
  }

  async create(createDto: CreatePaymentConfigDto) {
    this.logger.log(
      `Creating payment config: ${createDto.name} (${createDto.code})`,
    );
    try {
      const config = await this.prisma.paymentProviderConfig.create({
        data: createDto,
      });
      this.logger.log(`Created payment config: ${config.id}`);
      return this.sanitizeConfig(config);
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Failed to create config: code '${createDto.code}' already exists`,
        );
        throw new ConflictException(`支付渠道编码 '${createDto.code}' 已存在`);
      }
      this.logger.error(
        `Failed to create payment config: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  async findAll(
    params?: PaymentConfigQueryParams,
  ): Promise<PaginatedResponse<any>> {
    const page = Math.max(1, params?.page || 1);
    const limit = Math.max(1, Math.min(100, params?.limit || 10));
    const skip = (page - 1) * limit;

    this.logger.log(`Fetching payment configs: page=${page}, limit=${limit}`);

    try {
      const where: Prisma.PaymentProviderConfigWhereInput = {};

      if (params?.search) {
        where.OR = [
          { name: { contains: params.search, mode: 'insensitive' } },
          { code: { contains: params.search, mode: 'insensitive' } },
        ];
      }

      if (params?.isActive !== undefined) {
        where.isActive = params.isActive;
      }

      if (params?.provider) {
        where.provider = params.provider;
      }

      const [configs, total] = await Promise.all([
        this.prisma.paymentProviderConfig.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.paymentProviderConfig.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      this.logger.log(
        `Fetched ${configs.length} configs (total: ${total}, totalPages: ${totalPages})`,
      );

      return {
        data: configs.map((c) => this.sanitizeConfig(c)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch payment configs: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  async findOne(id: number) {
    this.logger.log(`Finding payment config by ID: ${id}`);
    try {
      const config = await this.prisma.paymentProviderConfig.findUnique({
        where: { id },
      });
      if (!config) {
        this.logger.warn(`Payment config with ID ${id} not found`);
        throw new NotFoundException(`支付渠道配置 ID ${id} 不存在`);
      }
      this.logger.log(`Found payment config: ${config.name} (${config.code})`);
      return this.sanitizeConfig(config);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find payment config ${id}: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  async update(id: number, updateDto: UpdatePaymentConfigDto) {
    this.logger.log(`Updating payment config ${id}`);
    await this.findOne(id);
    try {
      const config = await this.prisma.paymentProviderConfig.update({
        where: { id },
        data: updateDto,
      });
      this.logger.log(`Updated payment config: ${config.id}`);
      return this.sanitizeConfig(config);
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Failed to update config ${id}: code '${updateDto.code}' already exists`,
        );
        throw new ConflictException(`支付渠道编码 '${updateDto.code}' 已存在`);
      }
      this.logger.error(
        `Failed to update payment config ${id}: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  async remove(id: number) {
    this.logger.log(`Removing payment config ${id}`);
    await this.findOne(id);
    try {
      const config = await this.prisma.paymentProviderConfig.delete({
        where: { id },
      });
      this.logger.log(`Removed payment config: ${config.id}`);
      return this.sanitizeConfig(config);
    } catch (error: any) {
      this.logger.error(
        `Failed to remove payment config ${id}: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  async toggleStatus(id: number, isActive: boolean) {
    this.logger.log(`Toggling payment config ${id} status to ${isActive}`);
    await this.findOne(id);
    try {
      const config = await this.prisma.paymentProviderConfig.update({
        where: { id },
        data: { isActive },
      });
      this.logger.log(`Payment config ${id} status updated to ${isActive}`);
      return this.sanitizeConfig(config);
    } catch (error: any) {
      this.logger.error(
        `Failed to toggle payment config ${id} status: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  async getActiveConfig(provider: string) {
    this.logger.log(`Getting active payment config for provider: ${provider}`);
    try {
      const config = await this.prisma.paymentProviderConfig.findFirst({
        where: { provider, isActive: true },
      });
      if (!config) {
        this.logger.warn(`No active config found for provider: ${provider}`);
        throw new NotFoundException(`未找到支付渠道 '${provider}' 的活跃配置`);
      }
      this.logger.log(
        `Found active config for provider ${provider}: ${config.name} (${config.code})`,
      );
      return config;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to get active config for provider ${provider}: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  async testConnection(id: number) {
    this.logger.log(`Testing connection for payment config ${id}`);
    const config = await this.findOne(id);

    if (!config.apiUrl) {
      throw new BadRequestException('未配置 API 地址，无法测试连接');
    }

    try {
      await axios.head(config.apiUrl, {
        timeout: 10000,
        validateStatus: (status) => status >= 200 && status < 300,
      });
      this.logger.log(
        `Connection test for config ${id} (${config.name}): passed`,
      );
      return {
        success: true,
        message: `支付渠道 '${config.name}' 连接测试通过`,
      };
    } catch (error: any) {
      this.logger.warn(
        `Connection test for config ${id} (${config.name}): failed - ${error.message}`,
      );
      return {
        success: false,
        message: `支付渠道 '${config.name}' 连接测试失败: ${error.message}`,
      };
    }
  }
}

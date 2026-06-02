import { PrismaService } from '@/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateLogisticsProviderDto } from './dto/create-provider.dto';
import { UpdateLogisticsProviderDto } from './dto/update-provider.dto';

export interface LogisticsProviderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class LogisticsService {
  private readonly logger = new Logger(LogisticsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateLogisticsProviderDto) {
    this.logger.log(
      `Creating logistics provider: ${createDto.name} (${createDto.code})`,
    );
    try {
      const provider = await this.prisma.logisticsProvider.create({
        data: createDto,
      });
      this.logger.log(`Created logistics provider: ${provider.id}`);
      return provider;
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Failed to create provider: code '${createDto.code}' already exists`,
        );
        throw new ConflictException(
          `物流服务商编码 '${createDto.code}' 已存在`,
        );
      }
      this.logger.error(
        `Failed to create logistics provider: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  async findAll(
    params?: LogisticsProviderQueryParams,
  ): Promise<PaginatedResponse<any>> {
    const page = Math.max(1, params?.page || 1);
    const limit = Math.max(1, Math.min(100, params?.limit || 10));
    const skip = (page - 1) * limit;

    this.logger.log(
      `Fetching logistics providers: page=${page}, limit=${limit}`,
    );

    try {
      const where: Prisma.LogisticsProviderWhereInput = {};

      if (params?.search) {
        where.OR = [
          { name: { contains: params.search, mode: 'insensitive' } },
          { code: { contains: params.search, mode: 'insensitive' } },
        ];
      }

      if (params?.isActive !== undefined) {
        where.isActive = params.isActive;
      }

      const orderBy: Prisma.LogisticsProviderOrderByWithRelationInput = {};
      if (params?.sortBy) {
        orderBy[params.sortBy] = params.sortOrder || 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      const [providers, total] = await Promise.all([
        this.prisma.logisticsProvider.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.logisticsProvider.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      this.logger.log(
        `Fetched ${providers.length} providers (total: ${total}, totalPages: ${totalPages})`,
      );

      return {
        data: providers,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch logistics providers: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  async findOne(id: number) {
    this.logger.log(`Finding logistics provider by ID: ${id}`);
    try {
      const provider = await this.prisma.logisticsProvider.findUnique({
        where: { id },
      });
      if (!provider) {
        this.logger.warn(`Logistics provider with ID ${id} not found`);
        throw new NotFoundException(`物流服务商 ID ${id} 不存在`);
      }
      this.logger.log(
        `Found logistics provider: ${provider.name} (${provider.code})`,
      );
      return provider;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find logistics provider ${id}: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  async update(id: number, updateDto: UpdateLogisticsProviderDto) {
    this.logger.log(`Updating logistics provider ${id}`);
    await this.findOne(id);
    try {
      const provider = await this.prisma.logisticsProvider.update({
        where: { id },
        data: updateDto,
      });
      this.logger.log(`Updated logistics provider: ${provider.id}`);
      return provider;
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Failed to update provider ${id}: code '${updateDto.code}' already exists`,
        );
        throw new ConflictException(
          `物流服务商编码 '${updateDto.code}' 已存在`,
        );
      }
      this.logger.error(
        `Failed to update logistics provider ${id}: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  async remove(id: number) {
    this.logger.log(`Removing logistics provider ${id}`);
    await this.findOne(id);
    try {
      const provider = await this.prisma.logisticsProvider.delete({
        where: { id },
      });
      this.logger.log(`Removed logistics provider: ${provider.id}`);
      return provider;
    } catch (error: any) {
      this.logger.error(
        `Failed to remove logistics provider ${id}: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  async calculateFreight(weight: number, volume: number, distance: number) {
    this.logger.log(
      `Calculating freight: weight=${weight}, volume=${volume}, distance=${distance}`,
    );
    try {
      const activeProviders = await this.prisma.logisticsProvider.findMany({
        where: { isActive: true },
        orderBy: { id: 'asc' },
      });

      this.logger.log(
        `Found ${activeProviders.length} active providers for freight calculation`,
      );

      if (activeProviders.length === 0) {
        throw new Error('No active logistics providers available');
      }

      const quotes = activeProviders.map((provider) => {
        const config = provider.config as any;
        const basePrice = config?.basePrice || 10;
        const pricePerKg = config?.pricePerKg || 2;
        const pricePerKm = config?.pricePerKm || 0.5;
        const volumeFactor = config?.volumeFactor || 1.5;
        const minPrice = config?.minPrice || 8;

        const weightCost = weight * pricePerKg;
        const distanceCost = distance * pricePerKm;
        const volumeCost = volume * 1000 * volumeFactor;

        const totalCost = Math.max(
          basePrice + Math.max(weightCost, volumeCost) + distanceCost,
          minPrice,
        );

        return {
          providerId: provider.id,
          providerName: provider.name,
          cost: parseFloat(totalCost.toFixed(2)),
          estimatedTime: this.calculateEstimatedTime(distance, provider),
        };
      });

      const bestQuote = quotes.reduce((min, quote) =>
        quote.cost < min.cost ? quote : min,
      );

      this.logger.log(
        `Best freight quote: provider=${bestQuote.providerName}, cost=${bestQuote.cost}`,
      );

      return {
        provider: bestQuote.providerName,
        cost: bestQuote.cost,
        providerId: bestQuote.providerId,
        estimatedTime: bestQuote.estimatedTime,
        allQuotes: quotes,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to calculate freight: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  private calculateEstimatedTime(distance: number, provider: any): string {
    const config = provider.config;
    const avgSpeed = config?.avgSpeed || 40; // km/h
    const baseTime = config?.baseTime || 1; // hours

    const travelHours = distance / avgSpeed;
    const totalHours = baseTime + travelHours;

    if (totalHours < 1) {
      return `${Math.ceil(totalHours * 60)}分钟`;
    } else if (totalHours < 24) {
      return `${Math.ceil(totalHours)}小时`;
    } else {
      const days = Math.floor(totalHours / 24);
      const remainingHours = Math.ceil(totalHours % 24);
      return remainingHours > 0
        ? `${days}天${remainingHours}小时`
        : `${days}天`;
    }
  }
}

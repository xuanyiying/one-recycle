import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateNotificationProviderConfigDto } from '../dto/create-notification-provider-config.dto';
import { UpdateNotificationProviderConfigDto } from '../dto/update-notification-provider-config.dto';

export interface NotificationProviderConfigQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  type?: string;
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
export class NotificationProviderConfigService {
  private readonly logger = new Logger(NotificationProviderConfigService.name);

  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateNotificationProviderConfigDto) {
    this.logger.log(
      `Creating notification provider config: ${createDto.name} (${createDto.type}/${createDto.provider})`,
    );
    try {
      const config = await this.prisma.notificationProviderConfig.create({
        data: createDto,
      });
      this.logger.log(`Created notification provider config: ${config.id}`);
      return config;
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Failed to create config: name '${createDto.name}' already exists`,
        );
        throw new ConflictException(
          `通知服务商配置名称 '${createDto.name}' 已存在`,
        );
      }
      this.logger.error(
        `Failed to create notification provider config: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  async findAll(
    params?: NotificationProviderConfigQueryParams,
  ): Promise<PaginatedResponse<any>> {
    const page = Math.max(1, params?.page || 1);
    const limit = Math.max(1, Math.min(100, params?.limit || 10));
    const skip = (page - 1) * limit;

    this.logger.log(
      `Fetching notification provider configs: page=${page}, limit=${limit}`,
    );

    try {
      const where: Prisma.NotificationProviderConfigWhereInput = {};

      if (params?.search) {
        where.OR = [
          { name: { contains: params.search, mode: 'insensitive' } },
          { provider: { contains: params.search, mode: 'insensitive' } },
        ];
      }

      if (params?.isActive !== undefined) {
        where.isActive = params.isActive;
      }

      if (params?.type) {
        where.type = params.type;
      }

      if (params?.provider) {
        where.provider = params.provider;
      }

      const [configs, total] = await Promise.all([
        this.prisma.notificationProviderConfig.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.notificationProviderConfig.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      this.logger.log(
        `Fetched ${configs.length} configs (total: ${total}, totalPages: ${totalPages})`,
      );

      return {
        data: configs,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch notification provider configs: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  async findOne(id: number) {
    this.logger.log(`Finding notification provider config by ID: ${id}`);
    try {
      const config = await this.prisma.notificationProviderConfig.findUnique({
        where: { id },
      });
      if (!config) {
        this.logger.warn(
          `Notification provider config with ID ${id} not found`,
        );
        throw new NotFoundException(`通知服务商配置 ID ${id} 不存在`);
      }
      this.logger.log(
        `Found notification provider config: ${config.name} (${config.type}/${config.provider})`,
      );
      return config;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find notification provider config ${id}: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  async update(id: number, updateDto: UpdateNotificationProviderConfigDto) {
    this.logger.log(`Updating notification provider config ${id}`);
    await this.findOne(id);
    try {
      const config = await this.prisma.notificationProviderConfig.update({
        where: { id },
        data: updateDto,
      });
      this.logger.log(`Updated notification provider config: ${config.id}`);
      return config;
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Failed to update config ${id}: name '${updateDto.name}' already exists`,
        );
        throw new ConflictException(
          `通知服务商配置名称 '${updateDto.name}' 已存在`,
        );
      }
      this.logger.error(
        `Failed to update notification provider config ${id}: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  async remove(id: number) {
    this.logger.log(`Removing notification provider config ${id}`);
    await this.findOne(id);
    try {
      const config = await this.prisma.notificationProviderConfig.delete({
        where: { id },
      });
      this.logger.log(`Removed notification provider config: ${config.id}`);
      return config;
    } catch (error: any) {
      this.logger.error(
        `Failed to remove notification provider config ${id}: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  async toggleStatus(id: number, isActive: boolean) {
    this.logger.log(
      `Toggling notification provider config ${id} status to ${isActive}`,
    );
    await this.findOne(id);
    try {
      const config = await this.prisma.notificationProviderConfig.update({
        where: { id },
        data: { isActive },
      });
      this.logger.log(
        `Toggled notification provider config ${id} status to ${isActive}`,
      );
      return config;
    } catch (error: any) {
      this.logger.error(
        `Failed to toggle notification provider config ${id} status: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  async getActiveConfigByType(type: string) {
    this.logger.log(
      `Getting active notification provider config for type: ${type}`,
    );
    try {
      const config = await this.prisma.notificationProviderConfig.findFirst({
        where: { type, isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      if (!config) {
        this.logger.warn(`No active config found for type: ${type}`);
        return null;
      }
      this.logger.log(
        `Found active config for type ${type}: ${config.name} (${config.provider})`,
      );
      return config;
    } catch (error: any) {
      this.logger.error(
        `Failed to get active config for type ${type}: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }
}

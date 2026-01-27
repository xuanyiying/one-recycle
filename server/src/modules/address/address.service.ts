import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Address, Region } from '@prisma/client';
import { RedisService } from '../../common/redis/redis.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AddressService {
  private readonly logger = new Logger(AddressService.name);
  private readonly REGION_CACHE_KEY_PREFIX = 'region:children:';
  private readonly CACHE_TTL: number;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private configService: ConfigService,
  ) {
    this.CACHE_TTL = this.configService.get<number>('REGION_CACHE_TTL', 86400 * 7);
  }

  /**
   * 根据父级编码获取下级地区 (支持 Redis 缓存)
   */
  async getRegionsByParent(parentCode: string): Promise<Region[]> {
    const cacheKey = `${this.REGION_CACHE_KEY_PREFIX}${parentCode}`;
    
    // 1. 尝试从缓存获取
    try {
      const cachedData = await this.redis.get<Region[]>(cacheKey);
      if (cachedData) {
        this.logger.debug(`Hit region cache for parentCode: ${parentCode}`);
        return cachedData;
      }
    } catch (e: any) {
      this.logger.warn(`Redis error when getting regions: ${e.message}`);
    }

    // 2. 从数据库查询
    const regions = await this.prisma.region.findMany({
      where: { parentCode },
      orderBy: { code: 'asc' }
    });

    // 3. 写入缓存 (异步)
    if (regions.length > 0) {
      this.redis.set(cacheKey, regions, this.CACHE_TTL).catch(err => {
        this.logger.error(`Failed to cache regions for ${parentCode}: ${err.message}`);
      });
    }

    return regions;
  }

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(createAddressDto.userId) },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return await this.prisma.address.create({
      data: {
        ...createAddressDto,
        userId: BigInt(createAddressDto.userId),
      },
    });
  }

  async findAllByUserId(userId: string | number): Promise<Address[]> {
    return await this.prisma.address.findMany({
      where: { userId: BigInt(userId) },
      orderBy: { isDefault: 'desc' },
    });
  }

  async update(
    id: string | number,
    updateData: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.prisma.address.findUnique({
      where: { id: BigInt(id) },
    });

    if (!address) {
      throw new NotFoundException('地址不存在');
    }

    // 如果设置为默认地址，取消其他地址的默认状态
    if (updateData.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId: address.userId, id: { not: BigInt(id) } },
        data: { isDefault: false },
      });
    }

    return await this.prisma.address.update({
      where: { id: BigInt(id) },
      data: {
        ...updateData,
        userId: updateData.userId ? BigInt(updateData.userId) : undefined,
      },
    });
  }

  async remove(id: string | number): Promise<void> {
    const address = await this.prisma.address.findUnique({
      where: { id: BigInt(id) },
    });

    if (!address) {
      throw new NotFoundException('地址不存在');
    }

    await this.prisma.address.delete({
      where: { id: BigInt(id) },
    });
  }

  async setDefault(id: string | number): Promise<Address> {
    const address = await this.prisma.address.findUnique({
      where: { id: BigInt(id) },
    });

    if (!address) {
      throw new NotFoundException('地址不存在');
    }

    // 取消该用户其他地址的默认状态
    await this.prisma.address.updateMany({
      where: { userId: address.userId, id: { not: BigInt(id) } },
      data: { isDefault: false },
    });

    // 设置当前地址为默认
    return await this.prisma.address.update({
      where: { id: BigInt(id) },
      data: { isDefault: true },
    });
  }
}

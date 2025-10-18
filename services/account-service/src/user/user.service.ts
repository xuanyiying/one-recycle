import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  ValidationException,
  BusinessException
} from '@shared/exceptions/business.exception';
import { UserRole } from '@shared/types/auth.types';
import { PaginationParams } from '@shared/types/common.types';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  UserListResponseDto,
  QueryUserDto
} from './dto';

// 添加 BigInt 序列化支持
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // 检查手机号是否已存在
    if (createUserDto.mobile) {
      const existingUser = await this.prisma.user.findUnique({
        where: { mobile: createUserDto.mobile }
      });

      if (existingUser) {
        throw new ValidationException('手机号已被注册');
      }
    }

    const user = await this.prisma.user.create({
      data: {
        mobile: createUserDto.mobile,
        nickname: createUserDto.nickname,
        avatarUrl: createUserDto.avatarUrl,
      },
      select: {
        id: true,
        mobile: true,
        nickname: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return this.mapToUserResponse(user);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        mobile: true,
        nickname: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return this.mapToUserResponse(user);
  }

  async findMany(query: QueryUserDto): Promise<UserListResponseDto> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.mobile) {
      where.mobile = { contains: filters.mobile };
    }

    if (filters.nickname) {
      where.nickname = { contains: filters.nickname };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          mobile: true,
          nickname: true,
          avatarUrl: true,
          status: true,
          createdAt: true,
          updatedAt: true
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      this.prisma.user.count({ where })
    ]);

    return {
      items: users.map((user: any) => this.mapToUserResponse(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // 检查用户是否存在
    const existingUser = await this.prisma.user.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingUser) {
      throw new NotFoundException('用户不存在');
    }

    // 如果更新手机号，检查是否已被其他用户使用
    const updateData = updateUserDto as any;
    if (updateData.mobile && updateData.mobile !== existingUser.mobile) {
      const userWithMobile = await this.prisma.user.findUnique({
        where: { mobile: updateData.mobile }
      });

      if (userWithMobile) {
        throw new ValidationException('手机号已被其他用户使用');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: BigInt(id) },
      data: updateUserDto,
      select: {
        id: true,
        mobile: true,
        nickname: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return this.mapToUserResponse(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(id) }
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.prisma.user.delete({
      where: { id: BigInt(id) }
    });
  }

  async findByMobile(mobile: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { mobile },
      select: {
        id: true,
        mobile: true,
        nickname: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return user ? this.mapToUserResponse(user) : null;
  }

  async findByIdentity(provider: string, openid: string): Promise<UserResponseDto | null> {
    const identity = await this.prisma.userIdentity.findFirst({
      where: {
        provider,
        openid
      },
      include: {
        user: {
          select: {
            id: true,
            mobile: true,
            nickname: true,
            avatarUrl: true,
            status: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    return identity ? this.mapToUserResponse(identity.user) : null;
  }

  async createOrUpdateIdentity(
    userId: string,
    identityData: { provider: string; openid: string; unionid?: string; appId: string }
  ): Promise<void> {
    // 验证用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) }
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 创建或更新用户身份
    await this.prisma.userIdentity.upsert({
      where: {
        provider_openid: {
          provider: identityData.provider,
          openid: identityData.openid
        }
      },
      update: {
        userId: BigInt(userId),
        appId: identityData.appId,
        unionid: identityData.unionid
      },
      create: {
        userId: BigInt(userId),
        provider: identityData.provider,
        openid: identityData.openid,
        appId: identityData.appId,
        unionid: identityData.unionid
      }
    });
  }

  private mapToUserResponse(user: any): UserResponseDto {
    return {
      id: user.id.toString(),
      mobile: user.mobile,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      role: UserRole.USER, // 默认角色，因为数据库中没有role字段
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
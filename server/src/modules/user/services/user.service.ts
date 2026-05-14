import {
  NotFoundException,
  ValidationException,
} from '@/common/exceptions/business.exception';
import { UserRole } from '@/common/types/auth.types';
import {
  CreateUserDto,
  QueryUserDto,
  UpdateUserDto,
  UserListResponseDto,
  UserResponseDto,
} from '@/modules/user/dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AccountType, Prisma, User } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<{
    totalUsers: number;
    newUsersToday: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, newUsersToday] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
    ]);

    return {
      totalUsers,
      newUsersToday,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    if (createUserDto.mobile) {
      const existingUser = await this.prisma.user.findUnique({
        where: { mobile: createUserDto.mobile },
      });

      if (existingUser) {
        throw new ValidationException('手机号已被注册');
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          mobile: createUserDto.mobile,
          nickname: createUserDto.nickname,
          avatarUrl: createUserDto.avatarUrl,
        },
        select: {
          id: true,
          email: true,
          mobile: true,
          nickname: true,
          avatarUrl: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await tx.account.create({
        data: {
          userId: newUser.id,
          accountType: AccountType.WALLET,
          accountDetails: {},
          availableBalance: 0,
          frozenBalance: 0,
          totalIncome: 0,
          totalWithdrawal: 0,
        },
      });

      return newUser;
    });

    return this.mapToUserResponse(result);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        email: true,
        mobile: true,
        nickname: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return this.mapToUserResponse(user);
  }

  async findMany(query: QueryUserDto): Promise<UserListResponseDto> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ...filters
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

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
          email: true,
          mobile: true,
          nickname: true,
          avatarUrl: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users.map((user) => this.mapToUserResponse(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // 检查用户是否存在
    const existingUser = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingUser) {
      throw new NotFoundException('用户不存在');
    }

    // 如果更新手机号，检查是否已被其他用户使用
    if (updateUserDto.mobile && updateUserDto.mobile !== existingUser.mobile) {
      const userWithMobile = await this.prisma.user.findUnique({
        where: { mobile: updateUserDto.mobile },
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
        email: true,
        mobile: true,
        nickname: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.mapToUserResponse(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.prisma.user.delete({
      where: { id: BigInt(id) },
    });
  }

  async findByMobile(mobile: string): Promise<UserResponseDto | null> {
    const cleanMobile = mobile.replace(/\s+/g, '');
    const user = await this.prisma.user.findUnique({
      where: { mobile: cleanMobile },
      select: {
        id: true,
        email: true,
        mobile: true,
        nickname: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user ? this.mapToUserResponse(user) : null;
  }

  async findByIdentity(
    provider: string,
    openid: string,
  ): Promise<UserResponseDto | null> {
    const identity = await this.prisma.userIdentity.findFirst({
      where: {
        provider,
        openid,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            mobile: true,
            nickname: true,
            avatarUrl: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return identity ? this.mapToUserResponse(identity.user) : null;
  }

  async createOrUpdateIdentity(
    userId: string,
    identityData: {
      provider: string;
      openid: string;
      unionid?: string;
      appId: string;
    },
  ): Promise<void> {
    // 验证用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 创建或更新用户身份
    await this.prisma.userIdentity.upsert({
      where: {
        provider_openid: {
          provider: identityData.provider,
          openid: identityData.openid,
        },
      },
      update: {
        userId: BigInt(userId),
        appId: identityData.appId,
        unionid: identityData.unionid,
      },
      create: {
        userId: BigInt(userId),
        provider: identityData.provider,
        openid: identityData.openid,
        appId: identityData.appId,
        unionid: identityData.unionid,
      },
    });
  }

  async getRecentUsers(limit: number = 10): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return users.map((u) => this.mapToUserResponse(u));
  }

  async exportUsers(query: QueryUserDto): Promise<UserResponseDto[]> {
    const { items } = await this.findMany({ ...query, limit: 10000, page: 1 });
    return items;
  }

  getUserActivities(_userId: string): any[] {
    return [];
  }

  async batchDelete(ids: string[]): Promise<void> {
    await this.prisma.user.deleteMany({
      where: { id: { in: ids.map((id) => BigInt(id)) } },
    });
  }

  async updateStatus(id: string, status: string): Promise<UserResponseDto> {
    return this.update(id, { status } as UpdateUserDto);
  }

  async resetPassword(userId: string): Promise<{ newPassword: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const newPassword = this.generateRandomPassword(12);
    const hashedPassword = this.hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: BigInt(userId) },
      data: { password: hashedPassword },
    });

    this.logger.log(`Password reset for user: ${userId}`);
    return { newPassword };
  }

  async updatePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (!user.password) {
      throw new ValidationException('用户未设置密码');
    }

    const isOldPasswordValid = this.verifyPassword(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('原密码错误');
    }

    const hashedNewPassword = this.hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: BigInt(id) },
      data: { password: hashedNewPassword },
    });

    this.logger.log(`Password updated for user: ${id}`);
  }

  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    if (!storedHash.includes(':')) {
      const legacyHash = crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');
      return legacyHash === storedHash;
    }

    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    try {
      const key = crypto.scryptSync(password, salt, 64);
      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), key);
    } catch {
      return false;
    }
  }

  private generateRandomPassword(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      password += chars[randomBytes[i] % chars.length];
    }
    return password;
  }

  private mapToUserResponse(
    data: Pick<
      User,
      | 'id'
      | 'email'
      | 'mobile'
      | 'nickname'
      | 'avatarUrl'
      | 'status'
      | 'createdAt'
      | 'updatedAt'
    >,
  ): UserResponseDto {
    return {
      id: data.id.toString(),
      email: data.email || undefined,
      mobile: data.mobile || undefined,
      nickname: data.nickname || undefined,
      avatarUrl: data.avatarUrl || undefined,
      role: UserRole.USER, // 默认角色，因为数据库中没有role字段
      status: data.status,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
    };
  }
}

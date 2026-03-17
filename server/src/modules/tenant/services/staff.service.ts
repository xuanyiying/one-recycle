import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import * as crypto from 'crypto';
import { StaffLoginDto } from '../dto/staff-login.dto';
import { StaffResponseDto, StaffLoginResultDto } from '../dto/staff.dto';

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);
  private readonly accessTokenExpiresInSeconds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenExpiresInSeconds = this.configService.get<number>(
      'auth.accessTokenExpiresInSeconds',
      7200,
    );
  }

  /**
   * 租户员工登录
   */
  async login(loginDto: StaffLoginDto): Promise<StaffLoginResultDto> {
    const { username, password, tenantCode } = loginDto;

    // 1. 查找租户
    const tenant = await (this.prisma as any).tenant.findUnique({
      where: { code: tenantCode },
    });

    if (!tenant) {
      throw new NotFoundException('租户不存在');
    }

    // 2. 查找员工
    const staff = await (this.prisma as any).staff.findFirst({
      where: {
        username,
        tenantId: tenant.id,
        status: 'ACTIVE',
      },
      include: {
        role: true,
      },
    });

    if (!staff) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 3. 验证密码
    const isPasswordValid = this.verifyPassword(password, staff.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 4. 生成令牌
    const tokens = await this.generateTokens(staff);

    // 5. 更新最后登录时间，如果还是旧哈希则自动升级为新哈希
    const updateData: any = { lastLoginAt: new Date() };
    if (!staff.password.includes(':')) {
      updateData.password = this.hashPassword(password);
      this.logger.log(
        `Automatically upgraded password hash to scrypt for staff: ${username}`,
      );
    }

    await (this.prisma as any).staff.update({
      where: { id: staff.id },
      data: updateData,
    });

    return {
      staff: this.mapToStaffResponse(staff),
      tokens,
    };
  }

  /**
   * 获取员工个人资料
   */
  async getProfile(staffId: string): Promise<StaffResponseDto> {
    const staff = await (this.prisma as any).staff.findUnique({
      where: { id: BigInt(staffId) },
      include: {
        role: true,
      },
    });

    if (!staff) {
      throw new NotFoundException('员工不存在');
    }

    return this.mapToStaffResponse(staff);
  }

  // ==================== 辅助方法 ====================

  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    // Fallback for legacy SHA256 hashes (they don't contain ':')
    if (!storedHash.includes(':')) {
      const legacyHash = crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');
      return legacyHash === storedHash;
    }

    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const key = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), key);
  }

  private async generateTokens(
    staff: any,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const payload = {
      sub: staff.id.toString(),
      username: staff.username,
      tenantId: staff.tenantId.toString(),
      roleId: staff.roleId,
      role: staff.role.code,
      roleCode: staff.role.code,
      type: 'staff',
    };

    const accessToken = this.jwtService.sign(payload);
    // 简化版，实际应存储在 Redis 并在此处生成唯一的随机串
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const expiresIn = this.accessTokenExpiresInSeconds;

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * 获取租户下的所有员工
   */
  async findAll(params: {
    tenantId?: string;
    username?: string;
    roleCode?: string;
    status?: any;
    skip?: number;
    take?: number;
  }) {
    const {
      tenantId,
      username,
      roleCode,
      status,
      skip = 0,
      take = 10,
    } = params;
    const where: any = {};

    if (tenantId) where.tenantId = BigInt(tenantId);
    if (username) where.username = { contains: username, mode: 'insensitive' };
    if (status) where.status = status;
    if (roleCode) {
      where.role = { code: roleCode };
    }

    const [items, total] = await Promise.all([
      (this.prisma as any).staff.findMany({
        where,
        include: { role: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      (this.prisma as any).staff.count({ where }),
    ]);

    return {
      items: items.map((s: any) => this.mapToStaffResponse(s)),
      total,
      page: Math.floor(skip / take) + 1,
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }

  /**
   * 创建员工
   */
  async create(data: {
    username: string;
    password?: string;
    tenantId: string;
    roleCode: string;
    realName?: string;
    fullName?: string;
    mobile?: string;
    phone?: string;
    email?: string;
    status?: any;
  }) {
    const {
      username,
      password,
      tenantId,
      roleCode,
      realName,
      fullName,
      mobile,
      phone,
      email,
      status,
    } = data;

    // 1. 检查租户是否存在
    const tenant = await (this.prisma as any).tenant.findUnique({
      where: { id: BigInt(tenantId) },
    });
    if (!tenant) throw new NotFoundException('租户不存在');

    // 2. 检查用户名是否已存在
    const existingStaff = await (this.prisma as any).staff.findFirst({
      where: { tenantId: BigInt(tenantId), username },
    });
    if (existingStaff) throw new UnauthorizedException('用户名已存在');

    // 3. 查找角色 (兼容大小写)
    const role = await (this.prisma as any).role.findFirst({
      where: {
        OR: [
          { tenantId: BigInt(tenantId), code: roleCode },
          { tenantId: null, code: roleCode },
          { tenantId: BigInt(tenantId), code: roleCode.toUpperCase() },
          { tenantId: null, code: roleCode.toUpperCase() },
        ],
      },
    });
    if (!role) throw new NotFoundException(`角色不存在: ${roleCode}`);

    // 4. 创建员工
    const staff = await (this.prisma as any).staff.create({
      data: {
        username,
        password: this.hashPassword(password || '123456'),
        tenantId: BigInt(tenantId),
        roleId: role.id,
        realName: realName || fullName,
        mobile: mobile || phone,
        email,
        status: status?.toUpperCase() || 'ACTIVE',
      },
      include: { role: true },
    });

    return this.mapToStaffResponse(staff);
  }

  /**
   * 更新员工
   */
  async update(id: string, data: any) {
    const { roleCode, fullName, phone, status, ...rest } = data;
    const updateData: any = { ...rest };

    if (fullName) updateData.realName = fullName;
    if (phone) updateData.mobile = phone;
    if (status) updateData.status = status.toUpperCase();

    if (roleCode) {
      const staff = await (this.prisma as any).staff.findUnique({
        where: { id: BigInt(id) },
      });
      const role = await (this.prisma as any).role.findFirst({
        where: {
          OR: [
            { tenantId: staff.tenantId, code: roleCode },
            { tenantId: null, code: roleCode },
          ],
        },
      });
      if (!role) throw new NotFoundException('角色不存在');
      updateData.roleId = role.id;
    }

    if (data.password) {
      updateData.password = this.hashPassword(data.password);
    }

    const staff = await (this.prisma as any).staff.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: { role: true },
    });

    return this.mapToStaffResponse(staff);
  }

  /**
   * 删除员工
   */
  async remove(id: string) {
    await (this.prisma as any).staff.delete({
      where: { id: BigInt(id) },
    });
  }

  private mapToStaffResponse(staff: any): StaffResponseDto {
    return {
      id: staff.id.toString(),
      username: staff.username,
      realName: staff.realName,
      fullName: staff.realName, // Alias for frontend compatibility
      mobile: staff.mobile,
      phone: staff.mobile, // Alias for frontend compatibility
      email: staff.email,
      avatarUrl: staff.avatarUrl,
      tenantId: staff.tenantId.toString(),
      role: {
        id: staff.role.id,
        name: staff.role.name,
        code: staff.role.code,
        isAdmin: staff.role.isAdmin,
      },
      status: staff.status?.toLowerCase(),
      createdAt: staff.createdAt.toISOString(),
      updatedAt: staff.updatedAt.toISOString(),
    } as any;
  }

  /**
   * 初始化租户管理员（用于演示或种子数据）
   */
  async createInitialStaff(data: {
    username: string;
    password: string;
    tenantId: bigint;
    roleId: number;
    realName?: string;
  }) {
    return (this.prisma as any).staff.create({
      data: {
        username: data.username,
        password: this.hashPassword(data.password),
        tenantId: data.tenantId,
        roleId: data.roleId,
        realName: data.realName,
        status: 'ACTIVE',
      },
    });
  }
}

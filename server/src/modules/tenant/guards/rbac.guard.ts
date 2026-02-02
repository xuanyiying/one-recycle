import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@/prisma/prisma.service';

import { AuthKeyUtils } from '@/modules/auth/constants/auth-keys.constant';
import { RedisService } from '@/common/redis/redis.service';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. 获取方法或类上的权限元数据
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    // 如果没有设置权限要求，则默认通过
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 2. 获取当前请求的用户信息（由 JwtStrategy 填充）
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('尚未登录');
    }

    // 只有 staff 类型才有权限校验
    if (user.type !== 'staff') {
      throw new ForbiddenException('仅限员工访问');
    }

    // 3. 超级管理员拥有所有权限
    if (user.roleCode === 'ADMIN') {
      return true;
    }

    // 4. 查询权限列表（优先从缓存获取）
    const roleId = user.roleId;
    if (!roleId) {
      throw new ForbiddenException('未分配角色');
    }

    const cacheKey = AuthKeyUtils.getRolePermissionsKey(roleId);
    let staffPermissionCodes = await this.redisService.get<string[]>(cacheKey);

    if (!staffPermissionCodes) {
      // 缓存未命中，从数据库查询
      const staff = await this.prisma.staff.findUnique({
        where: { id: BigInt(user.id) },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!staff || !staff.role) {
        throw new ForbiddenException('未分配角色或角色已禁用');
      }

      // 提取权限代码列表
      staffPermissionCodes = staff.role.permissions.map(
        (rp: any) => rp.permission.code,
      );

      // 存入缓存，有效期1小时
      await this.redisService.set(cacheKey, staffPermissionCodes, 3600);
    }

    // 5. 校验权限
    if (!staffPermissionCodes) {
      throw new ForbiddenException('获取权限失败');
    }

    const hasPermission = requiredPermissions.every((permission) =>
      staffPermissionCodes.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('权限不足，缺少必要权限');
    }

    return true;
  }
}

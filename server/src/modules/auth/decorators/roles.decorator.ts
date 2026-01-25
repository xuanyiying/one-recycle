import { SetMetadata } from '@nestjs/common';

/**
 * 角色装饰器
 * 标记需要特定角色的接口
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/**
 * 管理员权限装饰器
 * 标记需要管理员权限的接口
 */
export const RequireAdmin = () => SetMetadata('requireAdmin', true);

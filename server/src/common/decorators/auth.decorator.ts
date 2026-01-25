/**
 * 认证相关装饰器
 */

import {
  SetMetadata,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { UserRole, Permission } from '../types/auth.types';

// 元数据键常量
export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';
export const PUBLIC_KEY = 'isPublic';
export const OPTIONAL_AUTH_KEY = 'optionalAuth';

// 角色装饰器
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// 权限装饰器
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// 公开接口装饰器（跳过认证）
export const Public = () => SetMetadata(PUBLIC_KEY, true);

// 获取当前用户装饰器
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// 获取用户ID装饰器
export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id;
  },
);

// 获取用户角色装饰器
export const UserRoles = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.roles || [];
  },
);

// 获取用户权限装饰器
export const UserPermissions = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.permissions || [];
  },
);

// 可选认证装饰器（用户可以是匿名的）
export const OptionalAuth = () => SetMetadata(OPTIONAL_AUTH_KEY, true);

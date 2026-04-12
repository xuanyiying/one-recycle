import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../types/auth.types';
import { ROLES_KEY } from '../decorators/auth.decorator';

interface AuthenticatedRequest {
  user?: {
    role?: UserRole;
    roles?: UserRole[];
  };
}

/**
 * 角色守卫
 * 检查用户是否具有访问资源所需的角色
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('用户未认证');
    }

    const userRoles = user.roles || (user.role ? [user.role] : []);
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('权限不足，无法访问该资源');
    }

    return true;
  }
}

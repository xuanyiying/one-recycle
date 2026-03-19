/**
 * 状态机守卫
 * 用于验证订单状态转换的权限和合法性
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  OrderStatus,
  canTransition,
  getStatusLabel,
} from '../constants/order-state-machine';

// 元数据键
export const ALLOWED_TRANSITIONS_KEY = 'allowedTransitions';
export const REQUIRED_ROLE_KEY = 'requiredRole';

// 扩展 Request 类型
type RequestWithUser = {
  user?: {
    role?: string;
  };
  order?: {
    status: string;
  };
};

/**
 * 允许的状态转换装饰器
 * 用于标记接口允许从哪些状态转换
 */
export const AllowedTransitions = (...transitions: OrderStatus[]) => {
  return (
    target: object,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      Reflect.defineMetadata(
        ALLOWED_TRANSITIONS_KEY,
        transitions,
        descriptor.value,
      );
    } else {
      Reflect.defineMetadata(ALLOWED_TRANSITIONS_KEY, transitions, target);
    }
  };
};

/**
 * 所需角色装饰器
 * 用于标记接口需要的角色权限
 */
export const RequiredRole = (...roles: string[]) => {
  return (
    target: object,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      Reflect.defineMetadata(REQUIRED_ROLE_KEY, roles, descriptor.value);
    } else {
      Reflect.defineMetadata(REQUIRED_ROLE_KEY, roles, target);
    }
  };
};

/**
 * 状态机守卫
 * 检查：
 * 1. 当前订单状态是否允许转换到目标状态
 * 2. 用户是否有权限执行此操作
 */
@Injectable()
export class StateMachineGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const order = request.order;

    if (!user) {
      throw new ForbiddenException('用户未认证');
    }

    // 获取方法级别的元数据
    const allowedTransitions = this.reflector.getAllAndOverride<OrderStatus[]>(
      ALLOWED_TRANSITIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 如果没有配置状态机守卫，允许通过
    if (!allowedTransitions && !requiredRoles) {
      return true;
    }

    // 检查角色权限
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.some((role) => user.role === role);
      if (!hasRole) {
        throw new ForbiddenException(
          `需要以下角色之一: ${requiredRoles.join(', ')}`,
        );
      }
    }

    // 检查状态转换（如果有订单信息）
    if (allowedTransitions && order) {
      const currentStatus = order.status as OrderStatus;
      const canTransit = allowedTransitions.some((targetStatus) =>
        canTransition(currentStatus, targetStatus),
      );

      if (!canTransit) {
        throw new BadRequestException(
          `当前状态 "${getStatusLabel(currentStatus)}" 不允许执行此操作`,
        );
      }
    }

    return true;
  }
}

/**
 * 状态转换验证装饰器（简化版）
 * 组合了 AllowedTransitions 和 RequiredRole
 */
export const StateTransition = (options: {
  from: OrderStatus[];
  to: OrderStatus;
  roles?: string[];
}) => {
  return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
    AllowedTransitions(...options.from)(target, propertyKey, descriptor);
    if (options.roles && options.roles.length > 0) {
      RequiredRole(...options.roles)(target, propertyKey, descriptor);
    }
  };
};

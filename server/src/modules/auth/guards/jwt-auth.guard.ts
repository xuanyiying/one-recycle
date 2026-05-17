import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Allow internal RPC calls with service authentication
    const isRpcInternal = this.reflector.getAllAndOverride<boolean>('isRpcInternal', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (context.getType() === 'rpc' && isRpcInternal) {
      return true;
    }

    try {
      const result = await super.canActivate(context);
      if (!result) {
        throw new UnauthorizedException('令牌验证失败');
      }

      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user) {
        throw new UnauthorizedException('用户信息不存在');
      }

      this.checkPermissions(context, user);

      this.logger.log(`用户 ${user.id} 通过认证验证`);
      return true;
    } catch (error) {
      this.logger.error(
        `认证失败: ${(error as any).message}`,
        (error as any).stack,
      );

      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new UnauthorizedException('认证验证失败');
    }
  }

  /**
   * 检查用户权限
   */
  private checkPermissions(context: ExecutionContext, user: any): void {
    // 检查是否需要管理员权限
    const requireAdmin = this.reflector.getAllAndOverride<boolean>(
      'requireAdmin',
      [context.getHandler(), context.getClass()],
    );

    if (requireAdmin && user.role !== 'ADMIN') {
      throw new ForbiddenException('需要管理员权限');
    }

    // 检查特定角色要求
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.role)) {
        throw new ForbiddenException(
          `需要以下角色之一: ${requiredRoles.join(', ')}`,
        );
      }
    }

    // 检查用户状态
    if (user.status && user.status !== 'ACTIVE') {
      throw new ForbiddenException('用户账户已被禁用');
    }
  }

  /**
   * 处理认证错误
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err) {
      this.logger.error(`认证错误: ${err.message}`, err.stack);
      throw err;
    }

    if (!user) {
      const errorMessage = info?.message || '令牌无效';
      this.logger.warn(`认证失败: ${errorMessage}`);

      // 根据不同的错误类型返回不同的错误信息
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('令牌已过期');
      } else if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('令牌格式错误');
      } else if (info?.name === 'NotBeforeError') {
        throw new UnauthorizedException('令牌尚未生效');
      }

      throw new UnauthorizedException(errorMessage);
    }

    return user;
  }
}

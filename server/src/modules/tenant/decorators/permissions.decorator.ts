import { SetMetadata } from '@nestjs/common';

/**
 * 权限控制装饰器
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

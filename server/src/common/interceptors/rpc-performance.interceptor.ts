import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RpcPerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const handler =
      context.getClass().name + '.' + (context.getHandler()?.name || 'unknown');
    return next.handle().pipe(
      tap(() => {
        const cost = Date.now() - now;
        // 简易性能监控日志
        // 可扩展为上报到监控系统
        // console.log(`[RPC] ${handler} cost=${cost}ms`);
      }),
    );
  }
}

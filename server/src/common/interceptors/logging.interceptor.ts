import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SnowflakeIdGenerator } from '@/common/utils/common.util';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  private readonly idGen = new SnowflakeIdGenerator({
    workerId: 1,
    datacenterId: 1,
  });

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, query, params } = request;
    let requestId = request.headers['x-request-id'] as string;
    if (!requestId) {
      requestId = this.idGen.nextId();
      response.setHeader('x-request-id', requestId);
    }
    const startTime = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${url} rid=${requestId}`,
      JSON.stringify({ query, params }),
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `Request Completed: ${method} ${url} rid=${requestId} - ${duration}ms`,
            JSON.stringify({ success: true }),
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `Request Failed: ${method} ${url} rid=${requestId} - ${duration}ms`,
            error.message,
          );
        },
      }),
    );
  }
}

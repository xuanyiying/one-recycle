import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger
} from '@nestjs/common';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retryWhen, mergeMap, finalize } from 'rxjs/operators';

export interface RetryConfig {
    maxRetries: number;
    delay: number;
    backoffMultiplier: number;
    maxDelay: number;
    retryCondition?: (error: any) => boolean;
}

@Injectable()
export class RetryInterceptor implements NestInterceptor {
    private readonly logger = new Logger(RetryInterceptor.name);
    
    constructor(private readonly config: RetryConfig) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url } = request;
        
        return next.handle().pipe(
            retryWhen(errors =>
                errors.pipe(
                    mergeMap((error, index) => {
                        const retryAttempt = index + 1;
                        
                        // 检查是否应该重试
                        if (
                            retryAttempt > this.config.maxRetries ||
                            (this.config.retryCondition && !this.config.retryCondition(error))
                        ) {
                            this.logger.error(
                                `最大重试次数已达到 (${this.config.maxRetries}) for ${method} ${url}`,
                                error.stack
                            );
                            return throwError(error);
                        }

                        // 计算延迟时间
                        const delay = Math.min(
                            this.config.delay * Math.pow(this.config.backoffMultiplier, index),
                            this.config.maxDelay
                        );

                        this.logger.warn(
                            `重试请求 ${retryAttempt}/${this.config.maxRetries} for ${method} ${url} after ${delay}ms`,
                            error.message
                        );

                        return timer(delay);
                    })
                )
            ),
            catchError(error => {
                this.logger.error(`请求最终失败 ${method} ${url}`, error.stack);
                return throwError(error);
            }),
            finalize(() => {
                this.logger.debug(`请求完成 ${method} ${url}`);
            })
        );
    }
}

// 预定义的重试配置
export const JD_EXPRESS_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    delay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000,
    retryCondition: (error: any) => {
        // 只对特定错误进行重试
        const retryableStatuses = [408, 429, 500, 502, 503, 504];
        const retryableCodes = [
            'ECONNRESET',
            'ENOTFOUND',
            'ECONNREFUSED',
            'ETIMEDOUT',
            'JD_EXPRESS_TIMEOUT',
            'JD_EXPRESS_SERVICE_UNAVAILABLE'
        ];
        
        return (
            retryableStatuses.includes(error.status) ||
            retryableCodes.includes(error.code) ||
            retryableCodes.includes(error.response?.data?.code)
        );
    }
};
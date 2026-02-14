import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../types/common.types';

export interface ResponseWithMessage {
  data?: any;
  message?: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'data' in data && 'message' in data) {
          const responseWithData = data as ResponseWithMessage;
          return {
            success: true,
            data: responseWithData.data,
            message: responseWithData.message || 'Success',
            code: 'SUCCESS',
            timestamp: new Date().toISOString(),
          };
        }
        return {
          success: true,
          data,
          message: 'Success',
          code: 'SUCCESS',
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

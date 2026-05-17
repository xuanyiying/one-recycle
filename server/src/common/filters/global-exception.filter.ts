import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BusinessException } from '../exceptions/business.exception';
import { ApiResponse } from '../types/common.types';

interface ExceptionResponse {
  message?: string | string[];
  error?: string;
  details?: unknown;
}

interface NestRequest {
  url?: string;
}

interface NestResponse {
  status(code: number): NestResponse;
  json(body: unknown): void;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<NestResponse>();
    const request = ctx.getRequest<NestRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: unknown = undefined;

    if (exception instanceof BusinessException) {
      status = exception.getStatus();
      message = exception.message;
      code = exception.code;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseData = exceptionResponse as ExceptionResponse;
        message = Array.isArray(responseData.message)
          ? responseData.message.join('; ')
          : responseData.message || exception.message;
        code = responseData.error || exception.name;
        details = responseData.details;
      } else {
        message = exception.message;
        code = exception.name;
      }
    } else if (exception instanceof Error) {
      message = '服务器内部错误';
      this.logger.error(exception.message, exception.stack);
    }

    const errorResponse: ApiResponse<null> = {
      success: false,
      message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: {
        code,
        message,
        details,
      },
    };

    response.status(status).json(errorResponse);
  }
}

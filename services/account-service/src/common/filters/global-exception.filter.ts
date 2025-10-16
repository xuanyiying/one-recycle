import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BusinessException } from '@shared/exceptions/business.exception';
import { ApiResponse } from '@shared/types/common.types';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof BusinessException) {
      status = exception.getStatus();
      message = exception.message;
      code = exception.code;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || exception.message;
      code = 'HTTP_ERROR';
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unexpected error: ${exception.message}`, exception.stack);
    }

    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(
      `HTTP ${status} Error: ${message}`,
      JSON.stringify({
        url: request.url,
        method: request.method,
        body: request.body,
        query: request.query,
        params: request.params,
        headers: request.headers,
      }),
    );

    response.status(status).json(errorResponse);
  }
}
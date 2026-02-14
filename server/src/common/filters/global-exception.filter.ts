import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BusinessException } from '../exceptions/business.exception';
import { ApiResponse } from '../types/common.types';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: any = undefined;

    if (exception instanceof BusinessException) {
      status = exception.getStatus();
      message = exception.message;
      code = exception.code;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseData = exceptionResponse as any;
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
      message = exception.message;
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

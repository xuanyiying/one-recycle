/**
 * 业务异常类
 */

import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../types/common.types';

export class BusinessException extends HttpException {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}

export class ValidationException extends BusinessException {
  constructor(message: string, details?: any) {
    super(ErrorCode.VALIDATION_ERROR, message, details, HttpStatus.BAD_REQUEST);
  }
}

export class NotFoundException extends BusinessException {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    super(ErrorCode.NOT_FOUND, message, { resource, id }, HttpStatus.NOT_FOUND);
  }
}

export class UnauthorizedException extends BusinessException {
  constructor(message: string = 'Unauthorized access') {
    super(ErrorCode.UNAUTHORIZED, message, undefined, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenException extends BusinessException {
  constructor(message: string = 'Access forbidden') {
    super(ErrorCode.FORBIDDEN, message, undefined, HttpStatus.FORBIDDEN);
  }
}

export class ServiceUnavailableException extends BusinessException {
  constructor(service: string, message?: string) {
    const defaultMessage = `${service} service is currently unavailable`;
    super(
      ErrorCode.SERVICE_UNAVAILABLE,
      message || defaultMessage,
      { service },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

export class RateLimitExceededException extends BusinessException {
  constructor(limit: number, window: string) {
    super(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      `Rate limit exceeded: ${limit} requests per ${window}`,
      { limit, window },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

export class InternalServerException extends BusinessException {
  constructor(message: string = 'Internal server error', details?: any) {
    super(
      ErrorCode.INTERNAL_ERROR,
      message,
      details,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

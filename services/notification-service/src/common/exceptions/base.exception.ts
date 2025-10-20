import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    error?: string,
  ) {
    super(
      {
        statusCode,
        message,
        error: error || 'Internal Server Error',
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}
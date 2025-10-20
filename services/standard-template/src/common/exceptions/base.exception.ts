import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseException extends HttpException {
    constructor(message: string, status: HttpStatus, errorCode?: string) {
        super(
            {
                status: 'error',
                message,
                errorCode,
                timestamp: new Date().toISOString(),
            },
            status,
        );
    }
}
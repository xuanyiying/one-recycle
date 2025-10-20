import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status: number;
        let message: string;
        let error: string;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            
            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const responseObj = exceptionResponse as any;
                message = responseObj.message || exception.message;
                error = responseObj.error || 'Http Exception';
            } else {
                message = exceptionResponse as string;
                error = 'Http Exception';
            }
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            error = 'Internal Server Error';
        }

        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message,
            error,
        };

        this.logger.error(
            `${request.method} ${request.url}`,
            JSON.stringify(errorResponse),
            exception instanceof Error ? exception.stack : 'Unknown error',
        );

        response.status(status).json(errorResponse);
    }
}
import { HttpException, HttpStatus } from '@nestjs/common';

export class JdExpressException extends HttpException {
    constructor(
        message: string,
        public readonly code?: string,
        public readonly details?: any
    ) {
        super(
            {
                message,
                code,
                details,
                timestamp: new Date().toISOString()
            },
            HttpStatus.BAD_GATEWAY
        );
    }
}

export class JdExpressTimeoutException extends JdExpressException {
    constructor(operation: string, timeout: number) {
        super(
            `京东快递API操作超时: ${operation}`,
            'JD_EXPRESS_TIMEOUT',
            { operation, timeout }
        );
    }
}

export class JdExpressAuthException extends JdExpressException {
    constructor(message: string = '京东快递API认证失败') {
        super(message, 'JD_EXPRESS_AUTH_FAILED');
    }
}

export class JdExpressRateLimitException extends JdExpressException {
    constructor(retryAfter?: number) {
        super(
            '京东快递API请求频率超限',
            'JD_EXPRESS_RATE_LIMIT',
            { retryAfter }
        );
    }
}

export class JdExpressValidationException extends JdExpressException {
    constructor(field: string, value: any, reason: string) {
        super(
            `京东快递API参数验证失败: ${field}`,
            'JD_EXPRESS_VALIDATION_FAILED',
            { field, value, reason }
        );
    }
}

export class JdExpressServiceUnavailableException extends JdExpressException {
    constructor(service: string) {
        super(
            `京东快递服务不可用: ${service}`,
            'JD_EXPRESS_SERVICE_UNAVAILABLE',
            { service }
        );
    }
}
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const method = req.method;
    const originalUrl = req.originalUrl;
    const ip = req.ip;
    const headers = req.headers;
    const userAgent = headers['user-agent'] || '';

    // 记录请求开始
    this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // 监听响应完成
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      const contentLength = res.get('content-length') || 0;

      this.logger.log(
        `${method} ${originalUrl} - ${statusCode} - ${contentLength}bytes - ${duration}ms`
      );
    });

    next();
  }
}
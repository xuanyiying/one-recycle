import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        mobile?: string;
        roles?: string[];
      };
    }
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    // 跳过不需要认证的路径
    const publicPaths = [
      '/health',
      '/api/v1/auth/login',
      '/api/v1/auth/register',
      '/api/v1/auth/verify-code',
      '/api/v1/auth/refresh',
    ];

    const isPublicPath = publicPaths.some(path => req.path.startsWith(path));
    if (isPublicPath) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      req.user = {
        id: payload.sub,
        mobile: payload.mobile,
        roles: payload.roles || [],
      };

      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
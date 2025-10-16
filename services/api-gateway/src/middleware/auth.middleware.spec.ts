import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthMiddleware } from './auth.middleware';
import { 
  createMockConfigService, 
  createMockJwtService, 
  createMockRequest, 
  createMockResponse,
  createTestJwtPayload 
} from '../../tests/test-utils';

describe('AuthMiddleware', () => {
  let middleware: AuthMiddleware;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthMiddleware,
        {
          provide: JwtService,
          useValue: createMockJwtService(),
        },
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
      ],
    }).compile();

    middleware = module.get<AuthMiddleware>(AuthMiddleware);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('use', () => {
    it('should allow public paths without authentication', async () => {
      const req = createMockRequest({ path: '/health' });
      const res = createMockResponse();
      const next = jest.fn();

      await middleware.use(req as any, res as any, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it('should allow auth login path', async () => {
      const req = createMockRequest({ path: '/api/v1/auth/login' });
      const res = createMockResponse();
      const next = jest.fn();

      await middleware.use(req as any, res as any, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow auth register path', async () => {
      const req = createMockRequest({ path: '/api/v1/auth/register' });
      const res = createMockResponse();
      const next = jest.fn();

      await middleware.use(req as any, res as any, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow auth verify-code path', async () => {
      const req = createMockRequest({ path: '/api/v1/auth/verify-code' });
      const res = createMockResponse();
      const next = jest.fn();

      await middleware.use(req as any, res as any, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow auth refresh path', async () => {
      const req = createMockRequest({ path: '/api/v1/auth/refresh' });
      const res = createMockResponse();
      const next = jest.fn();

      await middleware.use(req as any, res as any, next);

      expect(next).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when no authorization header', async () => {
      const req = createMockRequest({ 
        path: '/api/v1/protected',
        headers: {} 
      });
      const res = createMockResponse();
      const next = jest.fn();

      await expect(
        middleware.use(req as any, res as any, next)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when authorization header is invalid', async () => {
      const req = createMockRequest({ 
        path: '/api/v1/protected',
        headers: { authorization: 'Invalid token' }
      });
      const res = createMockResponse();
      const next = jest.fn();

      await expect(
        middleware.use(req as any, res as any, next)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when authorization header does not start with Bearer', async () => {
      const req = createMockRequest({ 
        path: '/api/v1/protected',
        headers: { authorization: 'Basic token' }
      });
      const res = createMockResponse();
      const next = jest.fn();

      await expect(
        middleware.use(req as any, res as any, next)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should authenticate valid JWT token', async () => {
      const payload = createTestJwtPayload();
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);

      const req = createMockRequest({ 
        path: '/api/v1/protected',
        headers: { authorization: 'Bearer valid-token' }
      });
      const res = createMockResponse();
      const next = jest.fn();

      await middleware.use(req as any, res as any, next);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
        secret: 'test-secret-key',
      });
      expect(req.user).toEqual({
        id: payload.sub,
        mobile: payload.mobile,
        roles: payload.roles,
      });
      expect(next).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when JWT verification fails', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('Invalid token'));

      const req = createMockRequest({ 
        path: '/api/v1/protected',
        headers: { authorization: 'Bearer invalid-token' }
      });
      const res = createMockResponse();
      const next = jest.fn();

      await expect(
        middleware.use(req as any, res as any, next)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle JWT payload without roles', async () => {
      const payload = { ...createTestJwtPayload(), roles: undefined };
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);

      const req = createMockRequest({ 
        path: '/api/v1/protected',
        headers: { authorization: 'Bearer valid-token' }
      });
      const res = createMockResponse();
      const next = jest.fn();

      await middleware.use(req as any, res as any, next);

      expect(req.user).toEqual({
        id: payload.sub,
        mobile: payload.mobile,
        roles: [],
      });
      expect(next).toHaveBeenCalled();
    });

    it('should extract token correctly from Bearer header', async () => {
      const payload = createTestJwtPayload();
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);

      const req = createMockRequest({ 
        path: '/api/v1/protected',
        headers: { authorization: `Bearer ${token}` }
      });
      const res = createMockResponse();
      const next = jest.fn();

      await middleware.use(req as any, res as any, next);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: 'test-secret-key',
      });
    });

    it('should use JWT secret from config service', async () => {
      const customSecret = 'custom-secret-key';
      jest.spyOn(configService, 'get').mockReturnValue(customSecret);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(createTestJwtPayload());

      const req = createMockRequest({ 
        path: '/api/v1/protected',
        headers: { authorization: 'Bearer token' }
      });
      const res = createMockResponse();
      const next = jest.fn();

      await middleware.use(req as any, res as any, next);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('token', {
        secret: customSecret,
      });
    });

    it('should handle case-insensitive Bearer prefix', async () => {
      const payload = createTestJwtPayload();
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);

      const req = createMockRequest({ 
        path: '/api/v1/protected',
        headers: { authorization: 'bearer valid-token' }
      });
      const res = createMockResponse();
      const next = jest.fn();

      // This should fail because the middleware expects exact "Bearer " prefix
      await expect(
        middleware.use(req as any, res as any, next)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle paths that start with public paths but are longer', async () => {
      const req = createMockRequest({ path: '/api/v1/auth/login/extra' });
      const res = createMockResponse();
      const next = jest.fn();

      await middleware.use(req as any, res as any, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
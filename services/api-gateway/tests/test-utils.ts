import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

// 测试数据生成器
export const createTestUser = () => ({
  id: 'test-user-id',
  mobile: '13800138000',
  roles: ['user'],
});

export const createTestJwtPayload = () => ({
  sub: 'test-user-id',
  mobile: '13800138000',
  roles: ['user'],
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
});

export const createTestServiceConfig = () => ({
  name: 'test-service-1',
  baseUrl: 'http://localhost:3001',
  healthCheck: '/health',
  timeout: 5000,
  retries: 3,
  weight: 1,
});

export const createTestAggregateRequest = (overrides: any = {}) => ({
  key: 'test-request',
  service: 'test-service',
  path: '/test',
  method: 'GET',
  body: { test: 'data' },
  headers: { 'Content-Type': 'application/json' },
  ...overrides,
});

// 别名，保持向后兼容
export const createMockAggregateRequest = createTestAggregateRequest;

export const createMockHealthResponse = () => ({
  services: {
    'test-service': {
      status: 'healthy',
      instances: [
        {
          name: 'test-service-1',
          baseUrl: 'http://localhost:3001',
          isHealthy: true,
          lastHealthCheck: new Date().toISOString(),
        },
      ],
    },
  },
});

export const createTestAxiosResponse = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
});

// Mock服务工厂
export const createMockConfigService = () => ({
  get: jest.fn((key: string) => {
    const config = {
      port: 3000,
      'rateLimit.ttl': 60,
      'rateLimit.limit': 100,
      'cors.origin': ['http://localhost:3000'],
      'cors.credentials': true,
      'jwt.secret': 'test-secret-key',
      'jwt.expiresIn': '24h',
      services: {
        'test-service': [createTestServiceConfig()],
      },
    };
    return config[key];
  }),
});

export const createMockHttpService = () => ({
  get: jest.fn(() => of(createTestAxiosResponse({ success: true }))),
  post: jest.fn(() => of(createTestAxiosResponse({ success: true }))),
  put: jest.fn(() => of(createTestAxiosResponse({ success: true }))),
  delete: jest.fn(() => of(createTestAxiosResponse({ success: true }))),
  patch: jest.fn(() => of(createTestAxiosResponse({ success: true }))),
  request: jest.fn(() => of(createTestAxiosResponse({ success: true }))),
});

export const createMockJwtService = () => ({
  sign: jest.fn(() => 'test-jwt-token'),
  verify: jest.fn(() => createTestJwtPayload()),
  verifyAsync: jest.fn(() => Promise.resolve(createTestJwtPayload())),
  decode: jest.fn(() => createTestJwtPayload()),
});

// 请求/响应模拟
export const createMockRequest = (overrides: any = {}) => ({
  path: '/api/v1/test',
  method: 'GET',
  headers: {
    authorization: 'Bearer test-token',
    'content-type': 'application/json',
  },
  body: {},
  query: {},
  params: {},
  user: createTestUser(),
  ...overrides,
});

export const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    writeHead: jest.fn().mockReturnThis(),
    write: jest.fn().mockReturnThis(),
    pipe: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    once: jest.fn().mockReturnThis(),
    emit: jest.fn().mockReturnThis(),
    removeListener: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
    links: jest.fn().mockReturnThis(),
    jsonp: jest.fn().mockReturnThis(),
    sendFile: jest.fn().mockReturnThis(),
    download: jest.fn().mockReturnThis(),
    contentType: jest.fn().mockReturnThis(),
    type: jest.fn().mockReturnThis(),
    format: jest.fn().mockReturnThis(),
    attachment: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    location: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
    render: jest.fn().mockReturnThis(),
    locals: {},
    charset: 'utf-8',
    vary: jest.fn().mockReturnThis(),
    app: {} as any,
    headersSent: false,
    req: {} as any,
  };
  return res as any;
};

// 测试模块构建器
export const createTestingModule = async (providers: any[] = []) => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        provide: ConfigService,
        useValue: createMockConfigService(),
      },
      {
        provide: HttpService,
        useValue: createMockHttpService(),
      },
      {
        provide: JwtService,
        useValue: createMockJwtService(),
      },
      ...providers,
    ],
  }).compile();

  return module;
};
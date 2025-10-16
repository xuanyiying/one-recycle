import { config } from 'dotenv';
import { join } from 'path';

// 加载测试环境变量
config({ path: join(__dirname, '..', '.env.test') });

// 设置Jest超时时间
jest.setTimeout(30000);

// 全局测试钩子
beforeAll(async () => {
  // 设置测试环境变量
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.PORT = '3000';
  process.env.RATE_LIMIT_TTL = '60';
  process.env.RATE_LIMIT_COUNT = '100';
  process.env.CORS_ORIGINS = 'http://localhost:3000';
  
  // 设置服务URL
  process.env.ACCOUNT_SERVICE_URL = 'http://localhost:3001';
  process.env.ORDER_SERVICE_URL = 'http://localhost:3002';
  process.env.DISPATCH_SERVICE_URL = 'http://localhost:3003';
  process.env.COURIER_SERVICE_URL = 'http://localhost:3004';
  process.env.NOTIFICATION_SERVICE_URL = 'http://localhost:3005';
  process.env.PAYMENT_SERVICE_URL = 'http://localhost:3006';
  process.env.INVENTORY_SERVICE_URL = 'http://localhost:3007';
  process.env.CATEGORY_SERVICE_URL = 'http://localhost:3008';
});

afterAll(async () => {
  // 清理测试环境
});
import { config } from 'dotenv';
import { join } from 'path';

// 加载测试环境变量
config({ path: join(__dirname, '..', '.env.test') });

// 设置测试超时时间
jest.setTimeout(30000);

// 全局测试设置
beforeAll(async () => {
  // 这里可以添加全局测试前的设置
});

afterAll(async () => {
  // 这里可以添加全局测试后的清理
});

// 每个测试前的设置
beforeEach(() => {
  // 清除所有模拟
  jest.clearAllMocks();
});

// 每个测试后的清理
afterEach(() => {
  // 这里可以添加每个测试后的清理逻辑
});
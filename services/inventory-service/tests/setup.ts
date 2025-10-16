import { config } from 'dotenv';

// 加载测试环境变量
config({ path: '.env.test' });

// 设置测试超时
jest.setTimeout(30000);

// 全局测试设置
beforeAll(async () => {
  // 全局测试前置操作
});

afterAll(async () => {
  // 全局测试后置操作
});
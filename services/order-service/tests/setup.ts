import { config } from 'dotenv';

// 加载测试环境变量
config({ path: '.env.test' });

// 设置Jest超时时间
jest.setTimeout(30000);

// 全局测试钩子
beforeAll(async () => {
  // 测试前的全局设置
});

afterAll(async () => {
  // 测试后的全局清理
});
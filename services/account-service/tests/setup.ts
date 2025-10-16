import { PrismaClient } from '../prisma/generated/client';

// 添加 BigInt 序列化支持
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// 设置测试超时
jest.setTimeout(30000);

// 全局测试清理
afterAll(async () => {
  // 清理数据库连接等
  const prisma = new PrismaClient();
  await prisma.$disconnect();
});
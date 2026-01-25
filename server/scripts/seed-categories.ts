import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL 未在 .env 文件中设置');
    process.exit(1);
  }

  // 创建 PostgreSQL 连接池和适配器 (Prisma 7 最佳实践)
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const categories = [
      {
        name: '旧书',
        description: '各类二手书籍回收',
        type: 'RECYCLE',
        priceInfo: '{}',
        seo: '{}',
        sortOrder: 1,
      },
      {
        name: '旧衣',
        description: '各类旧衣物回收',
        type: 'RECYCLE',
        priceInfo: '{}',
        seo: '{}',
        sortOrder: 2,
      },
    ];

    console.log('--- 开始初始化分类数据 ---');

    for (const data of categories) {
      const existing = await prisma.category.findFirst({
        where: { name: data.name },
      });

      if (!existing) {
        await prisma.category.create({
          data: {
            ...data,
            level: 1,
            path: '0',
          },
        });
        console.log(`✅ 已创建分类: ${data.name}`);
      } else {
        console.log(`ℹ️ 分类已存在: ${data.name}`);
      }
    }

    console.log('--- 分类数据初始化完成 ---');
  } catch (error) {
    console.error('❌ 初始化分类数据出错:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
import { config } from 'dotenv';
config({ path: path.join(__dirname, '../.env') });

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
    const existingTenant = await prisma.tenant.findFirst({
      where: { code: 'DEFAULT' },
      select: { id: true },
    });
    let tenantId = existingTenant?.id;
    if (!tenantId) {
      const createdTenant = await prisma.tenant.create({
        data: {
          name: '默认租户',
          code: 'DEFAULT',
          contactName: '管理员',
          contactPhone: '13812345678',
          status: 'ACTIVE',
        },
        select: { id: true },
      });
      tenantId = createdTenant.id;
    }

    const categories = [
      {
        name: '旧书',
        description: '各类二手书籍回收',
        type: 'recycle',
        priceInfo: JSON.stringify({
          type: 'fixed',
          unitPrice: 2.2,
          unit: 'kg',
          currency: 'CNY',
        }),
        seo: '{}',
        sortOrder: 1,
        pricingRule: {
          basePrice: 2.2,
          minWeight: 0.1,
          maxWeight: 200,
          ruleJson: { basePrice: 2.2 },
          isActive: true,
        },
      },
      {
        name: '旧衣',
        description: '各类旧衣物回收',
        type: 'recycle',
        priceInfo: JSON.stringify({
          type: 'fixed',
          unitPrice: 3.5,
          unit: 'kg',
          currency: 'CNY',
        }),
        seo: '{}',
        sortOrder: 2,
        pricingRule: {
          basePrice: 3.5,
          minWeight: 0.1,
          maxWeight: 200,
          ruleJson: { basePrice: 3.5 },
          isActive: true,
        },
      },
    ];

    console.log('--- 开始初始化分类数据 ---');

    for (const data of categories) {
      const existing = await prisma.category.findFirst({
        where: { name: data.name },
      });

      let categoryId = existing?.id;
      if (!existing) {
        const created = await prisma.category.create({
          data: {
            name: data.name,
            description: data.description,
            type: data.type,
            priceInfo: data.priceInfo,
            seo: data.seo,
            sortOrder: data.sortOrder,
            level: 1,
            path: '0',
          },
        });
        categoryId = created.id;
        console.log(`✅ 已创建分类: ${data.name}`);
      } else {
        await prisma.category.update({
          where: { id: existing.id },
          data: {
            description: data.description,
            type: data.type,
            priceInfo: data.priceInfo,
            seo: data.seo,
            sortOrder: data.sortOrder,
          },
        });
        console.log(`ℹ️ 分类已存在: ${data.name}`);
      }

      if (categoryId) {
        const pricingRule = data.pricingRule;
        const existingRule = await prisma.recyclePricingRule.findFirst({
          where: {
            categoryId,
            tenantId,
          },
          orderBy: { createdAt: 'desc' },
        });

        if (existingRule) {
          await prisma.recyclePricingRule.update({
            where: { id: existingRule.id },
            data: {
              basePrice: pricingRule.basePrice,
              minWeight: pricingRule.minWeight,
              maxWeight: pricingRule.maxWeight,
              ruleJson: pricingRule.ruleJson,
              isActive: pricingRule.isActive,
            },
          });
        } else {
          await prisma.recyclePricingRule.create({
            data: {
              tenantId,
              categoryId,
              basePrice: pricingRule.basePrice,
              minWeight: pricingRule.minWeight,
              maxWeight: pricingRule.maxWeight,
              ruleJson: pricingRule.ruleJson,
              isActive: pricingRule.isActive,
            },
          });
        }
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

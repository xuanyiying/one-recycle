import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { config } from 'dotenv';
config({ path: path.join(__dirname, '../.env') });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL 未在 .env 文件中设置');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('--- 开始初始化物流服务商数据 ---');

    // 物流服务商配置数据
    const logisticsProviders = [
      {
        id: 1,
        name: '京东物流',
        code: 'jd',
        apiUrl: 'https://api.jdl.com',
        tenantId: process.env.JD_TENANT_ID || 'jd_tenant_001',
        appId: process.env.JD_APP_ID || '',
        appSecret: process.env.JD_APP_SECRET || '',
        config: {
          basePrice: 12,
          pricePerKg: 2.5,
          pricePerKm: 0.6,
          volumeFactor: 1.8,
          minPrice: 10,
          avgSpeed: 45,
          baseTime: 1.5,
          maxWeight: 50,
          serviceAreas: ['北京市', '上海市', '广州市', '深圳市'],
          features: ['上门取件', '实时追踪', '保价服务'],
          description: '京东物流 - 快捷可靠，覆盖主要城市',
        },
        isActive: true,
      },
      {
        id: 2,
        name: '顺丰速运',
        code: 'sf',
        apiUrl: 'https://sf-api.sf-express.com',
        tenantId: process.env.SF_TENANT_ID || 'sf_tenant_001',
        appId: process.env.SF_APP_ID || '',
        appSecret: process.env.SF_APP_SECRET || '',
        config: {
          basePrice: 15,
          pricePerKg: 3.0,
          pricePerKm: 0.8,
          volumeFactor: 2.0,
          minPrice: 12,
          avgSpeed: 50,
          baseTime: 1.0,
          maxWeight: 100,
          serviceAreas: ['全国主要城市'],
          features: ['上门取件', '实时追踪', '保价服务', '冷链运输'],
          description: '顺丰速运 - 品质保证，时效领先',
        },
        isActive: true,
      },
      {
        id: 3,
        name: '中通快递',
        code: 'zto',
        apiUrl: 'https://www.zto.com/api',
        tenantId: process.env.ZTO_TENANT_ID || 'zto_tenant_001',
        appId: process.env.ZTO_APP_ID || '',
        appSecret: process.env.ZTO_APP_SECRET || '',
        config: {
          basePrice: 8,
          pricePerKg: 1.8,
          pricePerKm: 0.4,
          volumeFactor: 1.5,
          minPrice: 8,
          avgSpeed: 35,
          baseTime: 2.0,
          maxWeight: 30,
          serviceAreas: ['全国'],
          features: ['上门取件', '经济实惠'],
          description: '中通快递 - 性价比之选，网络覆盖广',
        },
        isActive: true,
      },
      {
        id: 4,
        name: '圆通速递',
        code: 'yto',
        apiUrl: 'https://www.yto.net.cn/api',
        tenantId: process.env.YTO_TENANT_ID || 'yto_tenant_001',
        appId: process.env.YTO_APP_ID || '',
        appSecret: process.env.YTO_APP_SECRET || '',
        config: {
          basePrice: 9,
          pricePerKg: 2.0,
          pricePerKm: 0.5,
          volumeFactor: 1.6,
          minPrice: 9,
          avgSpeed: 38,
          baseTime: 1.8,
          maxWeight: 40,
          serviceAreas: ['全国大部分地区'],
          features: ['上门取件', '价格透明'],
          description: '圆通速递 - 稳定高效，服务优质',
        },
        isActive: true,
      },
    ];

    console.log('正在初始化物流服务商数据...');
    for (const provider of logisticsProviders) {
      await prisma.logisticsProvider.upsert({
        where: { id: provider.id },
        update: provider,
        create: provider,
      });
    }
    console.log(`✅ 已初始化 ${logisticsProviders.length} 个物流服务商`);

    // 输出费率对比表
    console.log('\n📊 物流服务商费率对比:');
    console.log('─'.repeat(80));
    console.log(
      '| 服务商 | 起步价 | 重量费率 | 距离费率 | 最低价 | 平均速度 |'
    );
    console.log('─'.repeat(80));
    for (const p of logisticsProviders) {
      const c = p.config;
      console.log(
        `| ${p.name.padEnd(8, '　')} | ¥${c.basePrice.toString().padStart(4)} | ¥${c.pricePerKg}/kg | ¥${c.pricePerKm}/km | ¥${c.minPrice.toString().padStart(4)} | ${c.avgSpeed}km/h |`
      );
    }
    console.log('─'.repeat(80));

    console.log('\n💡 使用说明:');
    console.log('- 物流费用 = max(basePrice + weight×pricePerKg, volume×volumeFactor) + distance×pricePerKm');
    console.log('- 最终费用不会低于 minPrice（最低价）');
    console.log('- 系统会自动选择最优报价的服务商');

    console.log('--- 物流服务商数据初始化完成 ---');
  } catch (error) {
    console.error('初始化失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();

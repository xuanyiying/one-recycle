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

  // 创建 PostgreSQL 连接池和适配器
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // 创建一个测试用户，ID 固定为 1
    const testUserId = BigInt(1);
    
    console.log('--- 开始初始化测试数据 ---');

    // 1. 确保测试用户存在
    const existingUser = await prisma.user.findUnique({
      where: { id: testUserId },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: testUserId,
          mobile: '13800138000',
          nickname: '测试用户',
          status: 'ACTIVE',
        },
      });
      console.log('✅ 已创建测试用户');
    } else {
      console.log('ℹ️ 测试用户已存在');
    }

    // 2. 初始化地区数据 (Region)
    const regions = [
      { code: '440000', name: '广东省', level: 1, parentCode: '000000' },
      { code: '440300', name: '深圳市', level: 2, parentCode: '440000' },
      { code: '440305', name: '南山区', level: 3, parentCode: '440300' },
    ];

    for (const region of regions) {
      const existingRegion = await prisma.region.findUnique({
        where: { code: region.code },
      });

      if (!existingRegion) {
        await prisma.region.create({ data: region });
        console.log(`✅ 已创建地区: ${region.name}`);
      }
    }

    // 3. 为测试用户创建地址
    const addressData = {
      userId: testUserId,
      name: '张三',
      mobile: '13800138000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      town: '粤海街道',
      street: '科苑路',
      zipCode: '518000',
      detail: '腾讯大厦 20 层',
      isDefault: true,
    };

    const existingAddress = await prisma.address.findFirst({
      where: { userId: testUserId, detail: addressData.detail },
    });

    if (!existingAddress) {
      await prisma.address.create({ data: addressData });
      console.log('✅ 已为测试用户创建默认地址');
    } else {
      console.log('ℹ️ 测试地址已存在');
    }

    console.log('--- 测试数据初始化完成 ---');
  } catch (error) {
    console.error('❌ 初始化测试数据出错:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();

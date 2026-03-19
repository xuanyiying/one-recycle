import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { PrismaClient, ProductType, ProductStatus, TaskType, PointsType } from '@prisma/client';

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
    console.log('--- 开始初始化积分商城测试数据 ---');

    // 1. 创建商品分类
    const categories = [
      { name: '虚拟卡券', icon: 'ticket', sortOrder: 100 },
      { name: '实物商品', icon: 'gift', sortOrder: 90 },
      { name: '生活服务', icon: 'service', sortOrder: 80 },
      { name: '环保周边', icon: 'leaf', sortOrder: 70 },
    ];

    const categoryMap: Record<string, number> = {};

    for (const cat of categories) {
      const existing = await prisma.pointsProductCategory.findFirst({
        where: { name: cat.name },
      });

      if (!existing) {
        const created = await prisma.pointsProductCategory.create({ data: cat });
        categoryMap[cat.name] = created.id;
        console.log(`✅ 已创建分类: ${cat.name}`);
      } else {
        categoryMap[cat.name] = existing.id;
        console.log(`ℹ️ 分类已存在: ${cat.name}`);
      }
    }

    // 2. 创建积分商品
    const products = [
      {
        name: '5元话费充值券',
        description: '可用于充值手机话费，面值5元',
        coverImage: 'https://picsum.photos/400/400?random=1',
        images: ['https://picsum.photos/400/400?random=1'],
        type: ProductType.VIRTUAL,
        points: 500,
        stock: 1000,
        soldCount: 128,
        status: ProductStatus.ACTIVE,
        sortOrder: 100,
        categoryId: categoryMap['虚拟卡券'],
        extraData: { value: 5, unit: '元', provider: '话费充值' },
      },
      {
        name: '10元话费充值券',
        description: '可用于充值手机话费，面值10元',
        coverImage: 'https://picsum.photos/400/400?random=2',
        images: ['https://picsum.photos/400/400?random=2'],
        type: ProductType.VIRTUAL,
        points: 950,
        stock: 500,
        soldCount: 86,
        status: ProductStatus.ACTIVE,
        sortOrder: 99,
        categoryId: categoryMap['虚拟卡券'],
        extraData: { value: 10, unit: '元', provider: '话费充值' },
      },
      {
        name: '腾讯视频月卡',
        description: '腾讯视频VIP会员月卡，畅享高清影视',
        coverImage: 'https://picsum.photos/400/400?random=3',
        images: ['https://picsum.photos/400/400?random=3'],
        type: ProductType.VIRTUAL,
        points: 1500,
        stock: 200,
        soldCount: 45,
        status: ProductStatus.ACTIVE,
        sortOrder: 98,
        categoryId: categoryMap['虚拟卡券'],
        extraData: { value: 1, unit: '月', provider: '腾讯视频' },
      },
      {
        name: '网易云音乐月卡',
        description: '网易云音乐黑胶VIP月卡，畅听无损音乐',
        coverImage: 'https://picsum.photos/400/400?random=4',
        images: ['https://picsum.photos/400/400?random=4'],
        type: ProductType.VIRTUAL,
        points: 1200,
        stock: 200,
        soldCount: 32,
        status: ProductStatus.ACTIVE,
        sortOrder: 97,
        categoryId: categoryMap['虚拟卡券'],
        extraData: { value: 1, unit: '月', provider: '网易云音乐' },
      },
      {
        name: '环保购物袋',
        description: '可重复使用的环保购物袋，为地球减负',
        coverImage: 'https://picsum.photos/400/400?random=5',
        images: ['https://picsum.photos/400/400?random=5'],
        type: ProductType.PHYSICAL,
        points: 800,
        stock: 50,
        soldCount: 18,
        status: ProductStatus.ACTIVE,
        sortOrder: 96,
        categoryId: categoryMap['环保周边'],
        extraData: { material: '帆布', size: '40x35cm' },
      },
      {
        name: '不锈钢保温杯',
        description: '304不锈钢保温杯，保温12小时',
        coverImage: 'https://picsum.photos/400/400?random=6',
        images: ['https://picsum.photos/400/400?random=6'],
        type: ProductType.PHYSICAL,
        points: 2000,
        stock: 30,
        soldCount: 12,
        status: ProductStatus.ACTIVE,
        sortOrder: 95,
        categoryId: categoryMap['环保周边'],
        extraData: { capacity: '500ml', material: '304不锈钢' },
      },
      {
        name: '垃圾分类指南手册',
        description: '实用的垃圾分类指南，帮助您正确分类',
        coverImage: 'https://picsum.photos/400/400?random=7',
        images: ['https://picsum.photos/400/400?random=7'],
        type: ProductType.PHYSICAL,
        points: 300,
        stock: 100,
        soldCount: 56,
        status: ProductStatus.ACTIVE,
        sortOrder: 94,
        categoryId: categoryMap['环保周边'],
        extraData: { pages: 50, size: 'A5' },
      },
      {
        name: '20元京东E卡',
        description: '京东E卡，可在京东商城购物使用',
        coverImage: 'https://picsum.photos/400/400?random=8',
        images: ['https://picsum.photos/400/400?random=8'],
        type: ProductType.VIRTUAL,
        points: 1900,
        stock: 100,
        soldCount: 23,
        status: ProductStatus.ACTIVE,
        sortOrder: 93,
        categoryId: categoryMap['虚拟卡券'],
        extraData: { value: 20, unit: '元', provider: '京东' },
      },
      {
        name: '美团外卖10元红包',
        description: '美团外卖红包，满20元可用',
        coverImage: 'https://picsum.photos/400/400?random=9',
        images: ['https://picsum.photos/400/400?random=9'],
        type: ProductType.VIRTUAL,
        points: 900,
        stock: 300,
        soldCount: 67,
        status: ProductStatus.ACTIVE,
        sortOrder: 92,
        categoryId: categoryMap['生活服务'],
        extraData: { value: 10, unit: '元', provider: '美团外卖', minOrder: 20 },
      },
      {
        name: '环保竹纤维毛巾',
        description: '天然竹纤维毛巾，柔软亲肤，环保可降解',
        coverImage: 'https://picsum.photos/400/400?random=10',
        images: ['https://picsum.photos/400/400?random=10'],
        type: ProductType.PHYSICAL,
        points: 600,
        stock: 80,
        soldCount: 34,
        status: ProductStatus.ACTIVE,
        sortOrder: 91,
        categoryId: categoryMap['环保周边'],
        extraData: { material: '竹纤维', size: '70x35cm' },
      },
    ];

    for (const product of products) {
      const existing = await prisma.pointsProduct.findFirst({
        where: { name: product.name },
      });

      if (!existing) {
        await prisma.pointsProduct.create({
          data: {
            ...product,
            categoryId: product.categoryId || undefined,
            extraData: product.extraData || undefined,
          },
        });
        console.log(`✅ 已创建商品: ${product.name}`);
      } else {
        console.log(`ℹ️ 商品已存在: ${product.name}`);
      }
    }

    // 3. 创建积分任务
    const tasks = [
      {
        name: '每日签到',
        description: '每日签到可获得积分奖励',
        type: TaskType.CUSTOM,
        points: 10,
        icon: 'calendar-check',
        config: { daily: true, continuousBonus: [5, 10, 15, 20, 25, 30, 50] },
        isActive: true,
        sortOrder: 100,
      },
      {
        name: '完善个人资料',
        description: '完善头像、昵称等个人资料',
        type: TaskType.PROFILE_COMPLETE,
        points: 50,
        icon: 'user',
        config: { oneTime: true },
        isActive: true,
        sortOrder: 90,
      },
      {
        name: '首次下单回收',
        description: '完成第一笔回收订单',
        type: TaskType.FIRST_ORDER,
        points: 100,
        icon: 'order',
        config: { oneTime: true },
        isActive: true,
        sortOrder: 80,
      },
      {
        name: '邀请好友',
        description: '邀请好友注册并完成首单',
        type: TaskType.SHARE,
        points: 200,
        icon: 'share',
        config: { perInvite: true, maxInvites: 10 },
        isActive: true,
        sortOrder: 70,
      },
      {
        name: '评价订单',
        description: '对完成的回收订单进行评价',
        type: TaskType.REVIEW,
        points: 20,
        icon: 'star',
        config: { perOrder: true },
        isActive: true,
        sortOrder: 60,
      },
    ];

    for (const task of tasks) {
      const existing = await prisma.pointsTask.findFirst({
        where: { name: task.name },
      });

      if (!existing) {
        await prisma.pointsTask.create({ data: task });
        console.log(`✅ 已创建任务: ${task.name}`);
      } else {
        console.log(`ℹ️ 任务已存在: ${task.name}`);
      }
    }

    // 4. 为测试用户添加积分记录（如果测试用户存在）
    const testUserId = BigInt(1);
    const testUser = await prisma.user.findUnique({
      where: { id: testUserId },
    });

    if (testUser) {
      // 给用户一些初始积分
      await prisma.user.update({
        where: { id: testUserId },
        data: { points: 1000 },
      });
      console.log('✅ 已为测试用户添加初始积分: 1000');

      // 创建一些积分记录
      const records = [
        {
          userId: testUserId,
          type: PointsType.ADJUST,
          points: 1000,
          balanceAfter: 1000,
          description: '新用户注册奖励',
          sourceType: 'SYSTEM',
        },
        {
          userId: testUserId,
          type: PointsType.SIGN_IN,
          points: 10,
          balanceAfter: 1010,
          description: '每日签到奖励',
          sourceType: 'SIGN_IN',
        },
      ];

      for (const record of records) {
        const existing = await prisma.pointsRecord.findFirst({
          where: {
            userId: testUserId,
            description: record.description,
          },
        });

        if (!existing) {
          await prisma.pointsRecord.create({ data: record });
          console.log(`✅ 已创建积分记录: ${record.description}`);
        }
      }
    }

    // 5. 初始化推广返佣规则配置
    const referralConfigs = [
      {
        key: 'REFERRAL_REWARD_TYPE',
        value: 'FIXED',
        description: '返佣类型: FIXED=固定金额返佣, PERCENTAGE=比例返佣',
      },
      {
        key: 'REFERRAL_REWARD_VALUE',
        value: '50',
        description: '返佣值（固定金额或百分比，根据类型决定）',
      },
      {
        key: 'REFERRAL_REWARD_TIMING',
        value: 'FIRST_ORDER',
        description: '返佣时机: FIRST_ORDER=仅首单返佣, EVERY_ORDER=每单都返佣',
      },
      {
        key: 'REFERRAL_MIN_REWARD_POINTS',
        value: '1',
        description: '最低返佣积分（当计算值低于此值时使用此值）',
      },
    ];

    for (const config of referralConfigs) {
      const existing = await prisma.systemConfig.findUnique({
        where: { key: config.key },
      });

      if (!existing) {
        await prisma.systemConfig.create({
          data: {
            key: config.key,
            value: config.value,
            description: config.description,
            isActive: true,
          },
        });
        console.log(`✅ 已创建返佣配置: ${config.key} = ${config.value}`);
      } else {
        console.log(`ℹ️ 返佣配置已存在: ${config.key}`);
      }
    }

    console.log('--- 积分商城测试数据初始化完成 ---');
  } catch (error) {
    console.error('❌ 初始化积分商城测试数据出错:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();

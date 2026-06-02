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
    console.log('--- 开始初始化 Banner 和 Article 数据 ---');

    // 1. 初始化Banner轮播图数据
    const bannerData = [
      {
        id: 1,
        title: '旧书回收，绿色生活',
        subtitle: '让知识循环利用',
        description: '专业旧书回收服务，上门取件，让每本书都有新归宿',
        imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=300&fit=crop',
        linkUrl: '/category/1',
        sortOrder: 1,
        isActive: true,
      },
      {
        id: 2,
        title: '旧衣回收，价格优惠',
        subtitle: '衣旧情深，爱心传递',
        description: '高价回收旧衣物，支持公益环保事业',
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=300&fit=crop',
        linkUrl: '/category/2',
        sortOrder: 2,
        isActive: true,
      },
      {
        id: 3,
        title: '电子产品回收专场',
        subtitle: '安全环保，高价回收',
        description: '手机电脑家电回收，专业数据清除，隐私无忧',
        imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=300&fit=crop',
        linkUrl: '/category/4',
        sortOrder: 3,
        isActive: true,
      },
      {
        id: 4,
        title: '新人专享福利',
        subtitle: '首单立减10元',
        description: '注册即送100积分，首次下单额外获得50积分奖励',
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=300&fit=crop',
        linkUrl: '/promotions/new-user',
        sortOrder: 4,
        isActive: true,
      },
      {
        id: 5,
        title: '环保积分商城',
        subtitle: '积分换好礼',
        description: '用回收获得的积分兑换精美礼品，让环保更有价值',
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=300&fit=crop',
        linkUrl: '/points-mall',
        sortOrder: 5,
        isActive: true,
      },
    ];

    console.log('正在初始化Banner数据...');
    for (const banner of bannerData) {
      await prisma.banner.upsert({
        where: { id: banner.id },
        update: banner,
        create: banner,
      });
    }
    console.log(`✅ 已初始化 ${bannerData.length} 条Banner数据`);

    // 2. 初始化Article文章数据
    const articleData = [
      {
        id: 1,
        title: '如何正确分类回收废品',
        content: `废品分类回收是环保的重要环节。正确的分类不仅能提高回收效率，还能减少环境污染。

**可回收物包括：**

1. **纸张类**：报纸、书本、纸箱、办公用纸等
   - 注意：卫生纸、餐巾纸不可回收（水溶性太强）

2. **塑料类**：塑料瓶、塑料桶、塑料玩具等
   - 注意：需清洗干净，去除标签

3. **金属类**：易拉罐、金属餐具、铁制品等
   - 注意：尖锐物品需包装好

4. **纺织品类**：旧衣物、床单、窗帘等
   - 注意：需清洗晾干

5. **电子产品**：手机、电脑、小家电等
   - 注意：需清除个人数据

**分类小技巧：**
- 在家中设置不同颜色的垃圾桶
- 定期清理，避免堆积
- 教育家人养成分类习惯`,
        summary: '学习正确的废品分类方法，提高回收效率，为环保贡献力量',
        coverImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=200&fit=crop',
        author: '环保专家',
        viewCount: 1250,
        isPublished: true,
        publishedAt: new Date('2025-01-15'),
      },
      {
        id: 2,
        title: '旧物改造：旧T恤变环保袋',
        content: `家里的旧T恤不要扔！简单几步就能变成实用的环保袋。

**所需材料：**
- 旧T恤 1件
- 剪刀 1把
- 针线（可选）

**制作步骤：**

1. **准备T恤**：选择一件较厚的棉质T恤，洗净晾干

2. **裁剪**：
   - 将袖子沿缝线剪掉
   - 领口部分根据需要剪大一些

3. **底部处理**：
   - 将底部的下摆剪成流苏状（约5cm宽）
   - 每两条流苏打一个结
   - 重复直到整个底部封住

4. **加固（可选）**：
   - 可以在提手处多缝几圈加固

**使用场景：**
- 购物买菜
- 外出旅行收纳
- 收纳杂物

这样不仅减少了浪费，还为环保出了一份力！`,
        summary: '创意DIY，让旧物焕发新生，打造专属环保袋',
        coverImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=200&fit=crop',
        author: '手工达人',
        viewCount: 850,
        isPublished: true,
        publishedAt: new Date('2025-02-20'),
      },
      {
        id: 3,
        title: '电子垃圾的危害与正确处理方式',
        content: `随着科技发展，电子废弃物日益增多，正确处理电子垃圾至关重要。

**电子垃圾的危害：**

1. **土壤污染**：重金属渗入土壤，影响农作物生长
2. **水源污染**：有害物质污染地下水
3. **空气污染**：焚烧产生有毒气体
4. **健康危害**：铅、汞等重金属影响人体健康

**常见电子垃圾：**
- 手机、平板、电脑
- 电视、冰箱、洗衣机
- 电池、灯管
- 充电器、数据线

**正确处理方式：**

1. **正规渠道回收**：通过我们平台预约上门回收
2. **数据清除**：恢复出厂设置或使用专业工具
3. **分类存放**：不同类型分开存放
4. **不随意丢弃**：避免造成环境污染

**我们的服务承诺：**
- 专业数据清除
- 环保处理流程
- 合理价格回收`,
        summary: '了解电子垃圾危害，学会科学处理废旧电子产品',
        coverImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=200&fit=crop',
        author: '科技环保',
        viewCount: 2100,
        isPublished: true,
        publishedAt: new Date('2025-03-10'),
      },
      {
        id: 4,
        title: '回收行业的发展趋势与未来展望',
        content: `随着人们环保意识的增强，回收行业正在迎来快速发展期。

**当前趋势：**

1. **数字化升级**
   - 线上预约成为主流
   - AI智能估价系统
   - 区块链溯源技术

2. **服务模式创新**
   - 上门回收标准化
   - 即时结算到账
   - 积分激励体系

3. **产业链延伸**
   - 回收→分拣→再加工→销售
   - 形成完整闭环生态

4. **政策支持**
   - 碳中和目标推动
   - 垃圾分类强制实施
   - 绿色金融扶持

**未来展望：**

- **智能化**：物联网+大数据优化回收路径
- **社区化**：建立社区回收网络节点
- **全球化**：跨境回收标准统一
- **价值化**：碳交易纳入回收体系

作为普通消费者，我们可以：
- 养成分类习惯
- 选择正规回收平台
- 参与环保宣传
- 支持再生产品`,
        summary: '探索回收行业的数字化转型和可持续发展之路',
        coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop',
        author: '行业观察',
        viewCount: 1580,
        isPublished: true,
        publishedAt: new Date('2025-04-05'),
      },
      {
        id: 5,
        title: '家庭垃圾分类实用指南',
        content: `做好家庭垃圾分类，从源头减少环境污染。

**四分类法：**

1. **可回收物（蓝色桶）**
   - 废纸、塑料、玻璃、金属、织物
   - 示例：报纸、饮料瓶、易拉罐、旧衣服

2. **厨余垃圾（绿色桶）**
   - 易腐烂的有机废弃物
   - 示例：剩菜剩饭、果皮菜叶、过期食品

3. **有害垃圾（红色桶）**
   - 对健康或环境有害的废弃物
   - 示例：电池、灯管、药品、油漆

4. **其他垃圾（灰色桶）**
   - 除上述三类外的其他废弃物
   - 示例：卫生纸、烟蒂、陶瓷碎片

**实操建议：**

- 厨房设置两个垃圾桶（干湿分离）
- 阳台设置可回收物暂存区
- 有害垃圾单独存放，定期处理
- 培养全家人的分类习惯

**常见误区：**
❌ 所有塑料都能回收 → 只有部分可以
❌ 受污纸张可回收 → 不可回收
❌ 电池是其他垃圾 → 属于有害垃圾`,
        summary: '掌握家庭垃圾分类技巧，轻松践行绿色生活方式',
        coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=200&fit=crop',
        author: '生活达人',
        viewCount: 3200,
        isPublished: true,
        publishedAt: new Date('2025-05-18'),
      },
    ];

    console.log('正在初始化Article数据...');
    for (const article of articleData) {
      await prisma.article.upsert({
        where: { id: article.id },
        update: article,
        create: article,
      });
    }
    console.log(`✅ 已初始化 ${articleData.length} 条Article数据`);

    console.log('--- Banner 和 Article 数据初始化完成 ---');
  } catch (error) {
    console.error('初始化失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();

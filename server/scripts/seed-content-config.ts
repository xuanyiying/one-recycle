import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient, FAQCategory, RecycleRuleCategory } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    console.log('--- 开始初始化内容配置数据 ---');

    // 1. 初始化FAQ数据
    const faqData = [
      // 服务相关
      {
        question: '旧书回收支持哪些书籍类型？',
        answer: '我们支持教材教辅、小说文学、期刊杂志、少儿绘本等大部分书籍。但不回收破损严重、缺页、发霉、非法出版物或无ISBN号的内刊。',
        category: FAQCategory.SERVICE,
        sortOrder: 1,
      },
      {
        question: '上门回收是否收费？',
        answer: '我们的上门回收服务是完全免费的。您只需要预约时间，回收员会按时上门进行称重和回收，不收取任何上门费或手续费。',
        category: FAQCategory.SERVICE,
        sortOrder: 2,
      },
      {
        question: '回收下单有重量要求吗？',
        answer: '为了避免资源浪费，单次预约回收的物品总重量建议在 5kg 以上。对于旧家电、手机等高价值物品，无重量限制，单件即可下单。',
        category: FAQCategory.SERVICE,
        sortOrder: 3,
      },
      {
        question: '预约后可以修改或取消订单吗？',
        answer: '在回收员接单前，您可以随时在"我的订单"中修改或取消。若回收员已接单或出发，请提前致电回收员沟通，避免空跑。',
        category: FAQCategory.SERVICE,
        sortOrder: 4,
      },
      // 支付相关
      {
        question: '回收价格是如何制定的？',
        answer: '回收价格根据当前市场行情动态调整。您可以在首页"分类价格"中查看最新的单价。最终成交价以回收员上门称重后的系统计算为准。',
        category: FAQCategory.PAYMENT,
        sortOrder: 5,
      },
      {
        question: '回收款多久可以到账？',
        answer: '订单完成后，回收款会即时打入您的平台余额。您可以随时申请提现到微信或支付宝，通常在 1-2 小时内到账，最快即时到账。',
        category: FAQCategory.PAYMENT,
        sortOrder: 6,
      },
      {
        question: '提现需要手续费吗？',
        answer: '普通用户每月享有 3 次免费提现机会。超过次数后，每笔提现将收取 0.1% 的银行通道费（最低 0.1 元）。会员用户享有无限次免费提现权益。',
        category: FAQCategory.PAYMENT,
        sortOrder: 7,
      },
      {
        question: '为什么实际到账金额与预估不符？',
        answer: '预估价格仅供参考。实际金额取决于物品的实际重量和品相（如旧衣是否潮湿、书籍是否缺页）。回收员会当面核实并录入，系统自动计算最终金额。',
        category: FAQCategory.PAYMENT,
        sortOrder: 8,
      },
      // 物品分类
      {
        question: '旧衣回收有什么具体要求？',
        answer: '旧衣需要清洗干净、晾干。我们接收四季衣物、鞋帽、家纺（床单被套）。不接收内衣裤、袜子、严重脏污油腻或发霉的衣物。',
        category: FAQCategory.CATEGORY,
        sortOrder: 9,
      },
      {
        question: '废旧手机回收要注意什么？',
        answer: '回收前请务必退出 iCloud/账号锁，并备份重要数据。我们会有专业的数据清除流程，但建议您先自行恢复出厂设置以确保万无一失。',
        category: FAQCategory.CATEGORY,
        sortOrder: 10,
      },
      {
        question: '大家电（冰箱/洗衣机）怎么回收？',
        answer: '大家电回收需要专业人员搬运。请下单时准确填写品牌、年限和故障情况。我们会安排专车上门，请确保电梯或楼道畅通。',
        category: FAQCategory.CATEGORY,
        sortOrder: 11,
      },
      {
        question: '湿垃圾或厨余垃圾回收吗？',
        answer: '抱歉，我们不仅支持可回收物（纸、塑、衣、电、金）。厨余垃圾、有害垃圾（电池、灯管）请按当地垃圾分类规定投放到指定垃圾桶。',
        category: FAQCategory.CATEGORY,
        sortOrder: 12,
      },
      // 积分相关
      {
        question: '环保积分有什么用？',
        answer: '积分可以在"积分商城"兑换环保周边、优惠券或捐赠给公益项目。积分也是计算"环保榜单"排名的重要依据。',
        category: FAQCategory.POINTS,
        sortOrder: 13,
      },
      {
        question: '如何获得环保积分？',
        answer: '每完成一笔回收订单，根据物品重量和类型会获得相应积分。此外，每日签到、邀请好友、参与环保知识答题也能获得额外积分。',
        category: FAQCategory.POINTS,
        sortOrder: 14,
      },
      {
        question: '环保榜单多久更新一次？',
        answer: '环保榜单分为周榜和月榜。数据实时统计，但榜单排名每日凌晨 02:00 更新一次。前三名用户将获得专属虚拟徽章奖励。',
        category: FAQCategory.POINTS,
        sortOrder: 15,
      },
      // 账户相关
      {
        question: '一个账号可以绑定多个地址吗？',
        answer: '可以。您可以在"地址管理"中添加常用地址（如家、公司、父母家），下单时选择对应地址即可。',
        category: FAQCategory.ACCOUNT,
        sortOrder: 16,
      },
      {
        question: '忘记登录密码怎么办？',
        answer: '目前支持手机号验证码快捷登录，无需记忆密码。如需设置或找回密码，可在"设置-账号安全"中通过手机验证进行操作。',
        category: FAQCategory.ACCOUNT,
        sortOrder: 17,
      },
      {
        question: '如何注销账号？',
        answer: '若您不再使用本服务，可联系在线客服申请注销。注销前请确保账户余额已提现且无进行中的订单。注销后数据无法恢复。',
        category: FAQCategory.ACCOUNT,
        sortOrder: 18,
      },
      // 通用问题
      {
        question: '对上门回收员不满意怎么办？',
        answer: '订单完成后，您可以对回收员进行评价打分。如遇态度恶劣或违规操作，请直接拨打 400 客服电话或在线投诉，我们会严肃处理。',
        category: FAQCategory.GENERAL,
        sortOrder: 19,
      },
      {
        question: '发现漏记重量了怎么办？',
        answer: '请当场核对无误后再确认订单。若事后发现异常，请在24小时内联系客服并提供监控或照片证据，我们将调取回收员记录进行复核。',
        category: FAQCategory.GENERAL,
        sortOrder: 20,
      },
    ];

    console.log('正在初始化FAQ数据...');
    for (const faq of faqData) {
      await prisma.fAQ.upsert({
        where: {
          id: faq.sortOrder,
        },
        update: faq,
        create: {
          id: faq.sortOrder,
          ...faq,
        },
      });
    }
    console.log(`✅ 已初始化 ${faqData.length} 条FAQ数据`);

    // 2. 初始化回收规则数据
    const recycleRuleData = [
      // 服务类型
      {
        category: RecycleRuleCategory.SERVICE_TYPE,
        title: '旧书回收',
        content: '回收各类教材、图书、杂志等纸质书籍。包括但不限于：教科书、小说、工具书、儿童读物等。书籍需保持完整，无严重破损或污损。',
        icon: 'book',
        sortOrder: 1,
      },
      {
        category: RecycleRuleCategory.SERVICE_TYPE,
        title: '旧衣回收',
        content: '回收各类服装、鞋帽、箱包、床上用品等纺织品。要求：干净、干燥、无明显破损，可再次利用或环保处理。',
        icon: 'shirt',
        sortOrder: 2,
      },
      {
        category: RecycleRuleCategory.SERVICE_TYPE,
        title: '电子产品回收',
        content: '回收手机、平板、电脑、家电等电子产品。需确保产品来源合法，非盗抢物品，可进行数据清除后回收处理。',
        icon: 'device',
        sortOrder: 3,
      },
      // 服务范围
      {
        category: RecycleRuleCategory.SERVICE_SCOPE,
        title: '覆盖区域',
        content: '目前服务已覆盖北京市主要城区，包括朝阳区、海淀区、东城区、西城区、丰台区、石景山区等。其他区域正在陆续开通中。',
        icon: 'location',
        sortOrder: 1,
      },
      {
        category: RecycleRuleCategory.SERVICE_SCOPE,
        title: '上门条件',
        content: '单次回收重量需达到5公斤以上，或书籍数量达到20本以上。如未达到标准，可选择自行送至就近回收点。',
        icon: 'truck',
        sortOrder: 2,
      },
      {
        category: RecycleRuleCategory.SERVICE_SCOPE,
        title: '预约时间',
        content: '可预约时间为每日 9:00-18:00，需提前24小时预约。节假日期间服务时间可能有所调整，请以预约页面显示为准。',
        icon: 'clock',
        sortOrder: 3,
      },
      // 操作流程
      {
        category: RecycleRuleCategory.PROCESS,
        title: '在线预约',
        content: '通过小程序选择回收类型，填写物品信息，选择上门时间，提交预约订单。',
        icon: 'edit',
        sortOrder: 1,
      },
      {
        category: RecycleRuleCategory.PROCESS,
        title: '上门回收',
        content: '回收员按预约时间上门，现场核验物品，确认回收品类和数量。',
        icon: 'home',
        sortOrder: 2,
      },
      {
        category: RecycleRuleCategory.PROCESS,
        title: '质检定价',
        content: '物品送至仓库进行专业质检，根据品相、数量等因素确定最终回收价格。',
        icon: 'check',
        sortOrder: 3,
      },
      {
        category: RecycleRuleCategory.PROCESS,
        title: '获得收益',
        content: '质检完成后，收益以积分形式发放至账户，可用于提现或兑换商城商品。',
        icon: 'coin',
        sortOrder: 4,
      },
      // 回收标准
      {
        category: RecycleRuleCategory.STANDARD,
        title: '可回收',
        content: '以下物品可正常回收',
        icon: 'check-circle',
        sortOrder: 1,
        extra: {
          tags: ['干净衣物', '完整书籍', '可用电子产品', '鞋帽箱包', '床上用品'],
          tagType: 'success',
        },
      },
      {
        category: RecycleRuleCategory.STANDARD,
        title: '不可回收',
        content: '以下物品不在回收范围内',
        icon: 'x-circle',
        sortOrder: 2,
        extra: {
          tags: ['严重破损衣物', '发霉潮湿物品', '严重污损书籍', '报废电子产品', '危险化学品'],
          tagType: 'error',
        },
      },
      // 积分规则
      {
        category: RecycleRuleCategory.POINTS_RULE,
        title: '积分获取',
        content: '回收价格以实时估价为准，不同品类、品相价格不同。\n书籍、衣物按重量计价，电子产品根据型号和成色单独估价。\n具体价格请在下单时查看实时估价。',
        icon: 'star',
        sortOrder: 1,
      },
      {
        category: RecycleRuleCategory.POINTS_RULE,
        title: '积分使用',
        content: '积分可用于：1）提现至微信零钱；2）兑换积分商城商品；3）参与平台活动。100积分=1元人民币。',
        icon: 'gift',
        sortOrder: 2,
      },
      {
        category: RecycleRuleCategory.POINTS_RULE,
        title: '积分有效期',
        content: '积分永久有效，但建议及时使用。如账户长期未使用（超过2年），平台可能会进行账户清理并提前通知。',
        icon: 'calendar',
        sortOrder: 3,
      },
      // 注意事项
      {
        category: RecycleRuleCategory.NOTICE,
        title: '注意事项',
        content: '• 请确保回收物品来源合法，非盗抢或非法所得物品\n• 电子产品回收前请自行备份并清除个人数据\n• 回收价格以实际质检结果为准，与预估价格可能存在差异\n• 如对质检结果有异议，可在48小时内联系客服申诉\n• 取消预约需提前2小时操作，频繁取消可能影响信用分\n• 平台保留对回收规则的最终解释权',
        icon: 'info',
        sortOrder: 1,
      },
    ];

    console.log('正在初始化回收规则数据...');
    for (const rule of recycleRuleData) {
      const ruleId = recycleRuleData.indexOf(rule) + 1;
      await prisma.recycleRule.upsert({
        where: {
          id: ruleId,
        },
        update: rule,
        create: {
          id: ruleId,
          ...rule,
        },
      });
    }
    console.log(`✅ 已初始化 ${recycleRuleData.length} 条回收规则数据`);

    console.log('--- 内容配置数据初始化完成 ---');
  } catch (error) {
    console.error('初始化失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();

import { Injectable } from '@nestjs/common';
import {
  BannerResponseDto,
  ArticleResponseDto,
  QAResponseDto,
  RankingResponseDto,
} from './dto';

@Injectable()
export class SystemService {
  private readonly banners: BannerResponseDto[] = [
    {
      id: 1,
      title: '旧书回收，绿色生活',
      subtitle: '让知识循环利用',
      description: '专业旧书回收服务，上门取件',
      image: 'https://placehold.co/800x300/png?text=旧书回收',
      link: '/category/1',
      sortOrder: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      title: '旧衣回收，价格优惠',
      subtitle: '衣旧情深，爱心传递',
      description: '高价回收旧衣物，支持公益',
      image: 'https://placehold.co/800x300/png?text=旧衣回收',
      link: '/category/1',
      sortOrder: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      title: '电子产品回收专场',
      subtitle: '安全环保，高价回收',
      description: '手机电脑家电回收，隐私清除',
      image: 'https://placehold.co/800x300/png?text=电子回收',
      link: '/category/4',
      sortOrder: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private readonly articles: ArticleResponseDto[] = [
    {
      id: 1,
      title: '如何正确分类回收废品',
      content: '废品分类回收是环保的重要环节...',
      summary: '学习正确的废品分类方法，提高回收效率',
      image: 'https://placehold.co/400x200/png?text=分类回收',
      author: '环保专家',
      viewCount: 1250,
      isPublished: true,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      title: '旧物改造：旧T恤变环保袋',
      content: '家里的旧T恤不要扔，简单几步就能变成实用的环保袋...',
      summary: '创意DIY，让旧物焕发新生',
      image: 'https://placehold.co/400x200/png?text=旧物改造',
      author: '手工达人',
      viewCount: 850,
      isPublished: true,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  getBanners(): BannerResponseDto[] {
    return this.banners.filter((b) => b.isActive);
  }

  getArticles(): ArticleResponseDto[] {
    return this.articles.filter((a) => a.isPublished);
  }

  getNewsBriefs(): any[] {
    const items = [
      '旧书',
      '旧衣',
      '废纸箱',
      '塑料瓶',
      '旧家电',
      '金属',
      '废旧手机',
    ];
    const nicknames = [
      '张**',
      '李**',
      '王**',
      '赵**',
      '陈**',
      '刘**',
      '杨**',
      '周**',
      '吴**',
      '郑**',
    ];

    return Array.from({ length: 10 }).map((_, index) => {
      const item = items[Math.floor(Math.random() * items.length)];
      let weight = 0;
      let earnings = 0;

      // Calculate realistic weights and earnings based on item type
      if (['旧书', '废纸箱'].includes(item)) {
        weight = parseFloat((Math.random() * 20 + 5).toFixed(1)); // 5-25kg
        earnings = weight * 0.8;
      } else if (item === '旧衣') {
        weight = parseFloat((Math.random() * 10 + 2).toFixed(1)); // 2-12kg
        earnings = weight * 0.4;
      } else if (item === '塑料瓶') {
        weight = parseFloat((Math.random() * 5 + 1).toFixed(1)); // 1-6kg
        earnings = weight * 1.2;
      } else if (['旧家电', '废旧手机'].includes(item)) {
        weight = 1; // Count as 1 unit
        earnings = Math.floor(Math.random() * 100 + 20); // 20-120 yuan
      } else {
        weight = parseFloat((Math.random() * 10 + 2).toFixed(1));
        earnings = weight * 1.5;
      }

      // Random time
      const times = [
        '刚刚',
        '1分钟前',
        '3分钟前',
        '5分钟前',
        '10分钟前',
        '半小时前',
      ];
      const time = times[Math.floor(Math.random() * times.length)];

      return {
        id: index + 1,
        nickname: nicknames[Math.floor(Math.random() * nicknames.length)],
        soldItems: item,
        weight,
        earnings: parseFloat(earnings.toFixed(2)),
        time,
      };
    });
  }

  getQA(): QAResponseDto[] {
    const qaList = [
      // 1. 基础服务类
      {
        question: '旧书回收支持哪些书籍类型？',
        answer:
          '我们支持教材教辅、小说文学、期刊杂志、少儿绘本等大部分书籍。但不回收破损严重、缺页、发霉、非法出版物或无ISBN号的内刊。',
        category: 'SERVICE',
        sortOrder: 1,
      },
      {
        question: '上门回收是否收费？',
        answer:
          '我们的上门回收服务是完全免费的。您只需要预约时间，回收员会按时上门进行称重和回收，不收取任何上门费或手续费。',
        category: 'SERVICE',
        sortOrder: 2,
      },
      {
        question: '回收下单有重量要求吗？',
        answer:
          '为了避免资源浪费，单次预约回收的物品总重量建议在 5kg 以上。对于旧家电、手机等高价值物品，无重量限制，单件即可下单。',
        category: 'SERVICE',
        sortOrder: 3,
      },
      {
        question: '预约后可以修改或取消订单吗？',
        answer:
          '在回收员接单前，您可以随时在"我的订单"中修改或取消。若回收员已接单或出发，请提前致电回收员沟通，避免空跑。',
        category: 'SERVICE',
        sortOrder: 4,
      },

      // 2. 价格与支付类
      {
        question: '回收价格是如何制定的？',
        answer:
          '回收价格根据当前市场行情动态调整。您可以在首页"分类价格"中查看最新的单价。最终成交价以回收员上门称重后的系统计算为准。',
        category: 'PAYMENT',
        sortOrder: 5,
      },
      {
        question: '回收款多久可以到账？',
        answer:
          '订单完成后，回收款会即时打入您的平台余额。您可以随时申请提现到微信或支付宝，通常在 1-2 小时内到账，最快即时到账。',
        category: 'PAYMENT',
        sortOrder: 6,
      },
      {
        question: '提现需要手续费吗？',
        answer:
          '普通用户每月享有 3 次免费提现机会。超过次数后，每笔提现将收取 0.1% 的银行通道费（最低 0.1 元）。会员用户享有无限次免费提现权益。',
        category: 'PAYMENT',
        sortOrder: 7,
      },
      {
        question: '为什么实际到账金额与预估不符？',
        answer:
          '预估价格仅供参考。实际金额取决于物品的实际重量和品相（如旧衣是否潮湿、书籍是否缺页）。回收员会当面核实并录入，系统自动计算最终金额。',
        category: 'PAYMENT',
        sortOrder: 8,
      },

      // 3. 物品分类类
      {
        question: '旧衣回收有什么具体要求？',
        answer:
          '旧衣需要清洗干净、晾干。我们接收四季衣物、鞋帽、家纺（床单被套）。不接收内衣裤、袜子、严重脏污油腻或发霉的衣物。',
        category: 'CATEGORY',
        sortOrder: 9,
      },
      {
        question: '废旧手机回收要注意什么？',
        answer:
          '回收前请务必退出 iCloud/账号锁，并备份重要数据。我们会有专业的数据清除流程，但建议您先自行恢复出厂设置以确保万无一失。',
        category: 'CATEGORY',
        sortOrder: 10,
      },
      {
        question: '大家电（冰箱/洗衣机）怎么回收？',
        answer:
          '大家电回收需要专业人员搬运。请下单时准确填写品牌、年限和故障情况。我们会安排专车上门，请确保电梯或楼道畅通。',
        category: 'CATEGORY',
        sortOrder: 11,
      },
      {
        question: '湿垃圾或厨余垃圾回收吗？',
        answer:
          '抱歉，我们不仅支持可回收物（纸、塑、衣、电、金）。厨余垃圾、有害垃圾（电池、灯管）请按当地垃圾分类规定投放到指定垃圾桶。',
        category: 'CATEGORY',
        sortOrder: 12,
      },

      // 4. 环保积分与榜单
      {
        question: '环保积分有什么用？',
        answer:
          '积分可以在"积分商城"兑换环保周边、优惠券或捐赠给公益项目。积分也是计算"环保榜单"排名的重要依据。',
        category: 'POINTS',
        sortOrder: 13,
      },
      {
        question: '如何获得环保积分？',
        answer:
          '每完成一笔回收订单，根据物品重量和类型会获得相应积分。此外，每日签到、邀请好友、参与环保知识答题也能获得额外积分。',
        category: 'POINTS',
        sortOrder: 14,
      },
      {
        question: '环保榜单多久更新一次？',
        answer:
          '环保榜单分为周榜和月榜。数据实时统计，但榜单排名每日凌晨 02:00 更新一次。前三名用户将获得专属虚拟徽章奖励。',
        category: 'Test',
        sortOrder: 15,
      },

      // 5. 账号与安全
      {
        question: '一个账号可以绑定多个地址吗？',
        answer:
          '可以。您可以在"地址管理"中添加常用地址（如家、公司、父母家），下单时选择对应地址即可。',
        category: 'ACCOUNT',
        sortOrder: 16,
      },
      {
        question: '忘记登录密码怎么办？',
        answer:
          '目前支持手机号验证码快捷登录，无需记忆密码。如需设置或找回密码，可在"设置-账号安全"中通过手机验证进行操作。',
        category: 'ACCOUNT',
        sortOrder: 17,
      },
      {
        question: '如何注销账号？',
        answer:
          '若您不再使用本服务，可联系在线客服申请注销。注销前请确保账户余额已提现且无进行中的订单。注销后数据无法恢复。',
        category: 'ACCOUNT',
        sortOrder: 18,
      },

      // 6. 售后与投诉
      {
        question: '对上门回收员不满意怎么办？',
        answer:
          '订单完成后，您可以对回收员进行评价打分。如遇态度恶劣或违规操作，请直接拨打 400 客服电话或在线投诉，我们会严肃处理。',
        category: 'SERVICE',
        sortOrder: 19,
      },
      {
        question: '发现漏记重量了怎么办？',
        answer:
          '请当场核对无误后再确认订单。若事后发现异常，请在24小时内联系客服并提供监控或照片证据，我们将调取回收员记录进行复核。',
        category: 'SERVICE',
        sortOrder: 20,
      },
    ];

    return qaList.map((item, index) => ({
      id: index + 1,
      question: item.question,
      answer: item.answer,
      order: item.sortOrder,
    }));
  }

  getRankings(): RankingResponseDto[] {
    const nicknames = [
      '环保卫士',
      '绿色先锋',
      '低碳达人',
      '地球守护者',
      '回收小能手',
    ];
    return Array.from({ length: 5 })
      .map((_, index) => ({
        id: index + 1,
        nickname: nicknames[index] || `User${index + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
        score: Math.floor(Math.random() * 500) + 100, // 100-600 points
        rank: index + 1,
      }))
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }
}

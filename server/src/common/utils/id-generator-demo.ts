/**
 * 分布式ID生成器使用演示
 * 展示如何在实际项目中使用各种ID生成功能
 */

import {
  SnowflakeIdGenerator,
  NanoIdGenerator,
  IdValidator,
  generateSecureorderNo,
  generateSecurePaymentNumber,
  generateSecureRefundNumber,
  generateUniqueId,
  generateShortId,
} from './common.util';

/**
 * 演示基本ID生成功能
 */
function demonstrateBasicIdGeneration() {
  console.log('=== 基本ID生成演示 ===');

  // 生成全局唯一ID（雪花算法）
  const uniqueId = generateUniqueId();
  console.log('全局唯一ID:', uniqueId);
  console.log('ID验证:', IdValidator.validateSnowflakeId(uniqueId));

  // 生成短ID（NanoID）
  const shortId = generateShortId();
  console.log('短ID:', shortId);
  console.log('短ID验证:', IdValidator.validateNanoId(shortId));

  // 生成业务ID
  const orderNo = generateSecureorderNo();
  const paymentNumber = generateSecurePaymentNumber();
  const refundNumber = generateSecureRefundNumber();

  console.log('订单号:', orderNo);
  console.log('支付单号:', paymentNumber);
  console.log('退款单号:', refundNumber);

  console.log('订单号验证:', IdValidator.validateorderNo(orderNo));
  console.log(
    '支付单号验证:',
    IdValidator.validatePaymentNumber(paymentNumber),
  );
}

/**
 * 演示雪花算法生成器
 */
function demonstrateSnowflakeGenerator() {
  console.log('\n=== 雪花算法生成器演示 ===');

  // 创建雪花算法生成器
  const generator = new SnowflakeIdGenerator({
    workerId: 1,
    datacenterId: 1,
    epoch: Date.now() - 1000 * 60 * 60 * 24 * 365, // 1年前作为起始时间
  });

  console.log('雪花算法ID:', generator.nextId());
  console.log('批量生成:', generator.nextIds(5));

  // 解析时间戳
  const id = generator.nextId();
  console.log('生成的ID:', id);
  console.log('解析时间戳:', generator.parseTimestamp(id));
}

/**
 * 演示NanoID生成器
 */
function demonstrateNanoIdGenerator() {
  console.log('\n=== NanoID生成器演示 ===');

  // 创建NanoID生成器
  const generator = new NanoIdGenerator({
    size: 16,
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  });

  console.log('NanoID:', generator.nextId());
  console.log('批量生成:', generator.nextIds(5));

  // 不同配置的生成器
  const shortGenerator = new NanoIdGenerator({ size: 8 });
  const longGenerator = new NanoIdGenerator({
    size: 32,
    alphabet: '0123456789ABCDEF', // 仅使用十六进制字符
  });

  console.log('短NanoID:', shortGenerator.nextId());
  console.log('长NanoID:', longGenerator.nextId());
}

/**
 * 演示并发安全性
 */
async function demonstrateConcurrencySafety() {
  console.log('\n=== 并发安全性演示 ===');

  const generator = new SnowflakeIdGenerator({ workerId: 1, datacenterId: 1 });
  const promises: Promise<string[]>[] = [];

  // 创建多个并发任务
  for (let i = 0; i < 10; i++) {
    promises.push(
      new Promise((resolve) => {
        const ids: string[] = [];
        for (let j = 0; j < 100; j++) {
          ids.push(generator.nextId());
        }
        resolve(ids);
      }),
    );
  }

  const results = await Promise.all(promises);
  const allIds = results.flat();
  const uniqueIds = new Set(allIds);

  console.log('并发生成结果:', {
    总ID数: allIds.length,
    唯一ID数: uniqueIds.size,
    重复检测: allIds.length === uniqueIds.size ? '通过' : '失败',
  });
}

/**
 * 演示性能测试
 */
function demonstratePerformance() {
  console.log('\n=== 性能测试演示 ===');

  const snowflakeGenerator = new SnowflakeIdGenerator({
    workerId: 1,
    datacenterId: 1,
  });
  const nanoIdGenerator = new NanoIdGenerator();

  // 雪花算法性能测试
  const snowflakeStart = Date.now();
  const snowflakeCount = 100000;
  for (let i = 0; i < snowflakeCount; i++) {
    snowflakeGenerator.nextId();
  }
  const snowflakeDuration = Date.now() - snowflakeStart;
  const snowflakeIdsPerSecond = snowflakeCount / (snowflakeDuration / 1000);

  console.log(`雪花算法性能: ${snowflakeIdsPerSecond.toFixed(0)} IDs/秒`);

  // NanoID性能测试
  const nanoIdStart = Date.now();
  const nanoIdCount = 100000;
  for (let i = 0; i < nanoIdCount; i++) {
    nanoIdGenerator.nextId();
  }
  const nanoIdDuration = Date.now() - nanoIdStart;
  const nanoIdIdsPerSecond = nanoIdCount / (nanoIdDuration / 1000);

  console.log(`NanoID性能: ${nanoIdIdsPerSecond.toFixed(0)} IDs/秒`);
}

/**
 * 演示实际业务场景
 */
function demonstrateBusinessScenarios() {
  console.log('\n=== 业务场景演示 ===');

  // 模拟用户注册
  const userId = generateUniqueId();
  console.log('新用户ID:', userId);

  // 模拟创建订单
  const orderId = generateUniqueId();
  const orderNo = generateSecureorderNo();
  console.log('订单信息:', { orderId, orderNo });

  // 模拟支付流程
  const paymentId = generateUniqueId();
  const paymentNumber = generateSecurePaymentNumber();
  console.log('支付信息:', { paymentId, paymentNumber });

  // 模拟退款流程
  const refundId = generateUniqueId();
  const refundNumber = generateSecureRefundNumber();
  console.log('退款信息:', { refundId, refundNumber });

  // 模拟生成短链接ID
  const shortLinkId = generateShortId();
  console.log('短链接ID:', shortLinkId);
}

/**
 * 主演示函数
 */
async function runDemo() {
  console.log('🚀 分布式ID生成器演示开始\n');

  try {
    demonstrateBasicIdGeneration();
    demonstrateSnowflakeGenerator();
    demonstrateNanoIdGenerator();
    await demonstrateConcurrencySafety();
    demonstratePerformance();
    demonstrateBusinessScenarios();

    console.log('\n✅ 演示完成！');
    console.log('\n📋 使用说明:');
    console.log('1. 使用 generateUniqueId() 生成全局唯一的雪花算法ID');
    console.log('2. 使用 generateShortId() 生成短的NanoID');
    console.log('3. 使用 generateSecureorderNo() 生成安全的订单号');
    console.log('4. 使用 generateSecurePaymentNumber() 生成安全的支付单号');
    console.log('5. 使用 generateSecureRefundNumber() 生成安全的退款单号');
    console.log('6. 使用 IdValidator 验证各种ID格式');
    console.log('7. 直接实例化生成器类进行高级配置和批量生成');
  } catch (error) {
    console.error('❌ 演示过程中发生错误:', error);
  }
}

// 如果直接运行此文件，则执行演示
if (require.main === module) {
  runDemo();
}

export {
  demonstrateBasicIdGeneration,
  demonstrateSnowflakeGenerator,
  demonstrateNanoIdGenerator,
  demonstrateConcurrencySafety,
  demonstratePerformance,
  demonstrateBusinessScenarios,
  runDemo,
};

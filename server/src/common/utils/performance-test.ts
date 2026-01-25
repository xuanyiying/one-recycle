#!/usr/bin/env ts-node

/**
 * 分布式ID生成器性能测试
 *
 * 测试各种ID生成器的性能表现，包括：
 * - 单线程性能测试
 * - 并发性能测试
 * - 内存使用测试
 * - 唯一性验证
 */

import {
  generateUniqueId,
  generateShortId,
  generateSecureOrderNumber,
  generateSecurePaymentNumber,
  SnowflakeIdGenerator,
  NanoIdGenerator,
} from './common.util';

interface PerformanceResult {
  name: string;
  totalTime: number;
  idsPerSecond: number;
  memoryUsed: number;
  uniqueIds: number;
  totalIds: number;
}

/**
 * 测试单个生成器的性能
 */
function testGeneratorPerformance(
  name: string,
  generator: () => string,
  iterations: number = 100000,
): PerformanceResult {
  console.log(`\n🧪 测试 ${name} (${iterations.toLocaleString()} 次迭代)`);

  // 记录初始内存使用
  const initialMemory = process.memoryUsage().heapUsed;

  // 存储生成的ID用于唯一性检查
  const ids = new Set<string>();

  // 开始性能测试
  const startTime = process.hrtime.bigint();

  for (let i = 0; i < iterations; i++) {
    const id = generator();
    ids.add(id);
  }

  const endTime = process.hrtime.bigint();
  const totalTime = Number(endTime - startTime) / 1000000; // 转换为毫秒

  // 记录结束时的内存使用
  const finalMemory = process.memoryUsage().heapUsed;
  const memoryUsed = finalMemory - initialMemory;

  const result: PerformanceResult = {
    name,
    totalTime,
    idsPerSecond: Math.round((iterations / totalTime) * 1000),
    memoryUsed,
    uniqueIds: ids.size,
    totalIds: iterations,
  };

  console.log(`  ⏱️  总时间: ${totalTime.toFixed(2)}ms`);
  console.log(`  🚀 性能: ${result.idsPerSecond.toLocaleString()} IDs/秒`);
  console.log(`  💾 内存使用: ${(memoryUsed / 1024 / 1024).toFixed(2)}MB`);
  console.log(
    `  ✅ 唯一性: ${ids.size}/${iterations} (${((ids.size / iterations) * 100).toFixed(2)}%)`,
  );

  return result;
}

/**
 * 并发性能测试
 */
async function testConcurrentPerformance(
  name: string,
  generator: () => string,
  concurrency: number = 10,
  iterationsPerWorker: number = 10000,
): Promise<PerformanceResult> {
  console.log(
    `\n🔄 并发测试 ${name} (${concurrency} 个并发, 每个 ${iterationsPerWorker.toLocaleString()} 次)`,
  );

  const initialMemory = process.memoryUsage().heapUsed;
  const allIds = new Set<string>();

  const startTime = process.hrtime.bigint();

  // 创建并发任务
  const promises = Array.from({ length: concurrency }, async () => {
    const workerIds = new Set<string>();
    for (let i = 0; i < iterationsPerWorker; i++) {
      const id = generator();
      workerIds.add(id);
    }
    return workerIds;
  });

  // 等待所有任务完成
  const results = await Promise.all(promises);

  const endTime = process.hrtime.bigint();
  const totalTime = Number(endTime - startTime) / 1000000;

  // 合并所有ID
  results.forEach((workerIds) => {
    workerIds.forEach((id) => allIds.add(id));
  });

  const finalMemory = process.memoryUsage().heapUsed;
  const memoryUsed = finalMemory - initialMemory;
  const totalIterations = concurrency * iterationsPerWorker;

  const result: PerformanceResult = {
    name: `${name} (并发)`,
    totalTime,
    idsPerSecond: Math.round((totalIterations / totalTime) * 1000),
    memoryUsed,
    uniqueIds: allIds.size,
    totalIds: totalIterations,
  };

  console.log(`  ⏱️  总时间: ${totalTime.toFixed(2)}ms`);
  console.log(`  🚀 性能: ${result.idsPerSecond.toLocaleString()} IDs/秒`);
  console.log(`  💾 内存使用: ${(memoryUsed / 1024 / 1024).toFixed(2)}MB`);
  console.log(
    `  ✅ 唯一性: ${allIds.size}/${totalIterations} (${((allIds.size / totalIterations) * 100).toFixed(2)}%)`,
  );

  return result;
}

/**
 * 压力测试 - 测试极限性能
 */
function stressTest(
  name: string,
  generator: () => string,
  duration: number = 5000,
): PerformanceResult {
  console.log(`\n💪 压力测试 ${name} (${duration}ms 持续时间)`);

  const initialMemory = process.memoryUsage().heapUsed;
  const ids = new Set<string>();
  let count = 0;

  const startTime = Date.now();
  const endTime = startTime + duration;

  while (Date.now() < endTime) {
    const id = generator();
    ids.add(id);
    count++;
  }

  const actualDuration = Date.now() - startTime;
  const finalMemory = process.memoryUsage().heapUsed;
  const memoryUsed = finalMemory - initialMemory;

  const result: PerformanceResult = {
    name: `${name} (压力测试)`,
    totalTime: actualDuration,
    idsPerSecond: Math.round((count / actualDuration) * 1000),
    memoryUsed,
    uniqueIds: ids.size,
    totalIds: count,
  };

  console.log(`  ⏱️  实际时间: ${actualDuration}ms`);
  console.log(`  📊 生成总数: ${count.toLocaleString()}`);
  console.log(`  🚀 性能: ${result.idsPerSecond.toLocaleString()} IDs/秒`);
  console.log(`  💾 内存使用: ${(memoryUsed / 1024 / 1024).toFixed(2)}MB`);
  console.log(
    `  ✅ 唯一性: ${ids.size}/${count} (${((ids.size / count) * 100).toFixed(2)}%)`,
  );

  return result;
}

/**
 * 生成性能报告
 */
function generateReport(results: PerformanceResult[]): void {
  console.log('\n📊 性能测试报告');
  console.log('='.repeat(80));

  console.log('\n| 测试名称 | 性能 (IDs/秒) | 内存使用 (MB) | 唯一性 (%) |');
  console.log('|----------|---------------|---------------|------------|');

  results.forEach((result) => {
    const memoryMB = (result.memoryUsed / 1024 / 1024).toFixed(2);
    const uniqueness = ((result.uniqueIds / result.totalIds) * 100).toFixed(2);

    console.log(
      `| ${result.name.padEnd(8)} | ${result.idsPerSecond.toLocaleString().padStart(13)} | ${memoryMB.padStart(13)} | ${uniqueness.padStart(10)} |`,
    );
  });

  console.log('\n🏆 性能排行榜:');
  const sortedByPerformance = [...results].sort(
    (a, b) => b.idsPerSecond - a.idsPerSecond,
  );
  sortedByPerformance.forEach((result, index) => {
    console.log(
      `  ${index + 1}. ${result.name}: ${result.idsPerSecond.toLocaleString()} IDs/秒`,
    );
  });

  console.log('\n💾 内存使用排行榜:');
  const sortedByMemory = [...results].sort(
    (a, b) => a.memoryUsed - b.memoryUsed,
  );
  sortedByMemory.forEach((result, index) => {
    const memoryMB = (result.memoryUsed / 1024 / 1024).toFixed(2);
    console.log(`  ${index + 1}. ${result.name}: ${memoryMB}MB`);
  });
}

/**
 * 主测试函数
 */
async function runPerformanceTests(): Promise<void> {
  console.log('🚀 分布式ID生成器性能测试开始');
  console.log(`📅 测试时间: ${new Date().toLocaleString()}`);
  console.log(`💻 Node.js版本: ${process.version}`);
  console.log(`🖥️  平台: ${process.platform} ${process.arch}`);

  const results: PerformanceResult[] = [];

  // 创建生成器实例
  const snowflakeGenerator = new SnowflakeIdGenerator();
  const nanoIdGenerator = new NanoIdGenerator();
  const shortNanoIdGenerator = new NanoIdGenerator({ size: 12 });

  try {
    // 单线程性能测试
    console.log('\n🔧 单线程性能测试');
    console.log('-'.repeat(50));

    results.push(
      testGeneratorPerformance('雪花算法', () => generateUniqueId()),
    );
    results.push(testGeneratorPerformance('NanoID', () => generateShortId()));
    results.push(
      testGeneratorPerformance('订单号', () => generateSecureOrderNumber()),
    );
    results.push(
      testGeneratorPerformance('支付单号', () => generateSecurePaymentNumber()),
    );
    results.push(
      testGeneratorPerformance('雪花算法(直接)', () =>
        snowflakeGenerator.nextId(),
      ),
    );
    results.push(
      testGeneratorPerformance('NanoID(直接)', () => nanoIdGenerator.nextId()),
    );
    results.push(
      testGeneratorPerformance('短NanoID', () => shortNanoIdGenerator.nextId()),
    );

    // 并发性能测试
    console.log('\n🔄 并发性能测试');
    console.log('-'.repeat(50));

    results.push(
      await testConcurrentPerformance('雪花算法', () => generateUniqueId()),
    );
    results.push(
      await testConcurrentPerformance('NanoID', () => generateShortId()),
    );
    results.push(
      await testConcurrentPerformance('订单号', () =>
        generateSecureOrderNumber(),
      ),
    );

    // 压力测试
    console.log('\n💪 压力测试');
    console.log('-'.repeat(50));

    results.push(stressTest('雪花算法', () => generateUniqueId()));
    results.push(stressTest('NanoID', () => generateShortId()));

    // 生成报告
    generateReport(results);

    console.log('\n✅ 性能测试完成！');
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runPerformanceTests().catch(console.error);
}

export {
  runPerformanceTests,
  testGeneratorPerformance,
  testConcurrentPerformance,
  stressTest,
};

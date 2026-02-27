/**
 * 分布式ID生成器测试文件
 * 验证雪花算法、NanoID、订单号生成等功能
 */

import {
  SnowflakeIdGenerator,
  NanoIdGenerator,
  IdGeneratorFactory,
  IdValidator,
  PersistentSnowflakeIdGenerator,
  RedisSnowflakeStateStore,
  IdGeneratorMetrics,
  generateSecureorderNo,
  generateSecurePaymentNumber,
  generateSecureRefundNumber,
  generateUniqueId,
  generateShortId,
} from './common.util';

describe('分布式ID生成器测试', () => {
  describe('雪花算法测试', () => {
    let generator: SnowflakeIdGenerator;

    beforeEach(() => {
      generator = new SnowflakeIdGenerator({
        workerId: 1,
        datacenterId: 1,
        epoch: Date.now() - 1000 * 60 * 60 * 24 * 365, // 1年前
      });
    });

    test('应该生成唯一的ID', () => {
      const ids = new Set();
      const count = 10000;

      for (let i = 0; i < count; i++) {
        const id = generator.nextId();
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }

      expect(ids.size).toBe(count);
    });

    test('生成的ID应该是时间有序的', () => {
      const ids: string[] = [];

      for (let i = 0; i < 100; i++) {
        ids.push(generator.nextId());
        // 添加微小延迟确保时间戳不同
        if (i % 10 === 0) {
          const start = Date.now();
          while (Date.now() - start < 1) {
            // 等待1毫秒
          }
        }
      }

      // 验证ID是递增的
      for (let i = 1; i < ids.length; i++) {
        expect(BigInt(ids[i])).toBeGreaterThan(BigInt(ids[i - 1]));
      }
    });

    test('应该正确处理时钟回拨', () => {
      const originalNow = Date.now;
      let mockTime = Date.now();

      // Mock Date.now
      Date.now = jest.fn(() => mockTime);

      // 模拟时钟回拨
      mockTime -= 1000;

      expect(() => generator.nextId()).toThrow('时钟回拨检测');

      // 恢复原始时间函数
      Date.now = originalNow;
    });

    test('性能测试 - 应该能快速生成大量ID', () => {
      const start = Date.now();
      const count = 100000;

      for (let i = 0; i < count; i++) {
        generator.nextId();
      }

      const duration = Date.now() - start;
      const idsPerSecond = count / (duration / 1000);

      console.log(`雪花算法性能: ${idsPerSecond.toFixed(0)} IDs/秒`);
      expect(idsPerSecond).toBeGreaterThan(10000); // 至少每秒1万个ID
    });
  });

  describe('NanoID测试', () => {
    let generator: NanoIdGenerator;

    beforeEach(() => {
      generator = new NanoIdGenerator({
        alphabet:
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        size: 21,
      });
    });

    test('应该生成指定长度的ID', () => {
      const id = generator.nextId();
      expect(id.length).toBe(21);
    });

    test('应该生成唯一的ID', () => {
      const ids = new Set();
      const count = 10000;

      for (let i = 0; i < count; i++) {
        const id = generator.nextId();
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }

      expect(ids.size).toBe(count);
    });

    test('应该只包含指定字符集', () => {
      const alphabet =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const id = generator.nextId();

      for (const char of id) {
        expect(alphabet.includes(char)).toBe(true);
      }
    });
  });

  describe('工厂模式测试', () => {
    test('应该能创建雪花算法生成器', () => {
      const generator = IdGeneratorFactory.getInstance('test-snowflake', {
        type: 'snowflake',
        snowflake: {
          workerId: 1,
          datacenterId: 1,
        },
      });

      expect(generator).toBeInstanceOf(SnowflakeIdGenerator);

      const id = generator.nextId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    test('应该能创建NanoID生成器', () => {
      const generator = IdGeneratorFactory.getInstance('test-nanoid', {
        type: 'nanoid',
        nanoid: {
          size: 12,
        },
      });

      expect(generator).toBeInstanceOf(NanoIdGenerator);

      const id = generator.nextId();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(12);
    });
  });

  describe('持久化雪花算法测试', () => {
    test('应该从状态存储恢复生成进度', async () => {
      const originalNow = Date.now;
      let now = 1700000000000;
      Date.now = jest.fn(() => now);

      const store = new Map<string, any>();
      const stateStore = new RedisSnowflakeStateStore({
        get: async (key) => store.get(key) ?? null,
        set: async (key, value) => {
          store.set(key, value);
        },
      });

      const generator1 = new PersistentSnowflakeIdGenerator({
        workerId: 1,
        datacenterId: 1,
        stateStore,
        stateKey: 'test:snowflake:persist',
        metricsKey: 'test:snowflake:persist',
        persistIntervalMs: 0,
      });
      await generator1.initialize();
      const id2 = generator1.nextId();

      const generator2 = new PersistentSnowflakeIdGenerator({
        workerId: 1,
        datacenterId: 1,
        stateStore,
        stateKey: 'test:snowflake:persist',
        metricsKey: 'test:snowflake:persist',
        persistIntervalMs: 0,
      });
      await generator2.initialize();
      now += 1;
      const id3 = generator2.nextId();

      expect(BigInt(id3)).toBeGreaterThan(BigInt(id2));

      Date.now = originalNow;
    });

    test('应该在时钟回拨时保持有序', async () => {
      const originalNow = Date.now;
      let now = 1700000100000;
      Date.now = jest.fn(() => now);

      const store = new Map<string, any>();
      const stateStore = new RedisSnowflakeStateStore({
        get: async (key) => store.get(key) ?? null,
        set: async (key, value) => {
          store.set(key, value);
        },
      });

      const generator = new PersistentSnowflakeIdGenerator({
        workerId: 2,
        datacenterId: 1,
        stateStore,
        stateKey: 'test:snowflake:clock',
        metricsKey: 'test:snowflake:clock',
        persistIntervalMs: 0,
        maxBackwardMs: 0,
      });
      await generator.initialize();
      const id1 = generator.nextId();
      now -= 5000;
      const id2 = generator.nextId();

      expect(BigInt(id2)).toBeGreaterThan(BigInt(id1));

      Date.now = originalNow;
    });

    test('应该记录生成性能指标', async () => {
      IdGeneratorMetrics.clearMetrics();

      const store = new Map<string, any>();
      const stateStore = new RedisSnowflakeStateStore({
        get: async (key) => store.get(key) ?? null,
        set: async (key, value) => {
          store.set(key, value);
        },
      });

      const generator = new PersistentSnowflakeIdGenerator({
        workerId: 3,
        datacenterId: 1,
        stateStore,
        stateKey: 'test:snowflake:metrics',
        metricsKey: 'test:snowflake:metrics',
        persistIntervalMs: 0,
      });
      await generator.initialize();
      generator.nextId();
      generator.nextId();

      const metrics = IdGeneratorMetrics.getMetrics(
        'test:snowflake:metrics:nextId',
      );

      expect(metrics?.totalCount).toBeGreaterThan(0);
    });

    test('应该触发告警钩子', () => {
      const alerts: Array<{ type: string }> = [];
      IdGeneratorMetrics.clearAlerts();
      IdGeneratorMetrics.configureAlerts('test:alert', {
        maxAvgTimeMs: 0,
        minCount: 1,
      });
      IdGeneratorMetrics.onAlert((payload) => {
        alerts.push({ type: payload.type });
      });

      IdGeneratorMetrics.recordGeneration('test:alert', 10, true);

      expect(alerts.length).toBeGreaterThan(0);
      IdGeneratorMetrics.clearAlerts();
    });
  });

  describe('订单号生成测试', () => {
    test('应该生成有效的订单号', () => {
      const orderNo = generateSecureorderNo();

      expect(orderNo).toMatch(/^ORD\d+[A-Z0-9]+$/);
      expect(IdValidator.validateorderNo(orderNo)).toBe(true);
    });

    test('应该生成唯一的订单号', () => {
      const orderNos = new Set();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        const orderNo = generateSecureorderNo();
        expect(orderNos.has(orderNo)).toBe(false);
        orderNos.add(orderNo);
      }

      expect(orderNos.size).toBe(count);
    });
  });

  describe('支付单号生成测试', () => {
    test('应该生成有效的支付单号', () => {
      const paymentNumber = generateSecurePaymentNumber();

      expect(paymentNumber).toMatch(/^PAY\d+[A-Z0-9]+$/);
      expect(IdValidator.validatePaymentNumber(paymentNumber)).toBe(true);
    });

    test('应该生成唯一的支付单号', () => {
      const paymentNumbers = new Set();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        const paymentNumber = generateSecurePaymentNumber();
        expect(paymentNumbers.has(paymentNumber)).toBe(false);
        paymentNumbers.add(paymentNumber);
      }

      expect(paymentNumbers.size).toBe(count);
    });
  });

  describe('退款单号生成测试', () => {
    test('应该生成有效的退款单号', () => {
      const refundNumber = generateSecureRefundNumber();

      expect(refundNumber).toMatch(/^REF\d+[A-Z0-9]+$/);
      expect(IdValidator.validatePaymentNumber(refundNumber)).toBe(true);
    });
  });

  describe('通用ID生成测试', () => {
    test('generateUniqueId应该生成雪花算法ID', () => {
      const id = generateUniqueId();

      expect(typeof id).toBe('string');
      expect(IdValidator.validateSnowflakeId(id)).toBe(true);
    });

    test('generateShortId应该生成NanoID', () => {
      const id = generateShortId();

      expect(typeof id).toBe('string');
      expect(id.length).toBe(12);
      expect(IdValidator.validateNanoId(id)).toBe(true);
    });
  });

  describe('ID验证器测试', () => {
    test('应该正确验证雪花算法ID', () => {
      const generator = new SnowflakeIdGenerator({
        workerId: 1,
        datacenterId: 1,
      });
      const validId = generator.nextId();

      expect(IdValidator.validateSnowflakeId(validId)).toBe(true);
      expect(IdValidator.validateSnowflakeId('invalid')).toBe(false);
      expect(IdValidator.validateSnowflakeId('')).toBe(false);
    });

    test('应该正确验证NanoID', () => {
      const generator = new NanoIdGenerator({ size: 21 });
      const validId = generator.nextId();

      expect(IdValidator.validateNanoId(validId)).toBe(true);
      expect(IdValidator.validateNanoId('invalid!')).toBe(false);
      expect(IdValidator.validateNanoId('')).toBe(false);
    });

    test('应该正确验证订单号格式', () => {
      const validorderNo = generateSecureRefundNumber();

      expect(IdValidator.validateorderNo(validorderNo)).toBe(true);
      expect(IdValidator.validateorderNo('ORD123')).toBe(false);
      expect(IdValidator.validateorderNo('INVALID')).toBe(false);
    });
  });

  describe('并发测试', () => {
    test('应该在并发环境下生成唯一ID', async () => {
      const generator = new SnowflakeIdGenerator({
        workerId: 1,
        datacenterId: 1,
      });
      const promises: Promise<string>[] = [];
      const concurrency = 100;
      const idsPerPromise = 100;

      for (let i = 0; i < concurrency; i++) {
        promises.push(
          new Promise((resolve) => {
            const ids: string[] = [];
            for (let j = 0; j < idsPerPromise; j++) {
              ids.push(generator.nextId());
            }
            resolve(ids.join(','));
          }),
        );
      }

      const results = await Promise.all(promises);
      const allIds = results.flatMap((result) => result.split(','));
      const uniqueIds = new Set(allIds);

      expect(uniqueIds.size).toBe(allIds.length);
      expect(allIds.length).toBe(concurrency * idsPerPromise);
    });
  });

  describe('错误处理测试', () => {
    test('应该处理无效的工作节点ID', () => {
      expect(() => {
        new SnowflakeIdGenerator({ workerId: 1024, datacenterId: 1 });
      }).toThrow('工作节点ID必须在0-1023之间');
    });

    test('应该处理无效的数据中心ID', () => {
      expect(() => {
        new SnowflakeIdGenerator({ workerId: 1, datacenterId: 1024 });
      }).toThrow('数据中心ID必须在0-1023之间');
    });

    test('应该处理无效的NanoID配置', () => {
      expect(() => {
        new NanoIdGenerator({ size: 0 });
      }).toThrow('ID长度必须大于0');
    });
  });
});

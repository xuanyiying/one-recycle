import {
  SnowflakeIdGenerator,
  NanoIdGenerator,
  IdGeneratorFactory,
  IdValidator,
  PersistentSnowflakeIdGenerator,
  RedisSnowflakeStateStore,
  IdGeneratorMetrics,
  generateSecureOrderNumber,
  generateSecurePaymentNumber,
  generateSecureRefundNumber,
  generateUniqueId,
  generateShortId,
} from './common.util';

describe('分布式ID生成器规范测试', () => {
  describe('基础生成与验证', () => {
    test('generateUniqueId 应该生成有效雪花ID', () => {
      const id = generateUniqueId();
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^-?\d+$/);
    });

    test('NanoID 应该生成指定长度', () => {
      const generator = new NanoIdGenerator({ size: 12 });
      const id = generator.nextId();
      expect(id.length).toBe(12);
      expect(IdValidator.validateNanoId(id, 12)).toBe(true);
    });

    test('订单/支付/退款单号格式正确', () => {
      const ord = generateSecureOrderNumber();
      const pay = generateSecurePaymentNumber();
      const ref = generateSecureRefundNumber();
      expect(ord).toMatch(/^ORD-?\d+[A-Za-z0-9]+$/);
      expect(pay).toMatch(/^PAY\d+[A-Za-z0-9]+$/);
      expect(ref).toMatch(/^REF-?\d+[A-Za-z0-9]+$/);
    });
  });

  describe('工厂模式', () => {
    test('工厂创建雪花生成器', () => {
      const instance = IdGeneratorFactory.getInstance('factory-snowflake', {
        type: 'snowflake',
        snowflake: { workerId: 1, datacenterId: 1 },
      });
      expect(instance).toBeInstanceOf(SnowflakeIdGenerator);
      const id = (instance as SnowflakeIdGenerator).nextId();
      expect(id).toMatch(/^-?\d+$/);
    });
  });

  describe('持久化雪花生成器', () => {
    test('状态持久化与恢复', async () => {
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

      const gen1 = new PersistentSnowflakeIdGenerator({
        workerId: 1,
        datacenterId: 1,
        stateStore,
        stateKey: 'spec:snowflake:persist',
        metricsKey: 'spec:snowflake:persist',
        persistIntervalMs: 0,
      });
      await gen1.initialize();
      const a = gen1.nextId();
      const b = gen1.nextId();

      const gen2 = new PersistentSnowflakeIdGenerator({
        workerId: 1,
        datacenterId: 1,
        stateStore,
        stateKey: 'spec:snowflake:persist',
        metricsKey: 'spec:snowflake:persist',
        persistIntervalMs: 0,
      });
      await gen2.initialize();
      now += 1;
      const c = gen2.nextId();
      expect(BigInt(c)).toBeGreaterThan(BigInt(b));

      Date.now = originalNow;
    });

    test('时钟回拨下仍保持递增', async () => {
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

      const gen = new PersistentSnowflakeIdGenerator({
        workerId: 2,
        datacenterId: 1,
        stateStore,
        stateKey: 'spec:snowflake:clock',
        metricsKey: 'spec:snowflake:clock',
        persistIntervalMs: 0,
        maxBackwardMs: 0,
      });
      await gen.initialize();
      const id1 = gen.nextId();
      now -= 5000;
      const id2 = gen.nextId();
      expect(BigInt(id2)).toBeGreaterThan(BigInt(id1));

      Date.now = originalNow;
    });
  });

  describe('监控与告警', () => {
    test('记录性能指标并触发告警', () => {
      IdGeneratorMetrics.clearMetrics();
      IdGeneratorMetrics.clearAlerts();
      const alerts: Array<{ type: string }> = [];
      IdGeneratorMetrics.configureAlerts('spec:alert', {
        maxAvgTimeMs: 0,
        minCount: 1,
      });
      IdGeneratorMetrics.onAlert((payload) => {
        alerts.push({ type: payload.type });
      });
      IdGeneratorMetrics.recordGeneration('spec:alert', 10, true);
      const metrics = IdGeneratorMetrics.getMetrics('spec:alert');
      expect(metrics?.totalCount).toBeGreaterThan(0);
      expect(alerts.length).toBeGreaterThan(0);
      IdGeneratorMetrics.clearAlerts();
    });
  });
});

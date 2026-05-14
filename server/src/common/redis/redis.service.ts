import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Redis服务
 * 提供缓存、会话管理、分布式锁等功能
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private readonly isDevelopment: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isDevelopment =
      this.configService.get<string>('NODE_ENV') === 'development';
  }

  async onModuleInit() {
    try {
      const host = this.configService.get<string>('REDIS_HOST', 'localhost');
      const port = this.configService.get<number>('REDIS_PORT', 6379);
      const password = this.configService.get<string>('REDIS_PASSWORD');
      const db = this.configService.get<number>('REDIS_DB', 0);

      // Build Redis options, only including password if it's defined
      const redisOptions: any = {
        host,
        port,
        db,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      };

      // Only add password if it's defined
      if (password) {
        redisOptions.password = password;
      }

      this.client = new Redis(redisOptions);

      this.client.on('error', (err) => {
        this.logger.error(`Redis error: ${err.message}`);
      });

      this.client.on('connect', () => {
        this.logger.log('Successfully connected to Redis');
      });

      // 测试连接
      await this.client.ping();
    } catch (error) {
      this.logger.error(`Failed to initialize Redis: ${error as Error}`);
      if (!this.isDevelopment) {
        throw error;
      }
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    }
  }

  /**
   * 获取Redis客户端实例
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * 设置键值对
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.client.setex(key, ttl, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  /**
   * 获取值
   */
  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value as any;
    }
  }

  /**
   * 删除键
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  /**
   * 获取剩余过期时间
   */
  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  /**
   * Ping Redis 服务器（用于健康检查）
   */
  async ping(): Promise<string> {
    return await this.client.ping();
  }

  /**
   * 批量获取
   */
  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    const values = await this.client.mget(...keys);
    return values.map((value) => {
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value as any;
      }
    });
  }

  /**
   * 批量设置
   */
  async mset(data: Record<string, any>): Promise<void> {
    const pairs: string[] = [];
    for (const [key, value] of Object.entries(data)) {
      pairs.push(key, JSON.stringify(value));
    }
    await this.client.mset(...pairs);
  }

  /**
   * 自增
   */
  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  /**
   * 自减
   */
  async decr(key: string): Promise<number> {
    return await this.client.decr(key);
  }

  /**
   * 增加指定值
   */
  async incrby(key: string, increment: number): Promise<number> {
    return await this.client.incrby(key, increment);
  }

  /**
   * Hash操作 - 设置字段
   */
  async hset(key: string, field: string, value: any): Promise<void> {
    await this.client.hset(key, field, JSON.stringify(value));
  }

  /**
   * Hash操作 - 获取字段
   */
  async hget<T = any>(key: string, field: string): Promise<T | null> {
    const value = await this.client.hget(key, field);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value as any;
    }
  }

  /**
   * Hash操作 - 获取所有字段
   */
  async hgetall<T = any>(key: string): Promise<Record<string, T>> {
    const data = await this.client.hgetall(key);
    const result: Record<string, T> = {};
    for (const [field, value] of Object.entries(data)) {
      try {
        result[field] = JSON.parse(value);
      } catch {
        result[field] = value as any;
      }
    }
    return result;
  }

  /**
   * Hash操作 - 删除字段
   */
  async hdel(key: string, ...fields: string[]): Promise<void> {
    await this.client.hdel(key, ...fields);
  }

  /**
   * List操作 - 左侧推入
   */
  async lpush(key: string, ...values: any[]): Promise<number> {
    const serialized = values.map((v) => JSON.stringify(v));
    return await this.client.lpush(key, ...serialized);
  }

  /**
   * List操作 - 右侧推入
   */
  async rpush(key: string, ...values: any[]): Promise<number> {
    const serialized = values.map((v) => JSON.stringify(v));
    return await this.client.rpush(key, ...serialized);
  }

  /**
   * List操作 - 左侧弹出
   */
  async lpop<T = any>(key: string): Promise<T | null> {
    const value = await this.client.lpop(key);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value as any;
    }
  }

  /**
   * List操作 - 右侧弹出
   */
  async rpop<T = any>(key: string): Promise<T | null> {
    const value = await this.client.rpop(key);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value as any;
    }
  }

  /**
   * List操作 - 获取范围
   */
  async lrange<T = any>(
    key: string,
    start: number,
    stop: number,
  ): Promise<T[]> {
    const values = await this.client.lrange(key, start, stop);
    return values.map((value) => {
      try {
        return JSON.parse(value);
      } catch {
        return value as any;
      }
    });
  }

  /**
   * Set操作 - 添加成员
   */
  async sadd(key: string, ...members: any[]): Promise<number> {
    const serialized = members.map((m) => JSON.stringify(m));
    return await this.client.sadd(key, ...serialized);
  }

  /**
   * Set操作 - 获取所有成员
   */
  async smembers<T = any>(key: string): Promise<T[]> {
    const values = await this.client.smembers(key);
    return values.map((value) => {
      try {
        return JSON.parse(value);
      } catch {
        return value as any;
      }
    });
  }

  /**
   * Set操作 - 检查成员是否存在
   */
  async sismember(key: string, member: any): Promise<boolean> {
    const serialized = JSON.stringify(member);
    const result = await this.client.sismember(key, serialized);
    return result === 1;
  }

  /**
   * Set操作 - 移除成员
   */
  async srem(key: string, ...members: any[]): Promise<number> {
    const serialized = members.map((m) => JSON.stringify(m));
    return await this.client.srem(key, ...serialized);
  }

  /**
   * Sorted Set操作 - 添加成员
   */
  async zadd(key: string, score: number, member: any): Promise<number> {
    const serialized = JSON.stringify(member);
    return await this.client.zadd(key, score, serialized);
  }

  /**
   * Sorted Set操作 - 获取范围
   */
  async zrange<T = any>(
    key: string,
    start: number,
    stop: number,
  ): Promise<T[]> {
    const values = await this.client.zrange(key, start, stop);
    return values.map((value) => {
      try {
        return JSON.parse(value);
      } catch {
        return value as any;
      }
    });
  }

  /**
   * 分布式锁 - 获取锁
   */
  async acquireLock(key: string, ttl: number = 30): Promise<string | null> {
    const lockKey = `lock:${key}`;
    const lockValue = `${Date.now()}-${Math.random()}`;
    const result = await this.client.set(lockKey, lockValue, 'EX', ttl, 'NX');
    return result === 'OK' ? lockValue : null;
  }

  /**
   * 分布式锁 - 释放锁
   */
  async releaseLock(key: string, lockValue: string): Promise<boolean> {
    const lockKey = `lock:${key}`;
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await this.client.eval(script, 1, lockKey, lockValue);
    return result === 1;
  }

  /**
   * 分布式锁 - 带自动释放的执行
   */
  async withLock<T>(
    key: string,
    callback: () => Promise<T>,
    ttl: number = 30,
  ): Promise<T> {
    const lockValue = await this.acquireLock(key, ttl);
    if (!lockValue) {
      throw new Error(`Failed to acquire lock: ${key}`);
    }

    try {
      return await callback();
    } finally {
      await this.releaseLock(key, lockValue);
    }
  }

  /**
   * 发布消息
   */
  async publish(channel: string, message: any): Promise<number> {
    const serialized = JSON.stringify(message);
    return await this.client.publish(channel, serialized);
  }

  /**
   * 订阅频道
   */
  async subscribe(
    channel: string,
    callback: (message: any) => void,
  ): Promise<void> {
    const subscriber = this.client.duplicate();
    await subscriber.subscribe(channel);
    subscriber.on('message', (ch, msg) => {
      if (ch === channel) {
        try {
          const parsed = JSON.parse(msg);
          callback(parsed);
        } catch {
          callback(msg);
        }
      }
    });
  }

  /**
   * 清空所有键（谨慎使用）
   */
  async flushall(): Promise<void> {
    if (this.isDevelopment) {
      await this.client.flushall();
      this.logger.warn('Redis flushed all keys');
    } else {
      throw new Error('Cannot flush Redis in production');
    }
  }

  /**
   * 获取键的数量
   */
  async dbsize(): Promise<number> {
    return await this.client.dbsize();
  }

  /**
   * 扫描键
   */
  async scan(pattern: string, count: number = 100): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';

    do {
      const [nextCursor, matchedKeys] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        count,
      );
      cursor = nextCursor;
      keys.push(...matchedKeys);
    } while (cursor !== '0');

    return keys;
  }
}

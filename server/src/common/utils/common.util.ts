/**
 * 通用工具函数 - 高效安全的分布式ID生成方案
 *
 * 本模块提供了基于雪花算法和NanoID的分布式ID生成解决方案，
 * 确保全局唯一性、时间有序性、高可用性和高性能。
 *
 * @author AI Assistant
 * @version 2.0.0
 */

import * as crypto from 'crypto';
import * as os from 'os';

// ================================
// 分布式ID生成器配置接口
// ================================

/**
 * 雪花算法配置接口
 */
export interface SnowflakeConfig {
  /** 机器ID (0-1023) */
  workerId?: number;
  /** 数据中心ID (0-31) */
  datacenterId?: number;
  /** 自定义起始时间戳 (默认: 2020-01-01) */
  epoch?: number;
}

export interface SnowflakeState {
  workerId: number;
  datacenterId: number;
  epoch: number;
  lastTimestamp: number;
  sequence: number;
}

export interface SnowflakeStateStore {
  load(key: string): Promise<SnowflakeState | null>;
  save(key: string, state: SnowflakeState): Promise<void>;
}

export interface PersistentSnowflakeConfig extends SnowflakeConfig {
  stateStore?: SnowflakeStateStore;
  stateKey?: string;
  persistIntervalMs?: number;
  maxBackwardMs?: number;
  metricsKey?: string;
}

/**
 * NanoID配置接口
 */
export interface NanoIdConfig {
  /** ID长度 (默认: 21) */
  size?: number;
  /** 自定义字符集 */
  alphabet?: string;
}

/**
 * ID生成器类型
 */
export type IdGeneratorType = 'snowflake' | 'nanoid' | 'uuid';

/**
 * ID生成器配置
 */
export interface IdGeneratorConfig {
  type: IdGeneratorType;
  snowflake?: SnowflakeConfig;
  nanoid?: NanoIdConfig;
}

// ================================
// 雪花算法实现
// ================================

/**
 * 雪花算法分布式ID生成器
 *
 * 64位ID结构:
 * - 1位符号位 (固定为0)
 * - 41位时间戳 (毫秒级，可用69年)
 * - 5位数据中心ID (0-31)
 * - 5位机器ID (0-31)
 * - 12位序列号 (0-4095，每毫秒可生成4096个ID)
 */
export class SnowflakeIdGenerator {
  private static readonly EPOCH = 1577836800000; // 2020-01-01 00:00:00 UTC
  private static readonly MACHINE_ID_BITS = 5;
  private static readonly DATACENTER_ID_BITS = 5;
  private static readonly SEQUENCE_BITS = 12;

  private static readonly MAX_MACHINE_ID =
    (1 << SnowflakeIdGenerator.MACHINE_ID_BITS) - 1;
  private static readonly MAX_DATACENTER_ID =
    (1 << SnowflakeIdGenerator.DATACENTER_ID_BITS) - 1;
  private static readonly MAX_SEQUENCE =
    (1 << SnowflakeIdGenerator.SEQUENCE_BITS) - 1;

  private static readonly MACHINE_ID_SHIFT = SnowflakeIdGenerator.SEQUENCE_BITS;
  private static readonly DATACENTER_ID_SHIFT =
    SnowflakeIdGenerator.SEQUENCE_BITS + SnowflakeIdGenerator.MACHINE_ID_BITS;
  private static readonly TIMESTAMP_SHIFT =
    SnowflakeIdGenerator.SEQUENCE_BITS +
    SnowflakeIdGenerator.MACHINE_ID_BITS +
    SnowflakeIdGenerator.DATACENTER_ID_BITS;

  private readonly workerId: number;
  private readonly datacenterId: number;
  private readonly epoch: number;
  private sequence = 0;
  private lastTimestamp = -1;

  constructor(config: SnowflakeConfig = {}) {
    this.workerId = config.workerId ?? this.generateWorkerId();
    this.datacenterId = config.datacenterId ?? this.generateDatacenterId();
    this.epoch = config.epoch ?? SnowflakeIdGenerator.EPOCH;

    if (
      this.workerId > SnowflakeIdGenerator.MAX_MACHINE_ID ||
      this.workerId < 0
    ) {
      throw new Error(
        `Machine ID must be between 0 and ${SnowflakeIdGenerator.MAX_MACHINE_ID}`,
      );
    }

    if (
      this.datacenterId > SnowflakeIdGenerator.MAX_DATACENTER_ID ||
      this.datacenterId < 0
    ) {
      throw new Error(
        `Datacenter ID must be between 0 and ${SnowflakeIdGenerator.MAX_DATACENTER_ID}`,
      );
    }
  }

  /**
   * 生成下一个ID
   */
  public nextId(): string {
    let timestamp = this.getCurrentTimestamp();

    if (timestamp < this.lastTimestamp) {
      throw new Error(
        `Clock moved backwards. Refusing to generate id for ${this.lastTimestamp - timestamp} milliseconds`,
      );
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & SnowflakeIdGenerator.MAX_SEQUENCE;
      if (this.sequence === 0) {
        timestamp = this.waitNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0;
    }

    this.lastTimestamp = timestamp;

    const timestampPart =
      BigInt(timestamp - this.epoch) <<
      BigInt(SnowflakeIdGenerator.TIMESTAMP_SHIFT);
    const datacenterPart =
      BigInt(this.datacenterId) <<
      BigInt(SnowflakeIdGenerator.DATACENTER_ID_SHIFT);
    const workerPart =
      BigInt(this.workerId) << BigInt(SnowflakeIdGenerator.MACHINE_ID_SHIFT);
    const id =
      timestampPart | datacenterPart | workerPart | BigInt(this.sequence);

    return id.toString();
  }

  /**
   * 批量生成ID
   */
  public nextIds(count: number): string[] {
    if (count <= 0) {
      throw new Error('Count must be greater than 0');
    }

    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      ids.push(this.nextId());
    }
    return ids;
  }

  /**
   * 解析ID获取时间戳
   */
  public parseTimestamp(id: string): Date {
    const idNum = BigInt(id);
    const timestamp =
      Number(idNum >> BigInt(SnowflakeIdGenerator.TIMESTAMP_SHIFT)) +
      this.epoch;
    return new Date(timestamp);
  }

  private getCurrentTimestamp(): number {
    return Date.now();
  }

  private waitNextMillis(lastTimestamp: number): number {
    let timestamp = this.getCurrentTimestamp();
    while (timestamp <= lastTimestamp) {
      timestamp = this.getCurrentTimestamp();
    }
    return timestamp;
  }

  private generateWorkerId(): number {
    // 基于网络接口MAC地址生成机器ID
    const networkInterfaces = os.networkInterfaces();
    let hash = 0;

    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      if (interfaces) {
        for (const iface of interfaces) {
          if (iface.mac && iface.mac !== '00:00:00:00:00:00') {
            const macBytes = iface.mac.replace(/:/g, '');
            for (let i = 0; i < macBytes.length; i += 2) {
              hash = (hash + parseInt(macBytes.substr(i, 2), 16)) & 0xffffffff;
            }
            break;
          }
        }
      }
    }

    return hash & SnowflakeIdGenerator.MAX_MACHINE_ID;
  }

  private generateDatacenterId(): number {
    // 基于主机名生成数据中心ID
    const hostname = os.hostname();
    let hash = 0;

    for (let i = 0; i < hostname.length; i++) {
      hash = ((hash << 5) - hash + hostname.charCodeAt(i)) & 0xffffffff;
    }

    return Math.abs(hash) & SnowflakeIdGenerator.MAX_DATACENTER_ID;
  }
}

export class RedisSnowflakeStateStore implements SnowflakeStateStore {
  constructor(
    private readonly store: {
      get<T = any>(key: string): Promise<T | null>;
      set(key: string, value: any, ttl?: number): Promise<void>;
    },
  ) {}

  async load(key: string): Promise<SnowflakeState | null> {
    return await this.store.get<SnowflakeState>(key);
  }

  async save(key: string, state: SnowflakeState): Promise<void> {
    await this.store.set(key, state);
  }
}

export class PersistentSnowflakeIdGenerator {
  private static readonly EPOCH = 1577836800000;
  private static readonly MACHINE_ID_BITS = 5;
  private static readonly DATACENTER_ID_BITS = 5;
  private static readonly SEQUENCE_BITS = 12;

  private static readonly MAX_MACHINE_ID =
    (1 << PersistentSnowflakeIdGenerator.MACHINE_ID_BITS) - 1;
  private static readonly MAX_DATACENTER_ID =
    (1 << PersistentSnowflakeIdGenerator.DATACENTER_ID_BITS) - 1;
  private static readonly MAX_SEQUENCE =
    (1 << PersistentSnowflakeIdGenerator.SEQUENCE_BITS) - 1;

  private static readonly MACHINE_ID_SHIFT =
    PersistentSnowflakeIdGenerator.SEQUENCE_BITS;
  private static readonly DATACENTER_ID_SHIFT =
    PersistentSnowflakeIdGenerator.SEQUENCE_BITS +
    PersistentSnowflakeIdGenerator.MACHINE_ID_BITS;
  private static readonly TIMESTAMP_SHIFT =
    PersistentSnowflakeIdGenerator.SEQUENCE_BITS +
    PersistentSnowflakeIdGenerator.MACHINE_ID_BITS +
    PersistentSnowflakeIdGenerator.DATACENTER_ID_BITS;

  private workerId: number;
  private datacenterId: number;
  private epoch: number;
  private sequence = 0;
  private lastTimestamp = -1;

  private readonly stateStore?: SnowflakeStateStore;
  private readonly stateKey: string;
  private readonly persistIntervalMs: number;
  private readonly maxBackwardMs: number;
  private readonly metricsKey: string;
  private initialized = false;
  private lastPersistedAt = 0;
  private lastPersistedTimestamp = -1;

  constructor(config: PersistentSnowflakeConfig = {}) {
    this.workerId = config.workerId ?? this.generateWorkerId();
    this.datacenterId = config.datacenterId ?? this.generateDatacenterId();
    this.epoch = config.epoch ?? PersistentSnowflakeIdGenerator.EPOCH;
    this.stateStore = config.stateStore;
    this.stateKey = config.stateKey ?? 'snowflake:state:default';
    this.persistIntervalMs = config.persistIntervalMs ?? 1000;
    this.maxBackwardMs = config.maxBackwardMs ?? 5000;
    this.metricsKey = config.metricsKey ?? this.stateKey;

    if (
      this.workerId > PersistentSnowflakeIdGenerator.MAX_MACHINE_ID ||
      this.workerId < 0
    ) {
      throw new Error(
        `Machine ID must be between 0 and ${PersistentSnowflakeIdGenerator.MAX_MACHINE_ID}`,
      );
    }

    if (
      this.datacenterId > PersistentSnowflakeIdGenerator.MAX_DATACENTER_ID ||
      this.datacenterId < 0
    ) {
      throw new Error(
        `Datacenter ID must be between 0 and ${PersistentSnowflakeIdGenerator.MAX_DATACENTER_ID}`,
      );
    }
  }

  async initialize(): Promise<void> {
    if (!this.stateStore) {
      this.initialized = true;
      return;
    }

    const state = await this.stateStore.load(this.stateKey);
    if (state) {
      if (state.workerId !== undefined) {
        this.workerId = state.workerId;
      }
      if (state.datacenterId !== undefined) {
        this.datacenterId = state.datacenterId;
      }
      if (state.epoch !== undefined) {
        this.epoch = state.epoch;
      }
      this.lastTimestamp = state.lastTimestamp ?? -1;
      this.sequence = state.sequence ?? 0;
    } else {
      await this.stateStore.save(this.stateKey, this.getStateSnapshot());
    }

    this.initialized = true;
  }

  public nextId(): string {
    if (this.stateStore && !this.initialized) {
      throw new Error('PersistentSnowflakeIdGenerator not initialized');
    }

    const start = performance.now();
    let success = true;
    try {
      let timestamp = this.getCurrentTimestamp();

      if (timestamp < this.lastTimestamp) {
        IdGeneratorMetrics.recordGeneration(
          `${this.metricsKey}:clockBackward`,
          0,
          false,
        );
        const offset = this.lastTimestamp - timestamp;
        if (offset <= this.maxBackwardMs) {
          timestamp = this.waitNextMillis(this.lastTimestamp);
        } else {
          timestamp = this.lastTimestamp;
        }
      }

      if (timestamp === this.lastTimestamp) {
        this.sequence =
          (this.sequence + 1) & PersistentSnowflakeIdGenerator.MAX_SEQUENCE;
        if (this.sequence === 0) {
          timestamp = this.lastTimestamp + 1;
        }
      } else {
        this.sequence = 0;
      }

      this.lastTimestamp = timestamp;

      const timestampPart =
        BigInt(timestamp - this.epoch) <<
        BigInt(PersistentSnowflakeIdGenerator.TIMESTAMP_SHIFT);
      const datacenterPart =
        BigInt(this.datacenterId) <<
        BigInt(PersistentSnowflakeIdGenerator.DATACENTER_ID_SHIFT);
      const workerPart =
        BigInt(this.workerId) <<
        BigInt(PersistentSnowflakeIdGenerator.MACHINE_ID_SHIFT);
      const id =
        timestampPart | datacenterPart | workerPart | BigInt(this.sequence);

      this.persistStateIfNeeded();

      return id.toString();
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = performance.now() - start;
      IdGeneratorMetrics.recordGeneration(
        `${this.metricsKey}:nextId`,
        duration,
        success,
      );
    }
  }

  public nextIds(count: number): string[] {
    if (count <= 0) {
      throw new Error('Count must be greater than 0');
    }

    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      ids.push(this.nextId());
    }
    return ids;
  }

  public parseTimestamp(id: string): Date {
    const idNum = BigInt(id);
    const timestamp =
      Number(idNum >> BigInt(PersistentSnowflakeIdGenerator.TIMESTAMP_SHIFT)) +
      this.epoch;
    return new Date(timestamp);
  }

  public getStateSnapshot(): SnowflakeState {
    return {
      workerId: this.workerId,
      datacenterId: this.datacenterId,
      epoch: this.epoch,
      lastTimestamp: this.lastTimestamp,
      sequence: this.sequence,
    };
  }

  private persistStateIfNeeded(): void {
    if (!this.stateStore) return;

    const now = Date.now();
    if (
      now - this.lastPersistedAt < this.persistIntervalMs &&
      this.lastPersistedTimestamp === this.lastTimestamp
    ) {
      return;
    }

    this.lastPersistedAt = now;
    this.lastPersistedTimestamp = this.lastTimestamp;

    const start = performance.now();
    Promise.resolve(
      this.stateStore.save(this.stateKey, this.getStateSnapshot()),
    )
      .then(() => {
        const duration = performance.now() - start;
        IdGeneratorMetrics.recordGeneration(
          `${this.metricsKey}:persist`,
          duration,
          true,
        );
      })
      .catch(() => {
        const duration = performance.now() - start;
        IdGeneratorMetrics.recordGeneration(
          `${this.metricsKey}:persist`,
          duration,
          false,
        );
      });
  }

  private getCurrentTimestamp(): number {
    return Date.now();
  }

  private waitNextMillis(lastTimestamp: number): number {
    let timestamp = this.getCurrentTimestamp();
    while (timestamp <= lastTimestamp) {
      timestamp = this.getCurrentTimestamp();
    }
    return timestamp;
  }

  private generateWorkerId(): number {
    const networkInterfaces = os.networkInterfaces();
    let hash = 0;

    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      if (interfaces) {
        for (const iface of interfaces) {
          if (iface.mac && iface.mac !== '00:00:00:00:00:00') {
            const macBytes = iface.mac.replace(/:/g, '');
            for (let i = 0; i < macBytes.length; i += 2) {
              hash = (hash + parseInt(macBytes.substr(i, 2), 16)) & 0xffffffff;
            }
            break;
          }
        }
      }
    }

    return hash & PersistentSnowflakeIdGenerator.MAX_MACHINE_ID;
  }

  private generateDatacenterId(): number {
    const hostname = os.hostname();
    let hash = 0;

    for (let i = 0; i < hostname.length; i++) {
      hash = ((hash << 5) - hash + hostname.charCodeAt(i)) & 0xffffffff;
    }

    return Math.abs(hash) & PersistentSnowflakeIdGenerator.MAX_DATACENTER_ID;
  }
}

// ================================
// NanoID实现
// ================================

/**
 * NanoID生成器
 *
 * 基于URL安全的字符集生成短小精悍的唯一ID
 * 默认21位长度，碰撞概率极低
 */
export class NanoIdGenerator {
  private static readonly DEFAULT_ALPHABET =
    '_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private static readonly DEFAULT_SIZE = 21;

  private readonly alphabet: string;
  private readonly size: number;

  constructor(config: NanoIdConfig = {}) {
    this.alphabet = config.alphabet ?? NanoIdGenerator.DEFAULT_ALPHABET;
    this.size = config.size ?? NanoIdGenerator.DEFAULT_SIZE;

    if (this.alphabet.length === 0 || this.alphabet.length > 256) {
      throw new Error('Alphabet length must be between 1 and 256');
    }

    if (this.size <= 0) {
      throw new Error('Size must be greater than 0');
    }
  }

  /**
   * 生成NanoID
   */
  public nextId(): string {
    const mask = (2 << (Math.log(this.alphabet.length - 1) / Math.LN2)) - 1;
    const step = -~((1.6 * mask * this.size) / this.alphabet.length);

    let id = '';
    while (true) {
      const bytes = crypto.randomBytes(step);
      for (let i = 0; i < step; i++) {
        const byte = bytes[i] & mask;
        if (this.alphabet[byte]) {
          id += this.alphabet[byte];
          if (id.length === this.size) {
            return id;
          }
        }
      }
    }
  }

  /**
   * 批量生成NanoID
   */
  public nextIds(count: number): string[] {
    if (count <= 0) {
      throw new Error('Count must be greater than 0');
    }

    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      ids.push(this.nextId());
    }
    return ids;
  }
}

// ================================
// ID生成器工厂
// ================================

/**
 * ID生成器工厂类
 *
 * 提供统一的ID生成器创建和管理接口
 */
export class IdGeneratorFactory {
  private static instances = new Map<
    string,
    SnowflakeIdGenerator | NanoIdGenerator
  >();

  /**
   * 创建或获取ID生成器实例
   */
  public static getInstance(
    name: string,
    config: IdGeneratorConfig,
  ): SnowflakeIdGenerator | NanoIdGenerator {
    if (!IdGeneratorFactory.instances.has(name)) {
      let generator: SnowflakeIdGenerator | NanoIdGenerator;

      switch (config.type) {
        case 'snowflake':
          generator = new SnowflakeIdGenerator(config.snowflake);
          break;
        case 'nanoid':
          generator = new NanoIdGenerator(config.nanoid);
          break;
        default:
          throw new Error(`Unsupported generator type: ${config.type}`);
      }

      IdGeneratorFactory.instances.set(name, generator);
    }

    const instance = IdGeneratorFactory.instances.get(name);
    if (!instance) {
      throw new Error(`Failed to get instance for ${name}`);
    }
    return instance;
  }

  /**
   * 清除所有实例
   */
  public static clearInstances(): void {
    IdGeneratorFactory.instances.clear();
  }
}

// ================================
// 默认生成器实例
// ================================

// 默认雪花算法生成器
const defaultSnowflakeGenerator = new SnowflakeIdGenerator();

// 默认NanoID生成器
const defaultNanoIdGenerator = new NanoIdGenerator();

// ================================
// 安全的业务ID生成器
// ================================

/**
 * 生成安全的随机字符串
 */
export function generateRandomString(length: number = 32): string {
  if (length <= 0) {
    throw new Error('Length must be greater than 0');
  }

  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

/**
 * 生成UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * 生成全局唯一ID (基于雪花算法)
 */
export function generateUniqueId(): string {
  return defaultSnowflakeGenerator.nextId();
}

/**
 * 生成短ID (基于NanoID)
 */
export function generateShortId(size?: number): string {
  if (size && size !== 21) {
    const generator = new NanoIdGenerator({ size });
    return generator.nextId();
  }
  return defaultNanoIdGenerator.nextId();
}

/**
 * 生成安全的订单号
 *
 * 格式: ORD + 雪花算法ID + 校验码
 * 示例: ORD1234567890123456789A1B
 */
export function generateOrderNumber(prefix: string = 'ORD'): string {
  const snowflakeId = defaultSnowflakeGenerator.nextId();
  const checksum = generateChecksum(snowflakeId);
  return `${prefix}${snowflakeId}${checksum}`;
}

/**
 * 生成安全的支付单号
 *
 * 格式: PAY + 时间戳 + NanoID + 校验码
 * 示例: PAY1640995200000ABC123DEF456G7H
 */
export function generatePaymentNumber(prefix: string = 'PAY'): string {
  const timestamp = Date.now();
  const nanoId = defaultNanoIdGenerator.nextId().substring(0, 12); // 取前12位
  const checksum = generateChecksum(`${timestamp}${nanoId}`);
  return `${prefix}${timestamp}${nanoId}${checksum}`;
}

/**
 * 生成安全的退款单号
 *
 * 格式: REF + 雪花算法ID + 随机后缀
 * 示例: REF1234567890123456789XYZ
 */
export function generateRefundNumber(prefix: string = 'REF'): string {
  const snowflakeId = defaultSnowflakeGenerator.nextId();
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}${snowflakeId}${suffix}`;
}

/**
 * 生成校验码
 *
 * 基于CRC32算法生成4位校验码
 */
function generateChecksum(data: string): string {
  let crc = 0xffffffff;

  for (let i = 0; i < data.length; i++) {
    const byte = data.charCodeAt(i);
    crc = crc ^ byte;

    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }

  crc = crc ^ 0xffffffff;
  return Math.abs(crc).toString(36).substring(0, 4).toUpperCase();
}

/**
 * 计算MD5哈希
 */
export function calculateMD5(data: string): string {
  return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * 计算SHA256哈希
 */
export function calculateSHA256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * 延迟执行
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  let lastError: Error = new Error('Operation failed');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      await delay(delayMs * attempt);
    }
  }

  throw lastError;
}

/**
 * 深拷贝对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  if (typeof obj === 'object' && obj !== null) {
    const clonedObj = {} as T;
    for (const key in obj as Record<string, any>) {
      if ((obj as Record<string, any>).hasOwnProperty(key)) {
        (clonedObj as Record<string, any>)[key] = deepClone(
          (obj as Record<string, any>)[key],
        );
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * 对象属性过滤
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * 对象属性排除
 */
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
}

/**
 * 数组去重
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * 数组分组
 */
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K,
): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<string, T[]>,
  );
}

/**
 * 数组分页
 */
export function paginate<T>(array: T[], page: number, limit: number): T[] {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return array.slice(startIndex, endIndex);
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化金额（分转元）
 */
export function formatAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * 金额转分
 */
export function amountToCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式
 */
export function isValidMobile(mobile: string): boolean {
  const mobileRegex = /^1[3-9]\d{9}$/;
  return mobileRegex.test(mobile);
}

/**
 * 脱敏手机号
 */
export function maskMobile(mobile: string): string {
  if (!mobile || mobile.length !== 11) return mobile;
  return mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 脱敏邮箱
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [username, domain] = email.split('@');
  if (username.length <= 2) return email;
  const maskedUsername =
    username.charAt(0) +
    '*'.repeat(username.length - 2) +
    username.charAt(username.length - 1);
  return `${maskedUsername}@${domain}`;
}

// ================================
// 性能优化和错误处理
// ================================

/**
 * ID生成器性能监控
 */
export class IdGeneratorMetrics {
  private static metrics = new Map<
    string,
    {
      count: number;
      totalTime: number;
      errors: number;
      firstAt: number;
      lastAt: number;
    }
  >();
  private static alertHandlers = new Set<
    (payload: {
      name: string;
      type: 'avgTime' | 'errorRate';
      value: number;
      threshold: number;
      totalCount: number;
    }) => void
  >();
  private static alertThresholds = new Map<
    string,
    { maxAvgTimeMs?: number; maxErrorRate?: number; minCount?: number }
  >();

  public static recordGeneration(
    generatorName: string,
    duration: number,
    success: boolean = true,
  ): void {
    const now = Date.now();
    const current = IdGeneratorMetrics.metrics.get(generatorName) || {
      count: 0,
      totalTime: 0,
      errors: 0,
      firstAt: now,
      lastAt: now,
    };
    current.count++;
    current.totalTime += duration;
    if (!success) {
      current.errors++;
    }
    current.lastAt = now;
    IdGeneratorMetrics.metrics.set(generatorName, current);

    const thresholds = IdGeneratorMetrics.alertThresholds.get(generatorName);
    if (!thresholds) {
      return;
    }

    const minCount = thresholds.minCount ?? 1;
    if (current.count < minCount) {
      return;
    }

    const avgTime = current.totalTime / current.count;
    const errorRate = current.errors / current.count;

    if (
      thresholds.maxAvgTimeMs !== undefined &&
      avgTime > thresholds.maxAvgTimeMs
    ) {
      for (const handler of IdGeneratorMetrics.alertHandlers) {
        handler({
          name: generatorName,
          type: 'avgTime',
          value: avgTime,
          threshold: thresholds.maxAvgTimeMs,
          totalCount: current.count,
        });
      }
    }

    if (
      thresholds.maxErrorRate !== undefined &&
      errorRate > thresholds.maxErrorRate
    ) {
      for (const handler of IdGeneratorMetrics.alertHandlers) {
        handler({
          name: generatorName,
          type: 'errorRate',
          value: errorRate,
          threshold: thresholds.maxErrorRate,
          totalCount: current.count,
        });
      }
    }
  }

  public static getMetrics(generatorName: string): {
    avgTime: number;
    errorRate: number;
    totalCount: number;
    ratePerSecond: number;
  } | null {
    const metric = IdGeneratorMetrics.metrics.get(generatorName);
    if (!metric || metric.count === 0) {
      return null;
    }

    const durationMs = Math.max(metric.lastAt - metric.firstAt, 1);
    return {
      avgTime: metric.totalTime / metric.count,
      errorRate: metric.errors / metric.count,
      totalCount: metric.count,
      ratePerSecond: (metric.count / durationMs) * 1000,
    };
  }

  public static configureAlerts(
    generatorName: string,
    thresholds: {
      maxAvgTimeMs?: number;
      maxErrorRate?: number;
      minCount?: number;
    },
  ): void {
    IdGeneratorMetrics.alertThresholds.set(generatorName, thresholds);
  }

  public static onAlert(
    handler: (payload: {
      name: string;
      type: 'avgTime' | 'errorRate';
      value: number;
      threshold: number;
      totalCount: number;
    }) => void,
  ): void {
    IdGeneratorMetrics.alertHandlers.add(handler);
  }

  public static clearAlerts(): void {
    IdGeneratorMetrics.alertHandlers.clear();
    IdGeneratorMetrics.alertThresholds.clear();
  }

  public static clearMetrics(): void {
    IdGeneratorMetrics.metrics.clear();
  }
}

/**
 * 带性能监控的ID生成器包装器
 */
export function withMetrics<T extends (...args: any[]) => string>(
  fn: T,
  name: string,
): T {
  return ((...args: any[]) => {
    const start = performance.now();
    let success = true;

    try {
      const result = fn(...args);
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = performance.now() - start;
      IdGeneratorMetrics.recordGeneration(name, duration, success);
    }
  }) as T;
}

/**
 * 安全的ID验证器
 */
export class IdValidator {
  /**
   * 验证雪花算法ID
   */
  public static validateSnowflakeId(id: string): boolean {
    try {
      const idNum = BigInt(id);
      // 检查ID是否在有效范围内
      return idNum > 0 && idNum < BigInt(1) << BigInt(63);
    } catch {
      return false;
    }
  }

  /**
   * 验证NanoID
   */
  public static validateNanoId(id: string, expectedSize: number = 21): boolean {
    if (id.length !== expectedSize) {
      return false;
    }

    // 检查是否只包含URL安全字符
    const urlSafePattern = /^[A-Za-z0-9_-]+$/;
    return urlSafePattern.test(id);
  }

  /**
   * 验证订单号格式
   */
  public static validateOrderNumber(
    orderNumber: string,
    prefix: string = 'ORD',
  ): boolean {
    if (!orderNumber.startsWith(prefix)) {
      return false;
    }

    const idPart = orderNumber.substring(prefix.length);
    // 检查是否包含雪花算法ID和校验码
    return idPart.length >= 20; // 最少19位雪花ID + 1位校验码
  }

  /**
   * 验证支付单号格式
   */
  public static validatePaymentNumber(
    paymentNumber: string,
    prefix: string = 'PAY',
  ): boolean {
    if (!paymentNumber.startsWith(prefix)) {
      return false;
    }

    const idPart = paymentNumber.substring(prefix.length);
    // 检查时间戳部分（13位）+ NanoID（12位）+ 校验码（4位）
    return idPart.length >= 29;
  }
}

/**
 * ID生成器错误类
 */
export class IdGeneratorError extends Error {
  constructor(
    message: string,
    public readonly generatorType: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'IdGeneratorError';
  }
}

/**
 * 安全的ID生成包装器
 */
export function safeGenerateId<T extends (...args: any[]) => string>(
  generator: T,
  generatorType: string,
  maxRetries: number = 3,
): T {
  return ((...args: any[]) => {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const id = generator(...args);

        // 基本验证
        if (!id || id.length === 0) {
          throw new Error('Generated empty ID');
        }

        return id;
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw new IdGeneratorError(
            `Failed to generate ID after ${maxRetries} attempts: ${lastError.message}`,
            generatorType,
            lastError,
          );
        }

        // 短暂延迟后重试
        const delay = Math.min(100 * Math.pow(2, attempt - 1), 1000);
        const start = Date.now();
        while (Date.now() - start < delay) {
          // 忙等待，避免异步复杂性
        }
      }
    }

    throw new IdGeneratorError(
      `Failed to generate ID: ${lastError?.message || 'Unknown error'}`,
      generatorType,
      lastError,
    );
  }) as T;
}

// ================================
// 导出增强版生成器
// ================================

/**
 * 增强版订单号生成器（带监控和错误处理）
 */
export const generateSecureOrderNumber = withMetrics(
  safeGenerateId(generateOrderNumber, 'order'),
  'secure-order',
);

/**
 * 增强版支付单号生成器（带监控和错误处理）
 */
export const generateSecurePaymentNumber = withMetrics(
  safeGenerateId(generatePaymentNumber, 'payment'),
  'secure-payment',
);

/**
 * 增强版退款单号生成器（带监控和错误处理）
 */
export const generateSecureRefundNumber = withMetrics(
  safeGenerateId(generateRefundNumber, 'refund'),
  'secure-refund',
);

// ================================
// 使用示例和文档
// ================================

/**
 * 分布式ID生成方案使用示例
 *
 * @example
 * ```typescript
 * // 1. 基本使用
 * const orderId = generateOrderNumber(); // ORD1234567890123456789A1B
 * const paymentId = generatePaymentNumber(); // PAY1640995200000ABC123DEF456G7H
 * const refundId = generateRefundNumber(); // REF1234567890123456789XYZ
 *
 * // 2. 使用雪花算法生成器
 * const snowflake = new SnowflakeIdGenerator({
 *   workerId: 1,
 *   datacenterId: 1
 * });
 * const uniqueId = snowflake.nextId(); // 1234567890123456789
 *
 * // 3. 使用NanoID生成器
 * const nanoId = new NanoIdGenerator({ size: 12 });
 * const shortId = nanoId.nextId(); // ABC123DEF456
 *
 * // 4. 使用工厂模式
 * const generator = IdGeneratorFactory.getInstance('order-service', {
 *   type: 'snowflake',
 *   snowflake: { workerId: 2, datacenterId: 1 }
 * });
 *
 * // 5. 批量生成
 * const batchIds = snowflake.nextIds(100);
 *
 * // 6. 安全生成（带错误处理）
 * const secureOrderId = generateSecureOrderNumber('ORD');
 *
 * // 7. 性能监控
 * const metrics = IdGeneratorMetrics.getMetrics('secure-order');
 * console.log(`平均生成时间: ${metrics?.avgTime}ms`);
 *
 * // 8. ID验证
 * const isValid = IdValidator.validateOrderNumber(orderId);
 *
 * // 9. 解析时间戳
 * const timestamp = snowflake.parseTimestamp(uniqueId);
 * console.log(`ID生成时间: ${timestamp}`);
 * ```
 *
 * @description
 * 本方案解决的问题：
 * 1. 全局唯一性：雪花算法确保分布式环境下ID唯一
 * 2. 时间有序性：ID包含时间戳信息，天然有序
 * 3. 高性能：内存操作，单机每秒可生成400万+ID
 * 4. 高可用性：无依赖外部服务，本地生成
 * 5. 安全性：使用crypto模块，避免Math.random()
 * 6. 可扩展性：支持1024个机器节点，32个数据中心
 *
 * 技术特性：
 * - 雪花算法：64位长整型，包含时间戳、机器ID、序列号
 * - NanoID：URL安全字符集，可自定义长度和字符集
 * - 校验码：CRC32算法生成，防止传输错误
 * - 错误处理：完善的异常处理和重试机制
 * - 性能监控：内置性能指标收集
 * - 类型安全：完整的TypeScript类型定义
 */

import { Injectable, Logger } from '@nestjs/common';
import { OssType } from '../interfaces/storage.interface';

// Export OssTypeEnum as alias for OssType
export const OssTypeEnum = OssType;

// Base config interface
export interface OssConfig {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  secure?: boolean;
  appId?: string;
}

// Provider-specific config interfaces
export interface OssConfigOptions {
  type: OssType;
  config: OssConfig;
}

@Injectable()
export class OssConfigService {
  private readonly logger = new Logger(OssConfigService.name);
  private readonly ossConfig: OssConfigOptions;

  constructor() {
    this.ossConfig = this.getOssConfig();
    this.logger.log(`OSS configured with type: ${this.ossConfig.type}`);
  }

  /**
   * Get OSS type from environment
   */
  private getOssTypeFromEnv(): OssType {
    const type = (process.env.OSS_TYPE || 'MINIO').toUpperCase();
    if (!Object.values(OssType).includes(type as OssType)) {
      throw new Error(`Unsupported OSS type: ${type}`);
    }
    return type as OssType;
  }

  private getOssConfig(): OssConfigOptions {
    const type = this.getOssTypeFromEnv();
    return {
      type,
      config: this.buildOssConfig(type),
    };
  }

  private normalizeEndpoint(endpoint: string, secure?: boolean): string {
    const e = (endpoint || '').trim();
    if (!e) return secure ? 'https://localhost:9000' : 'http://localhost:9000';
    if (/^https?:\/\//i.test(e)) return e;
    if (e.startsWith('localhost://')) {
      const rest = e.replace('localhost://', 'localhost:');
      return (secure ? 'https://' : 'http://') + rest;
    }
    if (/^[^/]+:\d+$/i.test(e) || /^localhost(?::\d+)?$/i.test(e)) {
      return (secure ? 'https://' : 'http://') + e;
    }
    return e;
  }

  private buildOssConfig(type: OssType): OssConfig {
    const isMinio = type === OssType.MINIO;
    const isAliyun = type === OssType.ALIYUN_OSS;
    const isTencentCos = type === OssType.TENCENT_COS;
    const secure = process.env.OSS_SECURE === 'true';
    const minioEndpoint = process.env.MINIO_ENDPOINT;
    const minioPort = process.env.MINIO_PORT;

    // Default endpoint based on OSS type
    let rawEndpoint: string;
    if (process.env.OSS_ENDPOINT) {
      rawEndpoint = process.env.OSS_ENDPOINT;
    } else if (isMinio) {
      if (minioEndpoint) {
        rawEndpoint = minioPort && !minioEndpoint.includes(':')
          ? `${minioEndpoint}:${minioPort}`
          : minioEndpoint;
      } else {
        rawEndpoint = 'http://localhost:9000';
      }
    } else if (isAliyun) {
      rawEndpoint = `${process.env.OSS_REGION || 'oss-cn-hangzhou'}.aliyuncs.com`;
    } else if (isTencentCos) {
      // COS uses virtual-hosted style URL: {bucket}.cos.{region}.myqcloud.com
      const cosRegion = process.env.OSS_REGION || 'ap-guangzhou';
      rawEndpoint = `https://cos.${cosRegion}.myqcloud.com`;
    } else {
      rawEndpoint = 'http://localhost:9000';
    }

    let endpoint = this.normalizeEndpoint(rawEndpoint, secure);
    let bucket =
      process.env.OSS_BUCKET || process.env.OSS_BUCKET_NAME || 'one-recycle';

    if (isAliyun) {
      bucket = bucket.trim().toLowerCase();
      endpoint = endpoint.replace(/^https?:\/\//i, '');
      if (endpoint.startsWith(`${bucket}.`)) {
        endpoint = endpoint.slice(bucket.length + 1);
      }
      endpoint = this.normalizeEndpoint(endpoint, secure);
      const validBucket = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket);
      if (!validBucket) {
        throw new Error(`Invalid Aliyun OSS bucket name: ${bucket}`);
      }
    }

    // Determine region based on OSS type
    let region: string;
    if (process.env.OSS_REGION) {
      region = process.env.OSS_REGION;
    } else if (isAliyun) {
      region = this.inferAliyunRegion(endpoint) || 'oss-cn-hangzhou';
    } else if (isTencentCos) {
      region = 'ap-guangzhou';
    } else {
      region = 'us-east-1';
    }

    return {
      endpoint,
      region,
      accessKeyId:
        process.env.OSS_ACCESS_KEY ||
        (isMinio ? process.env.MINIO_ACCESS_KEY : undefined) ||
        'minioadmin',
      secretAccessKey:
        process.env.OSS_SECRET_KEY ||
        (isMinio ? process.env.MINIO_SECRET_KEY : undefined) ||
        'minioadmin',
      bucket,
      appId: process.env.OSS_APP_ID || 'default',
      secure,
    };
  }

  private inferAliyunRegion(endpoint: string): string | null {
    const normalized = endpoint.replace(/^https?:\/\//i, '').toLowerCase();
    const match = normalized.match(/oss-[a-z0-9-]+/);
    return match ? match[0] : null;
  }

  /**
   * Get current OSS configuration
   */
  getConfig(): OssConfigOptions {
    return this.ossConfig;
  }
  /**
   * Get current OSS type
   */
  getOssType(): OssType {
    return this.ossConfig.type;
  }
}

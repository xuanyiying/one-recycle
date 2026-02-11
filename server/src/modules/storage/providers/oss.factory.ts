import { Injectable } from '@nestjs/common';
import { OssService } from './oss.interface';
import { MinIOService } from './minio.provider';
import { AwsS3Service } from './aws-s3.provider';
import { OssTypeEnum, OssConfigOptions } from '../config/oss.config';
import { AliyunOssService } from './aliyun-oss.provider';

@Injectable()
export class OssFactory {
  private static instance: OssService | null = null;
  private static currentConfig: OssConfigOptions | null = null;

  /**
   * Create OSS service instance based on configuration
   */
  static createOssService(config: OssConfigOptions): OssService {
    switch (config.type) {
      case OssTypeEnum.MINIO:
        return new MinIOService(config.config);

      case OssTypeEnum.AWS_S3:
        return new AwsS3Service(config.config);

      case OssTypeEnum.ALIYUN_OSS:
        try {
          return new AliyunOssService(config.config);
        } catch (error: unknown) {
          throw new Error(
            `Aliyun OSS provider not available. Please install ${(error as Error).message}.`,
          );
        }
      default:
        throw new Error(`Unsupported OSS type: ${config.type}`);
    }
  }

  /**
   * Get singleton OSS service instance
   */
  static getInstance(config?: OssConfigOptions): OssService {
    if (
      !this.instance ||
      (config && JSON.stringify(config) !== JSON.stringify(this.currentConfig))
    ) {
      if (!config) {
        throw new Error(
          'OSS configuration is required for first initialization',
        );
      }
      this.instance = this.createOssService(config);
      this.currentConfig = config;
    }
    return this.instance;
  }

  /**
   * Reset singleton instance (mainly for testing)
   */
  static reset(): void {
    this.instance = null;
    this.currentConfig = null;
  }
}

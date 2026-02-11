// 需要先安装 ali-oss 及其类型声明文件
// npm install ali-oss @types/ali-oss
import OSS from 'ali-oss';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { OssService, UploadResult, FileInfo } from './oss.interface';
import { Readable } from 'stream';
import { OssConfig } from '../config/oss.config';
import { Logger } from '@nestjs/common';
import { createHmac, createVerify } from 'crypto';
import * as https from 'https';
import * as http from 'http';

export class AliyunOssService implements OssService {
  private readonly logger = new Logger(AliyunOssService.name);
  public bucketName: string;
  private ossClient: OSS;
  private bucket: string;
  private config: OssConfig;

  constructor(config: OssConfig) {
    this.config = config;
    this.bucket = config.bucket;
    this.bucketName = config.bucket;
    this.ossClient = new OSS({
      region: config.region,
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.secretAccessKey,
      bucket: config.bucket,
      endpoint: config.endpoint,
      secure: config.secure !== false, // Default to HTTPS
    });
  }

  createPostPolicySignature(
    policyBase64: string,
    accessKeySecret: string,
  ): string {
    return createHmac('sha1', accessKeySecret)
      .update(policyBase64)
      .digest('base64');
  }

  createPostPolicyV4Signature(params: {
    expiration: Date;
    conditions: Array<Record<string, string> | Array<string | number>>;
    accessKeyId: string;
    accessKeySecret: string;
    securityToken?: string;
  }): {
    signature: string;
    credential: string;
    formattedDate: string;
    policyBase64: string;
    policy: {
      expiration: string;
      conditions: Array<Record<string, string> | Array<string | number>>;
    };
  } {
    const formattedDate = this.formatDateToUTC(params.expiration);
    const credential = `${params.accessKeyId}/${formattedDate.split('T')[0]}/${this.config.region}/oss/aliyun_v4_request`;
    const conditions = [
      ...params.conditions,
      { 'x-oss-credential': credential },
      { 'x-oss-signature-version': 'OSS4-HMAC-SHA256' },
      { 'x-oss-date': formattedDate },
    ];
    if (params.securityToken) {
      conditions.push({ 'x-oss-security-token': params.securityToken });
    }
    const policy = {
      expiration: params.expiration.toISOString(),
      conditions,
    };
    const policyBase64 = Buffer.from(JSON.stringify(policy), 'utf8').toString(
      'base64',
    );
    const client = new OSS({
      region: this.config.region,
      accessKeyId: params.accessKeyId,
      accessKeySecret: params.accessKeySecret,
      stsToken: params.securityToken,
      bucket: this.config.bucket,
      endpoint: this.config.endpoint,
      secure: this.config.secure !== false,
    });
    const signature = (
      client as unknown as {
        signPostObjectPolicyV4: (
          policy: Record<string, unknown>,
          date: Date,
        ) => string;
      }
    ).signPostObjectPolicyV4(policy, params.expiration);
    return { signature, credential, formattedDate, policyBase64, policy };
  }

  async verifyCallbackSignature(params: {
    callbackBody: string;
    callbackUrl: string;
    authorization: string;
    publicKeyUrl: string;
    requestPath?: string;
  }): Promise<boolean> {
    const url = Buffer.from(params.publicKeyUrl, 'base64').toString('utf8');
    const publicKey = await this.fetchPublicKey(url);
    const stringToSign = `${decodeURIComponent(params.requestPath || params.callbackUrl)}\n${params.callbackBody}`;
    const verifier = createVerify('RSA-SHA1');
    verifier.update(stringToSign, 'utf8');
    return verifier.verify(publicKey, params.authorization, 'base64');
  }

  /**
   * Initialize bucket
   */
  async initializeBucket(): Promise<void> {
    try {
      // Check if bucket exists
      const bucketInfo = (await this.ossClient.getBucketInfo(this.bucket)) as {
        bucket?: { Name?: string };
      };
      // Fixed property access based on types - assuming ali-oss types are correct or result is castable
      const bucketName = bucketInfo.bucket?.Name || this.bucket;
      this.logger.log(`OSS Bucket ${bucketName} already exists`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorCode =
        typeof error === 'object' && error !== null && 'code' in error
          ? (error as { code: string }).code
          : undefined;

      if (errorCode === 'NoSuchBucket') {
        try {
          await this.ossClient.putBucket(this.bucket);
          this.logger.log(`OSS Bucket ${this.bucket} created successfully`);
        } catch (createError) {
          const createErrorMessage =
            createError instanceof Error
              ? createError.message
              : String(createError);
          this.logger.error(`Error creating OSS bucket: ${createErrorMessage}`);
          throw createError;
        }
      } else {
        this.logger.error(`Error checking OSS bucket: ${errorMessage}`);
        throw error;
      }
    }
  }

  /**
   * Upload file
   */
  async uploadFile(
    file: Buffer | Readable,
    originalName: string,
    contentType: string,
    folder?: string,
  ): Promise<UploadResult> {
    try {
      // Generate unique filename
      const fileExtension = path.extname(originalName);
      const fileName = `${uuidv4()}${fileExtension}`;
      const key = folder ? `${folder}/${fileName}` : fileName;

      // Get file size
      let fileSize = 0;
      if (Buffer.isBuffer(file)) {
        fileSize = file.length;
      } else if (file instanceof Readable) {
        // Try to get length if available (e.g. fs.ReadStream)
        const streamWithLength = file as Readable & { readableLength?: number };
        if (typeof streamWithLength.readableLength === 'number') {
          fileSize = streamWithLength.readableLength;
        }
      }

      const result = await this.ossClient.put(key, file, {
        headers: {
          'Content-Type': contentType,
        },
        meta: {
          originalName,
          uploadTime: new Date().toISOString(),
          uid: 0,
          pid: 0,
        },
      });

      // If upload successful but size unknown, get from result
      if (fileSize === 0 && result.res && result.res.size) {
        fileSize = parseInt(String(result.res.size), 10);
      }

      return {
        key,
        url: result.url,
        size: fileSize,
        contentType,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error uploading file to OSS: ${errorMessage}`);
      throw new Error('Failed to upload file to OSS');
    }
  }
  /**
   * Download file
   */
  async downloadFile(key: string): Promise<Buffer> {
    try {
      const result = await this.ossClient.get(key);
      return result.content as Buffer;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error downloading file from OSS: ${errorMessage}`);
      throw new Error('Failed to download file from OSS');
    }
  }

  /**
   * Delete file
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.ossClient.delete(key);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error deleting file from OSS: ${errorMessage}`);
      throw new Error('Failed to delete file from OSS');
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(key: string): Promise<FileInfo> {
    try {
      const result = await this.ossClient.head(key);

      const headers = result.res.headers as Record<string, any>;
      return {
        key,
        size: parseInt(String(headers['content-length'] || '0')),
        lastModified: new Date(String(headers['last-modified'] || new Date())),
        contentType: String(
          headers['content-type'] || 'application/octet-stream',
        ),
        url: this.getFileUrl(key),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting file info from OSS: ${errorMessage}`);
      throw new Error('Failed to get file info from OSS');
    }
  }

  /**
   * List files
   */
  async listFiles(prefix?: string, maxKeys: number = 100): Promise<FileInfo[]> {
    try {
      const result = await this.ossClient.list(
        {
          prefix: prefix,
          'max-keys': maxKeys,
        },
        {},
      );

      if (!result.objects) {
        return [];
      }

      return result.objects.map(
        (obj: {
          name: string;
          size: number;
          lastModified: string | number | Date;
        }) => ({
          key: obj.name,
          size: obj.size,
          lastModified: new Date(obj.lastModified),
          contentType: 'application/octet-stream', // OSS list does not return ContentType
          url: this.getFileUrl(obj.name),
        }),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error listing files from OSS: ${errorMessage}`);
      throw new Error('Failed to list files from OSS');
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await this.getFileInfo(key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file access URL
   */
  getFileUrl(key: string): string {
    // If custom domain is configured
    if (
      this.config.endpoint &&
      !this.config.endpoint.includes('aliyuncs.com')
    ) {
      const protocol = this.config.secure !== false ? 'https' : 'http';
      return `${protocol}://${this.config.endpoint}/${key}`;
    }

    // Use default OSS domain
    const protocol = this.config.secure !== false ? 'https' : 'http';
    return `${protocol}://${this.bucket}.${this.config.region}.aliyuncs.com/${key}`;
  }

  /**
   * Batch delete files
   */
  async deleteFiles(keys: string[]): Promise<void> {
    try {
      if (keys.length === 0) return;

      // OSS supports batch delete (limit 1000)
      const batchSize = 1000;
      const batches: string[][] = [];

      for (let i = 0; i < keys.length; i += batchSize) {
        batches.push(keys.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        await this.ossClient.deleteMulti(batch);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error deleting files from OSS: ${errorMessage}`);
      throw new Error('Failed to delete files from OSS');
    }
  }

  /**
   * Copy file
   */
  async copyFile(sourceKey: string, targetKey: string): Promise<void> {
    try {
      await this.ossClient.copy(targetKey, sourceKey);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error copying file in OSS: ${errorMessage}`);
      throw new Error('Failed to copy file in OSS');
    }
  }

  /**
   * Generate signed URL (for temp access to private files)
   */
  async getSignedUrl(key: string, expires: number = 3600): Promise<string> {
    try {
      return Promise.resolve(this.ossClient.signatureUrl(key, { expires }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error generating signed URL: ${errorMessage}`);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Generate presigned upload URL
   */
  async getPresignedUploadUrl(
    key: string,
    expires: number = 3600,
    contentType?: string,
  ): Promise<string> {
    try {
      const options: OSS.SignatureUrlOptions = {
        expires,
        method: 'PUT',
      };

      if (contentType) {
        // ali-oss type definition might allow 'Content-Type' or strict types
        (options as OSS.SignatureUrlOptions & { 'Content-Type'?: string })[
          'Content-Type'
        ] = contentType;
      }

      return Promise.resolve(this.ossClient.signatureUrl(key, options));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error generating presigned upload URL: ${errorMessage}`,
      );
      throw new Error('Failed to generate presigned upload URL');
    }
  }

  /**
   * Generate presigned download URL
   */
  async getPresignedDownloadUrl(
    key: string,
    expires: number = 3600,
  ): Promise<string> {
    try {
      return Promise.resolve(
        this.ossClient.signatureUrl(key, { expires, method: 'GET' }),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error generating presigned download URL: ${errorMessage}`,
      );
      throw new Error('Failed to generate presigned download URL');
    }
  }

  private formatDateToUTC(date: Date): string {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
  }

  private fetchPublicKey(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      client
        .get(url, (res) => {
          const statusCode = res.statusCode || 0;
          if (statusCode < 200 || statusCode >= 300) {
            reject(new Error(`Failed to fetch public key: ${statusCode}`));
            return;
          }
          const chunks: Buffer[] = [];
          res.on('data', (chunk) =>
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)),
          );
          res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        })
        .on('error', (error) => reject(error));
    });
  }
}

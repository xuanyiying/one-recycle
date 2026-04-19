import COS from 'cos-nodejs-sdk-v5';
import { Readable } from 'stream';
import path from 'path';
import { OssService, UploadResult, FileInfo } from './oss.interface';
import { OssConfig } from '../config/oss.config';
import { Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

export class TencentCosService implements OssService {
  public bucketName: string;
  private readonly cosClient: COS;
  private readonly bucket: string;
  private readonly region: string;
  private config: OssConfig;
  private logger = new Logger(TencentCosService.name);

  constructor(config: OssConfig) {
    this.config = config;
    this.bucket = config.bucket;
    this.bucketName = config.bucket;
    this.region = config.region || 'ap-guangzhou';

    this.cosClient = new COS({
      SecretId: config.accessKeyId,
      SecretKey: config.secretAccessKey,
    });

    // Initialize bucket asynchronously
    this.initializeBucket().catch((error) => {
      this.logger.warn(
        `Failed to initialize bucket during construction: ${this.formatCosError(error)}`,
      );
    });
  }

  /**
   * Initialize bucket
   */
  async initializeBucket(): Promise<void> {
    try {
      // Check if bucket exists
      const result = await this.cosClient.headBucket({
        Bucket: this.bucket,
        Region: this.region,
      });

      if (result.statusCode === 200) {
        this.logger.log(`COS Bucket ${this.bucket} already exists`);
      }
    } catch (error: any) {
      const statusCode = error?.statusCode ?? error?.StatusCode;
      // Bucket may not exist, try to create it
      if (statusCode === 404) {
        try {
          this.logger.log('Creating COS bucket...', {
            bucket: this.bucket,
            region: this.region,
          });

          await this.cosClient.putBucket({
            Bucket: this.bucket,
            Region: this.region,
          });

          this.logger.log(`COS Bucket ${this.bucket} created successfully`);
        } catch (createError) {
          this.logger.warn(
            `Error creating COS bucket: ${this.formatCosError(createError)}`,
          );
          // Don't throw, bucket might already exist or be managed elsewhere
        }
      } else {
        this.logger.warn(
          `Error checking COS bucket: ${this.formatCosError(error)}`,
        );
      }
    }
  }

  /**
   * Format any COS SDK error (Error instance or plain object) into a readable string.
   * COS SDK often throws plain objects like { statusCode, code, message, err, ... }
   */
  private formatCosError(error: unknown): string {
    if (error == null) return 'Unknown error (null)';

    // If it's a string already, return it
    if (typeof error === 'string') return error;

    const obj = error as Record<string, any>;
    const parts: string[] = [];

    // Extract message
    const message = obj.message ?? obj.Message;
    if (
      message &&
      typeof message === 'string' &&
      message !== '[object Object]'
    ) {
      parts.push(message);
    }

    // Extract error code (e.g. 'InvalidAccessKeyId', 'SignatureDoesNotMatch')
    const code = obj.code ?? obj.Code;
    if (code && typeof code === 'string') {
      parts.push(`code: ${code}`);
    }

    // Extract status code
    const statusCode = obj.statusCode ?? obj.StatusCode;
    if (statusCode != null && typeof statusCode === 'number') {
      parts.push(`statusCode: ${statusCode}`);
    }

    // Extract nested error
    const nestedErr = obj.err ?? obj.error;
    if (nestedErr) {
      const nestedMsg =
        nestedErr instanceof Error
          ? nestedErr.message
          : typeof nestedErr === 'string'
            ? nestedErr
            : JSON.stringify(nestedErr);
      if (nestedMsg && nestedMsg !== '[object Object]') {
        parts.push(`err: ${nestedMsg}`);
      }
    }

    // Fallback: try JSON.stringify for plain objects
    if (parts.length === 0) {
      try {
        const json = JSON.stringify(error);
        if (json && json !== '{}') return json;
      } catch {
        // circular reference or other issue
      }
      return error instanceof Error ? error.message : 'Unknown error';
    }

    return parts.join(' | ');
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
      const fileName = `${randomUUID()}${fileExtension}`;
      const key = folder ? `${folder}/${fileName}` : fileName;

      // Convert stream to buffer if needed
      let fileBuffer: Buffer;
      if (file instanceof Readable) {
        const chunks: Buffer[] = [];
        for await (const chunk of file) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        fileBuffer = Buffer.concat(chunks);
      } else {
        fileBuffer = file;
      }

      const result = (await this.cosClient.putObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      })) as any;

      if (result.statusCode !== 200) {
        throw new Error(`Upload failed with status ${result.statusCode}`);
      }

      const url = this.getFileUrl(key);

      return {
        key,
        url,
        size: fileBuffer.length,
        contentType,
      };
    } catch (error) {
      this.logger.error('Error uploading file to COS:', error);
      throw new Error('Failed to upload file to COS');
    }
  }

  /**
   * Download file
   */
  async downloadFile(key: string): Promise<Buffer> {
    try {
      const result = (await this.cosClient.getObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
      })) as any;

      if (result.statusCode !== 200) {
        throw new Error(`Download failed with status ${result.statusCode}`);
      }

      // Handle different response types
      if (Buffer.isBuffer(result.Body)) {
        return result.Body;
      } else if (typeof result.Body === 'string') {
        return Buffer.from(result.Body);
      } else {
        // Handle stream
        const chunks: Buffer[] = [];
        const stream = result.Body as Readable;
        return new Promise((resolve, reject) => {
          stream.on('data', (chunk: Buffer) => chunks.push(chunk));
          stream.on('end', () => resolve(Buffer.concat(chunks)));
          stream.on('error', reject);
        });
      }
    } catch (error) {
      this.logger.error('Error downloading file from COS:', error);
      throw new Error('Failed to download file from COS');
    }
  }

  /**
   * Delete file
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const result = (await this.cosClient.deleteObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
      })) as any;

      if (result.statusCode !== 200 && result.statusCode !== 204) {
        throw new Error(`Delete failed with status ${result.statusCode}`);
      }
    } catch (error) {
      this.logger.error('Error deleting file from COS:', error);
      throw new Error('Failed to delete file from COS');
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(key: string): Promise<FileInfo> {
    try {
      const result = (await this.cosClient.headObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
      })) as any;

      if (result.statusCode !== 200) {
        throw new Error(
          `Get file info failed with status ${result.statusCode}`,
        );
      }

      const headers = result.headers;
      return {
        key,
        size: headers?.['content-length']
          ? parseInt(headers['content-length'] as string, 10)
          : 0,
        lastModified: headers?.['last-modified']
          ? new Date(headers['last-modified'] as string)
          : new Date(),
        contentType:
          (headers?.['content-type'] as string) || 'application/octet-stream',
        url: this.getFileUrl(key),
      };
    } catch (error) {
      this.logger.error('Error getting file info from COS:', error);
      throw new Error('Failed to get file info from COS');
    }
  }

  /**
   * List files
   */
  async listFiles(prefix?: string, maxKeys: number = 100): Promise<FileInfo[]> {
    try {
      const result = (await this.cosClient.getBucket({
        Bucket: this.bucket,
        Region: this.region,
        Prefix: prefix,
        MaxKeys: maxKeys,
      })) as any;

      if (result.statusCode !== 200) {
        throw new Error(`List files failed with status ${result.statusCode}`);
      }

      const contents = result.Contents || [];

      return contents.map((obj: any) => ({
        key: obj.Key || '',
        size: obj.Size || 0,
        lastModified: obj.LastModified
          ? new Date(obj.LastModified)
          : new Date(),
        contentType: 'application/octet-stream',
        url: this.getFileUrl(obj.Key || ''),
      }));
    } catch (error) {
      this.logger.error('Error listing files from COS:', error);
      throw new Error('Failed to list files from COS');
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await this.getFileInfo(key);
      return true;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get file access URL
   */
  getFileUrl(key: string): string {
    // Check if key already contains full URL
    if (key.startsWith('http://') || key.startsWith('https://')) {
      return key;
    }

    // Build COS URL
    // Format: https://{bucket}.cos.{region}.myqcloud.com/{key}
    const protocol = this.config.secure !== false ? 'https' : 'http';
    const keyPath = key.startsWith('/') ? key.substring(1) : key;

    return `${protocol}://${this.bucket}.cos.${this.region}.myqcloud.com/${keyPath}`;
  }

  /**
   * Batch delete files
   */
  async deleteFiles(keys: string[]): Promise<void> {
    try {
      if (keys.length === 0) return;

      const objects = keys.map((key) => ({ Key: key }));

      const result = (await this.cosClient.deleteMultipleObject({
        Bucket: this.bucket,
        Region: this.region,
        Objects: objects,
      })) as any;

      if (result.statusCode !== 200) {
        throw new Error(`Batch delete failed with status ${result.statusCode}`);
      }
    } catch (error) {
      this.logger.error('Error deleting files from COS:', error);
      throw new Error('Failed to delete files from COS');
    }
  }

  /**
   * Copy file
   */
  async copyFile(sourceKey: string, targetKey: string): Promise<void> {
    try {
      const result = (await this.cosClient.putObjectCopy({
        Bucket: this.bucket,
        Region: this.region,
        Key: targetKey,
        CopySource: `/${this.bucket}/${sourceKey}`,
      })) as any;

      if (result.statusCode !== 200) {
        throw new Error(`Copy failed with status ${result.statusCode}`);
      }
    } catch (error) {
      this.logger.error('Error copying file in COS:', error);
      throw new Error('Failed to copy file in COS');
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
      const url = this.cosClient.getObjectUrl({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
        Method: 'PUT',
        Sign: true,
        Expires: expires,
      });

      return url;
    } catch (error) {
      this.logger.error('Error generating presigned upload URL:', error);
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
      const url = this.cosClient.getObjectUrl({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
        Method: 'GET',
        Sign: true,
        Expires: expires,
      });

      return url;
    } catch (error) {
      this.logger.error('Error generating presigned download URL:', error);
      throw new Error('Failed to generate presigned download URL');
    }
  }
}

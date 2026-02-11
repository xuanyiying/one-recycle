import {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import path from 'path';
import { OssService, UploadResult, FileInfo } from './oss.interface';
import { OssConfig } from '../config/oss.config';
import { Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

export class MinIOService implements OssService {
  public bucketName: string;
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private config: OssConfig;
  private logger = new Logger(MinIOService.name);

  constructor(config: OssConfig) {
    this.config = config;
    this.bucket = config.bucket;
    this.bucketName = config.bucket;
    this.s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: process.env.OSS_PATH_STYLE === 'true',
    });

    // Initialize bucket asynchronously
    this.initializeBucket().catch((error) => {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to initialize bucket during construction: ${errorMessage}`,
      );
    });
  }

  /**
   * Initialize bucket
   */
  async initializeBucket(): Promise<void> {
    try {
      // Check if bucket exists
      const headCommand = new HeadBucketCommand({
        Bucket: this.bucket,
      });

      try {
        await this.s3Client.send(headCommand);
        this.logger.log(`OSS Bucket ${this.bucket} already exists`);
      } catch (headError) {
        const error = headError as {
          name?: string;
          $metadata?: { httpStatusCode?: number };
        };
        if (
          error.name === 'NotFound' ||
          error.$metadata?.httpStatusCode === 404
        ) {
          // Bucket does not exist, create it
          const createCommand = new CreateBucketCommand({
            Bucket: this.bucket,
          });

          this.logger.log('Creating OSS bucket...', {
            bucket: this.bucket,
            endpoint: this.config.endpoint,
          });
          await this.s3Client.send(createCommand);
          this.logger.log(`OSS Bucket ${this.bucket} created successfully`);
        } else {
          throw headError;
        }
      }
    } catch (error) {
      const err = error as { name?: string };
      if (
        err.name === 'BucketAlreadyOwnedByYou' ||
        err.name === 'BucketAlreadyExists'
      ) {
        this.logger.log(`OSS Bucket ${this.bucket} already exists`);
      } else {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(`Error creating OSS bucket: ${errorMessage}`);
        throw error;
      }
    }

    // Optional: Set public policy (disabled by default, recommend private bucket + presigned URL for production)
    if (process.env.OSS_PUBLIC_READ === 'true') {
      await this.setBucketPublicPolicy();
    } else {
      this.logger.log(
        `Skip public policy for bucket ${this.bucket} (OSS_PUBLIC_READ !== 'true')`,
      );
    }
  }

  /**
   * Set bucket public read-write policy
   */
  private async setBucketPublicPolicy(): Promise<void> {
    try {
      // Set public read-write policy for MinIO
      const bucketPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
          },
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:ListBucket'],
            Resource: [`arn:aws:s3:::${this.bucket}`],
          },
        ],
      };

      const policyCommand = new PutBucketPolicyCommand({
        Bucket: this.bucket,
        Policy: JSON.stringify(bucketPolicy),
      });

      await this.s3Client.send(policyCommand);
      this.logger.log(
        `OSS Bucket ${this.bucket} public policy set successfully`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Error setting OSS bucket public policy: ${errorMessage}`,
      );

      // If policy setting fails, try MinIO specific method
      try {
        await this.setMinIOPublicPolicy();
      } catch (minioError) {
        const minioErrorMessage =
          minioError instanceof Error ? minioError.message : String(minioError);
        this.logger.warn(
          `MinIO public policy fallback also failed: ${minioErrorMessage}`,
        );
        // Do not throw error, as policy setting failure should not block service startup
      }
    }
  }

  /**
   * MinIO specific public policy setting method
   */
  private async setMinIOPublicPolicy(): Promise<void> {
    try {
      // Use MinIO specific public read policy
      const publicReadPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: '*' },
            Action: ['s3:GetBucketLocation', 's3:ListBucket'],
            Resource: [`arn:aws:s3:::${this.bucket}`],
          },
          {
            Effect: 'Allow',
            Principal: { AWS: '*' },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
          },
        ],
      };

      const policyCommand = new PutBucketPolicyCommand({
        Bucket: this.bucket,
        Policy: JSON.stringify(publicReadPolicy),
      });

      await this.s3Client.send(policyCommand);
      this.logger.log(
        `MinIO Bucket ${this.bucket} public read policy set successfully`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to set MinIO public policy: ${errorMessage}`);
      throw error;
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
      const fileName = `${uuid()}${fileExtension}`;
      const key = folder ? `${folder}/${fileName}` : fileName;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: {
          originalName: encodeURIComponent(originalName),
          uploadTime: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      const url = this.getFileUrl(key);

      // For stream upload, we don't know the size beforehand
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      const { ContentLength } = await this.s3Client.send(headCommand);

      return {
        key,
        url,
        size: ContentLength || 0,
        contentType,
      };
    } catch (error) {
      this.logger.error('Error uploading file to OSS:', error);
      throw new Error('Failed to upload file to OSS');
    }
  }

  /**
   * Download file
   */
  async downloadFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('File not found');
      }

      // Convert stream to Buffer
      const chunks: Buffer[] = [];
      const stream = response.Body as Readable;

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error('Error downloading file from OSS:', error);
      throw new Error('Failed to download file from OSS');
    }
  }

  /**
   * Delete file
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      this.logger.error('Error deleting file from OSS:', error);
      throw new Error('Failed to delete file from OSS');
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(key: string): Promise<FileInfo> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      return {
        key,
        size: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        contentType: response.ContentType || 'application/octet-stream',
        url: this.getFileUrl(key),
      };
    } catch (error) {
      this.logger.error('Error getting file info from OSS:', error);
      throw new Error('Failed to get file info from OSS');
    }
  }

  /**
   * List files
   */
  async listFiles(prefix?: string, maxKeys: number = 100): Promise<FileInfo[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const response = await this.s3Client.send(command);

      if (!response.Contents) {
        return [];
      }

      return response.Contents.map((obj) => ({
        key: obj.Key || '',
        size: obj.Size || 0,
        lastModified: obj.LastModified || new Date(),
        contentType: 'application/octet-stream', // S3 ListObjects does not return ContentType
        url: this.getFileUrl(obj.Key || ''),
      }));
    } catch (error) {
      this.logger.error('Error listing files from OSS:', error);
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
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === 'NotFound' || error.name === 'NoSuchKey')
      ) {
        return false;
      }
      // Handle AWS SDK specific error objects that might not be standard Error instances
      if (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        ((error as { name: string }).name === 'NotFound' ||
          (error as { name: string }).name === 'NoSuchKey')
      ) {
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

    // Use OSS public endpoint
    const publicEndpoint = process.env.OSS_PUBLIC_ENDPOINT;
    this.logger.debug(`OSS_PUBLIC_ENDPOINT: ${publicEndpoint}`);

    if (publicEndpoint) {
      // Ensure URL format is correct
      const baseUrl = publicEndpoint.endsWith('/')
        ? publicEndpoint.slice(0, -1)
        : publicEndpoint;
      const bucketPath = this.bucket;
      const keyPath = key.startsWith('/') ? key.substring(1) : key;
      return `${baseUrl}/${bucketPath}/${keyPath}`;
    }

    // Default use internal OSS address
    const endpoint = this.config.endpoint;
    if (process.env.NODE_ENV === 'development' && endpoint.includes(':9000')) {
      return `${endpoint.replace(/http:\/\/[^:]+:/, 'http://127.0.0.1:')}/${this.bucket}/${key}`;
    }

    return `${endpoint}/${this.bucket}/${key}`;
  }

  /**
   * Batch delete files
   */
  async deleteFiles(keys: string[]): Promise<void> {
    try {
      if (keys.length === 0) return;

      const command = new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
          Quiet: true,
        },
      });

      await this.s3Client.send(command);
    } catch (error) {
      this.logger.error('Error deleting files from OSS:', error);
      throw new Error('Failed to delete files from OSS');
    }
  }

  /**
   * Copy file
   */
  async copyFile(sourceKey: string, targetKey: string): Promise<void> {
    try {
      // Download source file first
      const fileBuffer = await this.downloadFile(sourceKey);
      const fileInfo = await this.getFileInfo(sourceKey);

      // Upload to target location
      await this.uploadFile(
        fileBuffer,
        path.basename(targetKey),
        fileInfo.contentType,
        path.dirname(targetKey),
      );
    } catch (error) {
      this.logger.error('Error copying file in OSS:', error);
      throw new Error('Failed to copy file in OSS');
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
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      });

      // Generate signature using internal OSS address
      const internalUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: expires,
      });
      this.logger.debug(`Internal URL generated: ${internalUrl}`);

      // Replace internal OSS address with external accessible address
      const publicEndpoint = process.env.OSS_PUBLIC_ENDPOINT;

      if (publicEndpoint) {
        // Extract path part from internal URL
        const urlObj = new URL(internalUrl);
        const pathWithQuery = urlObj.pathname + urlObj.search;

        // Build new external accessible URL
        const externalUrl = `${publicEndpoint}${pathWithQuery}`;
        this.logger.debug(`External URL generated: ${externalUrl}`);
        return externalUrl;
      }

      const externalUrl = internalUrl.replace(
        /http:\/\/[^:]+:9000/g,
        'http://localhost:9000',
      );
      this.logger.debug(`External URL generated: ${externalUrl}`);
      return externalUrl;
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
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      // Get internal URL
      const internalUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: expires,
      });

      // Replace internal OSS address with external accessible address
      const publicEndpoint = process.env.OSS_PUBLIC_ENDPOINT;

      if (publicEndpoint) {
        // Extract path part from internal URL
        const urlObj = new URL(internalUrl);
        const pathWithQuery = urlObj.pathname + urlObj.search;

        // Build new external accessible URL
        const externalUrl = `${publicEndpoint}${pathWithQuery}`;
        this.logger.debug(`External download URL generated: ${externalUrl}`);
        return externalUrl;
      }

      // If no external endpoint configured, use default replacement
      const externalUrl = internalUrl.replace(
        /http:\/\/[^:]+:9000/g,
        'http://localhost:9000',
      );
      this.logger.debug(`External download URL generated: ${externalUrl}`);
      return externalUrl;
    } catch (error) {
      this.logger.error('Error generating presigned download URL:', error);
      throw new Error('Failed to generate presigned download URL');
    }
  }
}

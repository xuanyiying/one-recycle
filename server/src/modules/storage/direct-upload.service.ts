import {
  Injectable,
  Logger,
  Inject,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { OssService } from './providers/oss.interface';
import {
  FileType,
  OssType,
  MiniProgramPlatform,
} from './interfaces/storage.interface';
import { OssConfigService } from './config/oss.config';
import { ChunkUploadSessionService } from './services/chunk-upload-session.service';
import { createHash, randomUUID } from 'crypto';
import Core from '@alicloud/pop-core';
import { OSS_SERVICE } from './storage.constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AliyunOssService } from './providers/aliyun-oss.provider';

@Injectable()
export class DirectUploadService {
  private readonly logger = new Logger(DirectUploadService.name);

  constructor(
    private prisma: PrismaService,
    private ossConfigService: OssConfigService,
    private chunkUploadSessionService: ChunkUploadSessionService,
    @Inject(OSS_SERVICE) private ossService: OssService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Generate presigned upload URL for direct upload
   */
  async generatePresignedUrl(request: {
    userId: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    fileType: FileType;
    category?: string;
    expires?: number;
  }) {
    const {
      userId,
      fileName,
      fileSize,
      contentType,
      fileType,
      category,
      expires = 3600,
    } = request;

    this.validateFile(fileName, fileSize, contentType, fileType);

    const ossKey = this.generateOssKey(userId, fileName, fileType, category);
    const presignedUrl = await this.ossService.getPresignedUploadUrl(
      ossKey,
      expires,
      contentType,
    );

    const sessionId = randomUUID();

    this.logger.log(`Presigned URL generated: ${sessionId}`);

    return {
      presignedUrl,
      uploadSessionId: sessionId,
      ossKey,
      expires,
    };
  }

  async generateAliyunPostPolicy(request: {
    userId: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    fileType: FileType;
    category?: string;
    expires?: number;
  }) {
    const {
      userId,
      fileName,
      fileSize,
      contentType,
      fileType,
      category = 'other',
      expires = 3600,
    } = request;

    const ossType = this.ossConfigService.getOssType();
    if (ossType !== OssType.ALIYUN_OSS) {
      throw new BadRequestException(
        `OSS type does not support Aliyun direct upload: ${ossType}`,
      );
    }

    this.validateFile(fileName, fileSize, contentType, fileType);

    const ossKey = this.generateOssKey(userId, fileName, fileType, category);
    const config = this.ossConfigService.getConfig().config;
    const tempCredentials = await this.getAliyunTemporaryCredentials({
      bucket: config.bucket,
      key: ossKey,
    });
    const accessKeyId = tempCredentials?.accessKeyId || config.accessKeyId;
    const accessKeySecret =
      tempCredentials?.accessKeySecret || config.secretAccessKey;
    const securityToken = tempCredentials?.securityToken;

    const fileTypeConfig = this.getFileTypeConfig(fileType);
    const expiration = new Date(Date.now() + expires * 1000).toISOString();
    const conditions: Array<Array<string | number>> = [
      ['eq', '$bucket', config.bucket],
      ['eq', '$key', ossKey],
      ['content-length-range', 0, fileTypeConfig.maxSize],
    ];

    if (securityToken) {
      conditions.push(['eq', '$x-oss-security-token', securityToken]);
    }

    const policy = Buffer.from(
      JSON.stringify({ expiration, conditions }),
    ).toString('base64');
    const signature = this.getAliyunProvider().createPostPolicySignature(
      policy,
      accessKeySecret,
    );

    const session = await this.chunkUploadSessionService.createSession(
      userId,
      fileName,
      fileSize,
      contentType,
      fileType,
      category,
      ossKey,
      1,
      { uploadType: 'aliyun-post' },
    );

    return {
      host: this.buildAliyunUploadHost(config),
      policy,
      signature,
      accessKeyId,
      securityToken,
      key: ossKey,
      bucket: config.bucket,
      expireAt: expiration,
      uploadSessionId: session.id,
      ossType: this.ossConfigService.getOssType(),
    };
  }

  async generateMiniProgramPostPolicy(request: {
    userId: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    fileType: FileType;
    platform: MiniProgramPlatform;
    category?: string;
    expires?: number;
  }) {
    const {
      userId,
      fileName,
      fileSize,
      contentType,
      fileType,
      platform,
      category = 'other',
      expires = 3600,
    } = request;

    if (this.ossConfigService.getOssType() !== OssType.ALIYUN_OSS) {
      throw new BadRequestException(
        'OSS type does not support Aliyun direct upload',
      );
    }

    this.validateFile(fileName, fileSize, contentType, fileType);

    const ossKey = this.generateOssKey(userId, fileName, fileType, category);
    const config = this.ossConfigService.getConfig().config;
    const tempCredentials = await this.getAliyunTemporaryCredentials({
      bucket: config.bucket,
      key: ossKey,
    });
    const accessKeyId = tempCredentials?.accessKeyId || config.accessKeyId;
    const accessKeySecret =
      tempCredentials?.accessKeySecret || config.secretAccessKey;
    const securityToken = tempCredentials?.securityToken;
    const fileTypeConfig = this.getFileTypeConfig(fileType);
    const expirationDate = new Date(Date.now() + expires * 1000);
    const expiration = expirationDate.toISOString();

    const baseConditions: Array<Array<string | number>> = [
      ['eq', '$bucket', config.bucket],
      ['eq', '$key', ossKey],
      ['content-length-range', 0, fileTypeConfig.maxSize],
    ];

    if (securityToken) {
      baseConditions.push(['eq', '$x-oss-security-token', securityToken]);
    }

    const policyData = { expiration, conditions: baseConditions };
    let policy = Buffer.from(JSON.stringify(policyData)).toString('base64');
    let signature = '';
    const formFields: Record<string, string> = {
      key: ossKey,
    };

    if (platform === MiniProgramPlatform.WECHAT) {
      const v4 = this.getAliyunProvider().createPostPolicyV4Signature({
        expiration: expirationDate,
        conditions: baseConditions,
        accessKeyId,
        accessKeySecret,
        securityToken,
      });
      policy = v4.policyBase64;
      signature = v4.signature;
      formFields['x-oss-date'] = v4.formattedDate;
      formFields['x-oss-credential'] = v4.credential;
      formFields['x-oss-signature-version'] = 'OSS4-HMAC-SHA256';
      formFields.signature = signature;
      formFields.policy = policy;
    } else if (
      platform === MiniProgramPlatform.ALIPAY ||
      platform === MiniProgramPlatform.DOUYIN
    ) {
      signature = this.getAliyunProvider().createPostPolicySignature(
        policy,
        accessKeySecret,
      );
      formFields.policy = policy;
      formFields.signature = signature;
      formFields.OSSAccessKeyId = accessKeyId;
      formFields.accessKeyId = accessKeyId;
    } else {
      throw new BadRequestException('Unsupported mini program platform');
    }

    if (securityToken) {
      formFields['x-oss-security-token'] = securityToken;
      formFields.security_token = securityToken;
    }

    const session = await this.chunkUploadSessionService.createSession(
      userId,
      fileName,
      fileSize,
      contentType,
      fileType,
      category,
      ossKey,
      1,
      { uploadType: `aliyun-post-${platform.toLowerCase()}` },
    );

    this.logger.log(`Mini program post policy generated: ${session.id}`);

    return {
      host: this.buildAliyunUploadHost(config),
      policy,
      signature,
      accessKeyId,
      securityToken,
      key: ossKey,
      bucket: config.bucket,
      expireAt: expiration,
      uploadSessionId: session.id,
      ossType: this.ossConfigService.getOssType(),
      platform,
      formFields,
    };
  }

  /**
   * Initialize chunk upload session
   */
  async initializeChunkUpload(request: {
    userId: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    fileType: FileType;
    category?: string;
    totalChunks: number;
    chunkSize: number;
  }) {
    const {
      userId,
      fileName,
      fileSize,
      contentType,
      fileType,
      category = 'other',
      totalChunks,
      chunkSize,
    } = request;

    this.validateFile(fileName, fileSize, contentType, fileType);

    const ossKey = this.generateOssKey(userId, fileName, fileType, category);

    const session = await this.chunkUploadSessionService.createSession(
      userId,
      fileName,
      fileSize,
      contentType,
      fileType,
      category,
      ossKey,
      totalChunks,
      { chunkSize },
    );

    this.logger.log(`Chunk upload session initialized: ${session.id}`);

    return {
      uploadSessionId: session.id,
      ossKey,
      totalChunks,
      chunkSize,
    };
  }

  /**
   * Generate presigned URL for chunk upload
   */
  async generateChunkUploadUrl(request: {
    uploadSessionId: string;
    userId: string;
    chunkIndex: number;
    expires?: number;
  }) {
    const { uploadSessionId, userId, chunkIndex, expires = 3600 } = request;

    const session =
      await this.chunkUploadSessionService.getSession(uploadSessionId);

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Permission denied');
    }

    if (session.status === 'completed' || session.status === 'cancelled') {
      throw new BadRequestException(`Upload session is ${session.status}`);
    }

    // Generate chunk-specific key
    const chunkKey = `${session.ossKey}.part${chunkIndex}`;
    const presignedUrl = await this.ossService.getPresignedUploadUrl(
      chunkKey,
      expires,
      session.contentType,
    );

    return {
      presignedUrl,
      chunkIndex,
      chunkKey,
      expires,
    };
  }

  /**
   * Confirm chunk uploaded
   */
  async confirmChunkUploaded(request: {
    uploadSessionId: string;
    userId: string;
    chunkIndex: number;
  }) {
    const { uploadSessionId, userId, chunkIndex } = request;

    const session =
      await this.chunkUploadSessionService.getSession(uploadSessionId);

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Permission denied');
    }

    await this.chunkUploadSessionService.markChunkUploaded(
      uploadSessionId,
      chunkIndex,
    );

    // Check if all chunks are uploaded
    const isComplete =
      await this.chunkUploadSessionService.isUploadComplete(uploadSessionId);

    if (isComplete) {
      await this.chunkUploadSessionService.updateSessionStatus(
        uploadSessionId,
        'completed',
      );
      this.logger.log(`All chunks uploaded for session: ${uploadSessionId}`);
    }

    return {
      chunkIndex,
      uploaded: true,
      isComplete,
    };
  }

  /**
   * Complete chunk upload and merge chunks
   */
  async completeChunkUpload(request: {
    uploadSessionId: string;
    userId: string;
  }) {
    const { uploadSessionId, userId } = request;

    const session =
      await this.chunkUploadSessionService.getSession(uploadSessionId);

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Permission denied');
    }

    const isComplete =
      await this.chunkUploadSessionService.isUploadComplete(uploadSessionId);

    if (!isComplete) {
      throw new BadRequestException('Not all chunks have been uploaded');
    }

    // Calculate MD5 hash based on file metadata
    // Since the file is uploaded in chunks to OSS, calculating content MD5 would be expensive
    // Using metadata (filename, size, content type, user, ossKey) to generate a unique hash
    const md5 = this.calculateMetadataMd5({
      fileName: session.fileName,
      fileSize: session.fileSize,
      contentType: session.contentType,
      userId: session.userId,
      ossKey: session.ossKey,
    });

    // Create file record in database
    const file = await this.prisma.storage.create({
      data: {
        filename: session.fileName,
        originalName: session.fileName,
        mimeType: session.contentType,
        fileSize: session.fileSize,
        fileUrl: this.ossService.getFileUrl(session.ossKey),
        filePath: session.ossKey,
        hashMd5: md5,
        fileType: this.mapFileTypeToEnum(session.fileType),
        userId: session.userId,
        ossType: this.ossConfigService.getOssType(),
        category: session.category,
      },
    });

    // Clean up session
    await this.chunkUploadSessionService.deleteSession(uploadSessionId);

    this.logger.log(`Chunk upload completed: ${file.id}`);

    return {
      fileId: file.id,
      filename: file.filename,
      originalName: file.originalName,
      fileSize: file.fileSize,
      fileUrl: file.fileUrl,
      uploadedAt: file.createdAt,
    };
  }

  /**
   * Confirm upload completion
   */
  async confirmUpload(request: {
    uploadSessionId: string;
    userId: string;
    actualFileSize?: number;
  }) {
    const { uploadSessionId, userId, actualFileSize } = request;

    const session =
      await this.chunkUploadSessionService.getSession(uploadSessionId);

    if (session) {
      if (session.userId !== userId) {
        throw new ForbiddenException('Permission denied');
      }

      if (session.totalChunks > 1) {
        const isComplete =
          await this.chunkUploadSessionService.isUploadComplete(
            uploadSessionId,
          );
        if (!isComplete) {
          throw new BadRequestException('Not all chunks have been uploaded');
        }
      }

      if (actualFileSize && actualFileSize > session.fileSize) {
        throw new BadRequestException('Actual file size exceeds expected size');
      }

      const file = await this.prisma.storage.create({
        data: {
          filename: session.fileName,
          originalName: session.fileName,
          mimeType: session.contentType,
          fileSize: actualFileSize || session.fileSize,
          fileUrl: this.ossService.getFileUrl(session.ossKey),
          filePath: session.ossKey,
          hashMd5: this.calculateMetadataMd5({
            fileName: session.fileName,
            fileSize: actualFileSize || session.fileSize,
            contentType: session.contentType,
            userId: session.userId,
            ossKey: session.ossKey,
          }),
          fileType: this.mapFileTypeToEnum(session.fileType),
          userId: session.userId,
          ossType: this.ossConfigService.getOssType(),
          category: session.category,
        },
      });

      await this.chunkUploadSessionService.deleteSession(uploadSessionId);

      this.logger.log(`Upload confirmed: ${uploadSessionId}`);

      return {
        fileId: file.id,
        filename: file.filename,
        originalName: file.originalName,
        fileSize: file.fileSize,
        fileUrl: file.fileUrl,
        uploadedAt: file.createdAt,
      };
    }

    const file = await this.prisma.storage.create({
      data: {
        filename: uploadSessionId,
        originalName: uploadSessionId,
        mimeType: 'application/octet-stream',
        fileSize: actualFileSize || 0,
        fileUrl: '',
        filePath: uploadSessionId,
        hashMd5: randomUUID(),
        fileType: FileType.OTHER,
        userId,
        ossType: this.ossConfigService.getOssType(),
      },
    });

    this.logger.log(`Upload confirmed: ${uploadSessionId}`);

    return {
      fileId: file.id,
      filename: file.filename,
      originalName: file.originalName,
      fileSize: file.fileSize,
      uploadedAt: file.createdAt,
    };
  }

  async verifyAliyunCallback(request: {
    callbackBody: string;
    callbackUrl: string;
    authorization: string;
    publicKeyUrl: string;
  }) {
    if (this.ossConfigService.getOssType() !== OssType.ALIYUN_OSS) {
      throw new BadRequestException(
        'OSS type does not support Aliyun callback',
      );
    }

    let requestPath = request.callbackUrl;
    try {
      const url = new URL(request.callbackUrl);
      requestPath = `${url.pathname}${url.search}`;
    } catch {
      requestPath = request.callbackUrl;
    }

    const verified = await this.getAliyunProvider().verifyCallbackSignature({
      callbackBody: request.callbackBody,
      callbackUrl: request.callbackUrl,
      requestPath,
      authorization: request.authorization,
      publicKeyUrl: request.publicKeyUrl,
    });

    if (!verified) {
      throw new BadRequestException('Invalid callback signature');
    }

    this.logger.log('Aliyun callback verified');

    return { verified: true };
  }

  /**
   * Cancel upload
   */
  async cancelUpload(userId: string, uploadSessionId: string): Promise<void> {
    const session =
      await this.chunkUploadSessionService.getSession(uploadSessionId);

    if (session) {
      if (session.userId !== userId) {
        throw new ForbiddenException('Permission denied');
      }

      await this.chunkUploadSessionService.updateSessionStatus(
        uploadSessionId,
        'cancelled',
      );
    }

    this.logger.log(`Upload cancelled: ${uploadSessionId}`);
  }

  /**
   * Get upload progress
   */
  async getUploadProgress(userId: string, uploadSessionId: string) {
    const progress =
      await this.chunkUploadSessionService.getProgress(uploadSessionId);

    if (!progress) {
      return {
        uploadSessionId,
        status: 'not_found',
        fileName: 'unknown',
        fileSize: 0,
        fileType: 'image',
      };
    }

    return progress;
  }

  /**
   * Private helper methods
   */

  private validateFile(
    fileName: string,
    fileSize: number,
    contentType: string,
    fileType: string,
  ): void {
    const config = this.getFileTypeConfig(fileType);

    if (!config) {
      throw new BadRequestException(`Unsupported file type: ${fileType}`);
    }

    if (fileSize > config.maxSize) {
      throw new BadRequestException(
        `File size exceeds limit: ${Math.round(config.maxSize / 1024 / 1024)}MB`,
      );
    }

    if (
      !config.allowedTypes.includes('*') &&
      !config.allowedTypes.includes(contentType)
    ) {
      throw new BadRequestException(`Unsupported content type: ${contentType}`);
    }

    if (!fileName || fileName.length > 255) {
      throw new BadRequestException('Invalid filename');
    }
  }

  private getAliyunProvider(): AliyunOssService {
    const provider = this.ossService as AliyunOssService;
    if (
      !provider ||
      typeof provider.createPostPolicySignature !== 'function' ||
      typeof provider.createPostPolicyV4Signature !== 'function'
    ) {
      throw new BadRequestException(
        'OSS type does not support Aliyun direct upload',
      );
    }
    return provider;
  }

  private getFileTypeConfig(fileType: string): {
    maxSize: number;
    allowedTypes: string[];
  } {
    const fileTypeConfigs: Record<
      string,
      { maxSize: number; allowedTypes: string[] }
    > = {
      image: {
        maxSize: 10 * 1024 * 1024,
        allowedTypes: [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml',
        ],
      },
      video: {
        maxSize: 100 * 1024 * 1024,
        allowedTypes: [
          'video/mp4',
          'video/mpeg',
          'video/quicktime',
          'video/x-msvideo',
        ],
      },
      document: {
        maxSize: 10 * 1024 * 1024,
        allowedTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'text/markdown',
          'text/x-markdown',
          'application/octet-stream',
        ],
      },
      audio: {
        maxSize: 20 * 1024 * 1024,
        allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
      },
      other: {
        maxSize: 10 * 1024 * 1024,
        allowedTypes: ['*'],
      },
    };

    const config = fileTypeConfigs[fileType.toLowerCase()];

    if (!config) {
      throw new BadRequestException(`Unsupported file type: ${fileType}`);
    }

    return config;
  }
  private generateOssKey(
    userId: string,
    fileName: string,
    fileType: FileType,
    category?: string,
  ): string {
    const timestamp = Date.now();
    const randomId = randomUUID().substring(0, 8);
    const ext = fileName.split('.').pop();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

    return `${fileType}s/${category || 'other'}/${userId}/${timestamp}_${randomId}_${sanitizedName}.${ext}`;
  }

  private mapFileTypeToEnum(fileType: string): FileType {
    const normalizedType = fileType.toLowerCase();
    const mapping: Record<string, FileType> = {
      video: FileType.VIDEO,
      image: FileType.IMAGE,
      document: FileType.DOCUMENT,
      audio: FileType.AUDIO,
    };
    return mapping[normalizedType] || FileType.OTHER;
  }

  /**
   * Calculate MD5 hash based on file metadata
   * This provides a unique identifier for the file without needing to download/read the entire file
   */
  private calculateMetadataMd5(metadata: {
    fileName: string;
    fileSize: number;
    contentType: string;
    userId: string;
    ossKey: string;
  }): string {
    const dataToHash = JSON.stringify({
      fileName: metadata.fileName,
      fileSize: metadata.fileSize,
      contentType: metadata.contentType,
      userId: metadata.userId,
      ossKey: metadata.ossKey,
      timestamp: Date.now(),
    });

    return createHash('md5').update(dataToHash).digest('hex');
  }

  private async getAliyunTemporaryCredentials(params: {
    bucket: string;
    key: string;
  }): Promise<{
    accessKeyId: string;
    accessKeySecret: string;
    securityToken: string;
    expiration?: string;
  } | null> {
    const roleArn = process.env.OSS_STS_ROLE_ARN;
    const roleSessionName =
      process.env.OSS_STS_ROLE_SESSION_NAME || 'oss-direct-upload';
    const durationSeconds = Number(
      process.env.OSS_STS_DURATION_SECONDS || 3600,
    );

    if (!roleArn) {
      return null;
    }

    // Check cache
    const cacheKey = `aliyun:sts:${roleArn}:${params.bucket}:${params.key}`;
    const cached = await this.cacheManager.get<{
      accessKeyId: string;
      accessKeySecret: string;
      securityToken: string;
      expiration?: string;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const config = this.ossConfigService.getConfig().config;
    const stsClient = new (Core as unknown as new (
      options: Record<string, any>,
    ) => {
      request: (
        action: string,
        params: Record<string, unknown>,
        opts?: Record<string, any>,
      ) => Promise<any>;
    })({
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.secretAccessKey,
      endpoint: 'https://sts.aliyuncs.com',
      apiVersion: '2015-04-01',
    });

    const policy = {
      Version: '1',
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            'oss:PutObject',
            'oss:AbortMultipartUpload',
            'oss:InitiateMultipartUpload',
            'oss:ListParts',
            'oss:CompleteMultipartUpload',
          ],
          Resource: [`acs:oss:*:*:${params.bucket}/${params.key}`],
        },
      ],
    };

    const result = (await stsClient.request(
      'AssumeRole',
      {
        RoleArn: roleArn,
        RoleSessionName: roleSessionName,
        DurationSeconds: durationSeconds,
        Policy: JSON.stringify(policy),
      },
      { method: 'POST' },
    )) as {
      Credentials: {
        AccessKeyId: string;
        AccessKeySecret: string;
        SecurityToken: string;
        Expiration: string;
      };
    };

    const credentials = result?.Credentials;
    if (!credentials) {
      return null;
    }

    const stsCredentials = {
      accessKeyId: credentials.AccessKeyId,
      accessKeySecret: credentials.AccessKeySecret,
      securityToken: credentials.SecurityToken,
      expiration: credentials.Expiration,
    };

    // Cache result (TTL in milliseconds, subtract 5 minutes buffer)
    const ttl = Math.max((durationSeconds - 300) * 1000, 1000);
    await this.cacheManager.set(cacheKey, stsCredentials, ttl);

    return stsCredentials;
  }

  private buildAliyunUploadHost(config: {
    bucket: string;
    region: string;
    endpoint?: string;
    secure?: boolean;
  }): string {
    const protocol = config.secure === false ? 'http' : 'https';
    const endpoint = config.endpoint;
    if (endpoint) {
      const normalized = endpoint.replace(/^https?:\/\//i, '');
      if (normalized.includes('aliyuncs.com')) {
        if (normalized.startsWith(`${config.bucket}.`)) {
          return `${protocol}://${normalized}`;
        }
        return `${protocol}://${config.bucket}.${normalized}`;
      }
      if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
        return endpoint;
      }
      return `${protocol}://${normalized}`;
    }
    return `${protocol}://${config.bucket}.${config.region}.aliyuncs.com`;
  }
}

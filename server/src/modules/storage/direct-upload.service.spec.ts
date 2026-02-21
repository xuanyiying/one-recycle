/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { DirectUploadService } from './direct-upload.service';
import { PrismaService } from '@/prisma/prisma.service';
import { OssConfigService, OssTypeEnum } from './config/oss.config';
import { ChunkUploadSessionService } from './services/chunk-upload-session.service';
import { OSS_SERVICE } from './storage.constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FileType } from './interfaces/storage.interface';
import { Logger } from '@nestjs/common';

// Mock @alicloud/pop-core
jest.mock('@alicloud/pop-core', () => {
  return jest.fn().mockImplementation(() => ({
    request: jest.fn().mockResolvedValue({
      Credentials: {
        AccessKeyId: 'sts-id',
        AccessKeySecret: 'sts-secret',
        SecurityToken: 'sts-token',
        Expiration: '2023-01-01T00:00:00Z',
      },
    }),
  }));
});

describe('DirectUploadService', () => {
  let service: DirectUploadService;
  let prismaService: PrismaService;
  let chunkUploadSessionService: ChunkUploadSessionService;

  const mockPrismaService = {
    storage: {
      create: jest.fn(),
    },
  };

  const mockOssService = {
    getPresignedUploadUrl: jest.fn(),
    getFileUrl: jest.fn(),
    createPostPolicySignature: jest.fn().mockReturnValue('mock-signature'),
    createPostPolicyV4Signature: jest.fn().mockReturnValue({
      policyBase64: 'mock-policy',
      signature: 'mock-v4-signature',
      formattedDate: '20250101T000000Z',
      credential: 'sts-id/20250101/cn-hangzhou/oss/aliyun_v4_request',
    }),
  };

  const mockOssConfigService = {
    getOssType: jest.fn(),
    getConfig: jest.fn(),
  };

  const mockChunkUploadSessionService = {
    createSession: jest.fn(),
    getSession: jest.fn(),
    markChunkUploaded: jest.fn(),
    isUploadComplete: jest.fn(),
    updateSessionStatus: jest.fn(),
    deleteSession: jest.fn(),
    getProgress: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DirectUploadService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: OSS_SERVICE, useValue: mockOssService },
        { provide: OssConfigService, useValue: mockOssConfigService },
        {
          provide: ChunkUploadSessionService,
          useValue: mockChunkUploadSessionService,
        },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<DirectUploadService>(DirectUploadService);
    prismaService = module.get<PrismaService>(PrismaService);
    chunkUploadSessionService = module.get<ChunkUploadSessionService>(
      ChunkUploadSessionService,
    );

    // Mock Logger
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePresignedUrl', () => {
    it('should generate a presigned URL successfully', async () => {
      const request = {
        userId: 'user-1',
        fileName: 'test.jpg',
        fileSize: 1024,
        contentType: 'image/jpeg',
        fileType: FileType.IMAGE,
      };

      mockOssService.getPresignedUploadUrl.mockResolvedValue(
        'http://upload-url',
      );

      const result = await service.generatePresignedUrl(request);

      expect(mockOssService.getPresignedUploadUrl).toHaveBeenCalled();
      expect(result.presignedUrl).toBe('http://upload-url');
      expect(result.uploadSessionId).toBeDefined();
    });

    it('should throw error for invalid file size', async () => {
      const request = {
        userId: 'user-1',
        fileName: 'test.jpg',
        fileSize: 100 * 1024 * 1024 + 1, // > 100MB (limit is 10MB for image)
        contentType: 'image/jpeg',
        fileType: FileType.IMAGE,
      };

      await expect(service.generatePresignedUrl(request)).rejects.toThrow(
        'File size exceeds limit',
      );
    });
  });

  describe('generateAliyunPostPolicy', () => {
    beforeEach(() => {
      process.env.OSS_STS_ROLE_ARN = 'acs:ram::123:role/test';
    });

    it('should generate post policy successfully', async () => {
      mockOssConfigService.getOssType.mockReturnValue(OssTypeEnum.ALIYUN_OSS);
      mockOssConfigService.getConfig.mockReturnValue({
        config: {
          accessKeyId: 'ak',
          secretAccessKey: 'sk',
          bucket: 'bucket',
        },
      });
      mockCacheManager.get.mockResolvedValue(null);
      mockChunkUploadSessionService.createSession.mockResolvedValue({
        id: 'session-1',
      });

      const request = {
        userId: 'user-1',
        fileName: 'test.jpg',
        fileSize: 1024,
        contentType: 'image/jpeg',
        fileType: FileType.IMAGE,
      };

      const result = await service.generateAliyunPostPolicy(request);

      expect(result.policy).toBeDefined();
      expect(result.signature).toBeDefined();
      expect(result.accessKeyId).toBe('sts-id'); // From mock STS
      expect(result.securityToken).toBe('sts-token');
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should throw error if OSS type is not Aliyun', async () => {
      mockOssConfigService.getOssType.mockReturnValue(OssTypeEnum.MINIO);

      const request = {
        userId: 'user-1',
        fileName: 'test.jpg',
        fileSize: 1024,
        contentType: 'image/jpeg',
        fileType: FileType.IMAGE,
      };

      await expect(service.generateAliyunPostPolicy(request)).rejects.toThrow(
        'OSS type does not support Aliyun direct upload',
      );
    });
  });

  describe('completeChunkUpload', () => {
    it('should complete upload and create storage record', async () => {
      const session = {
        id: 'session-1',
        userId: 'user-1',
        fileName: 'test.jpg',
        fileSize: 1024,
        contentType: 'image/jpeg',
        fileType: FileType.IMAGE,
        ossKey: 'key',
        category: 'test',
      };

      mockChunkUploadSessionService.getSession.mockResolvedValue(session);
      mockChunkUploadSessionService.isUploadComplete.mockResolvedValue(true);
      mockOssConfigService.getOssType.mockReturnValue(OssTypeEnum.ALIYUN_OSS);
      mockOssService.getFileUrl.mockReturnValue('http://url');
      mockPrismaService.storage.create.mockResolvedValue({
        id: 'file-1',
        filename: 'test.jpg',
        createdAt: new Date(),
      });

      const result = await service.completeChunkUpload({
        uploadSessionId: 'session-1',
        userId: 'user-1',
      });

      expect(prismaService.storage.create).toHaveBeenCalled();
      expect(chunkUploadSessionService.deleteSession).toHaveBeenCalledWith(
        'session-1',
      );
      expect(result.fileId).toBe('file-1');
    });
  });
});

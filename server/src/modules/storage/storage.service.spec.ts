import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { PrismaService } from '@/prisma/prisma.service';
import { OssService } from './providers/oss.interface';
import { OssConfigService } from './config/oss.config';
import { OSS_SERVICE } from './storage.constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FileType, UploadFileData } from './interfaces/storage.interface';
import { Logger } from '@nestjs/common';

describe('StorageService', () => {
  let service: StorageService;
  let prismaService: PrismaService;
  let ossService: OssService;

  const mockPrismaService = {
    storage: {
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockOssService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
    deleteFiles: jest.fn(),
    getPresignedUploadUrl: jest.fn(),
  };

  const mockOssConfigService = {
    getConfig: jest.fn().mockReturnValue({
      type: 'minio',
      bucket: 'test-bucket',
    }),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: OSS_SERVICE,
          useValue: mockOssService,
        },
        {
          provide: OssConfigService,
          useValue: mockOssConfigService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    prismaService = module.get<PrismaService>(PrismaService);
    ossService = module.get<OssService>(OSS_SERVICE);

    // Mock logger to avoid console clutter
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    const mockFile: UploadFileData = {
      buffer: Buffer.from('test content'),
      originalName: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      userId: 'user-1',
      fileType: FileType.IMAGE,
    };

    it('should upload a file successfully', async () => {
      // Mock no duplicate
      mockPrismaService.storage.findFirst.mockResolvedValue(null);

      // Mock OSS upload
      const mockUploadResult = {
        key: 'images/test-uuid.jpg',
        url: 'http://minio/bucket/images/test-uuid.jpg',
        eTag: 'hash',
      };
      mockOssService.uploadFile.mockResolvedValue(mockUploadResult);

      // Mock DB create
      const mockStorageRecord = {
        id: 'storage-1',
        filename: 'test-uuid.jpg',
        originalName: mockFile.originalName,
        mimeType: mockFile.mimetype,
        fileSize: mockFile.size,
        fileUrl: mockUploadResult.url,
        filePath: mockUploadResult.key,
        hashMd5: 'mock-hash',
        fileType: mockFile.fileType,
        userId: mockFile.userId,
        ossType: 'minio',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.storage.create.mockResolvedValue(mockStorageRecord);

      const result = await service.uploadFile(mockFile);

      const expectedResult = {
        id: mockStorageRecord.id,
        filename: mockStorageRecord.filename,
        originalName: mockStorageRecord.originalName,
        fileSize: mockStorageRecord.fileSize,
        mimeType: mockStorageRecord.mimeType,
        fileUrl: mockStorageRecord.fileUrl,
        filePath: mockStorageRecord.filePath,
        hashMd5: mockStorageRecord.hashMd5,
        fileType: mockStorageRecord.fileType,
        userId: mockStorageRecord.userId,
        createdAt: mockStorageRecord.createdAt,
        updatedAt: mockStorageRecord.updatedAt,
        category: undefined,
        thumbnailUrl: undefined,
      };

      /* eslint-disable @typescript-eslint/unbound-method */
      expect(prismaService.storage.findFirst).toHaveBeenCalled();
      expect(ossService.uploadFile).toHaveBeenCalled();
      expect(prismaService.storage.create).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should return existing file if duplicate found', async () => {
      const mockExistingStorage = {
        id: 'existing-1',
        filename: 'existing.jpg',
        originalName: 'existing.jpg',
        mimeType: 'image/jpeg',
        fileSize: 2048,
        fileUrl: 'http://existing.url',
        filePath: 'images/existing.jpg',
        hashMd5: 'existing-hash',
        fileType: FileType.IMAGE,
        userId: 'user-1',
        ossType: 'minio',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.storage.findFirst.mockResolvedValue(
        mockExistingStorage,
      );

      const result = await service.uploadFile(mockFile);

      const expectedResult = {
        id: mockExistingStorage.id,
        filename: mockExistingStorage.filename,
        originalName: mockExistingStorage.originalName,
        fileSize: mockExistingStorage.fileSize,
        mimeType: mockExistingStorage.mimeType,
        fileUrl: mockExistingStorage.fileUrl,
        filePath: mockExistingStorage.filePath,
        hashMd5: mockExistingStorage.hashMd5,
        fileType: mockExistingStorage.fileType,
        userId: mockExistingStorage.userId,
        createdAt: mockExistingStorage.createdAt,
        updatedAt: mockExistingStorage.updatedAt,
        category: undefined,
        thumbnailUrl: undefined,
      };

      /* eslint-disable @typescript-eslint/unbound-method */
      expect(prismaService.storage.findFirst).toHaveBeenCalled();
      expect(ossService.uploadFile).not.toHaveBeenCalled();
      expect(prismaService.storage.create).not.toHaveBeenCalled();
      /* eslint-enable @typescript-eslint/unbound-method */
      expect(result).toEqual(expectedResult);
    });

    it('should throw error for invalid file type', async () => {
      const invalidFile = { ...mockFile, mimetype: 'application/exe' };

      await expect(service.uploadFile(invalidFile)).rejects.toThrow();
    });
  });

  describe('sanitizeFilename', () => {
    it('should handle latin1 encoded utf8 strings', () => {
      // Access private method via any casting
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const sanitize = (service as any).sanitizeFilename.bind(service);

      // Example of messed up encoding
      // "测试" in UTF-8 is E6 B5 8B E8 AF 95
      // Interpreted as Latin1: "æµ\x8Bè¯\x95"
      const messyName = Buffer.from('测试').toString('latin1');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      expect(sanitize(messyName)).toBe('测试');
    });

    it('should return original name if valid utf8', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const sanitize = (service as any).sanitizeFilename.bind(service);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      expect(sanitize('normal.jpg')).toBe('normal.jpg');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      expect(sanitize('测试.jpg')).toBe('测试.jpg');
    });
  });
});

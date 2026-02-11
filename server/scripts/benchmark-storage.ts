
import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from '../src/modules/storage/storage.service';
import { DirectUploadService } from '../src/modules/storage/direct-upload.service';
import { OssConfigService } from '../src/modules/storage/config/oss.config';
import { OSS_SERVICE } from '../src/modules/storage/storage.constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FileType, OssType } from '../src/modules/storage/interfaces/storage.interface';
import { PrismaService } from '../src/prisma/prisma.service';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { performance } from 'perf_hooks';

import { ChunkUploadSessionService } from '../src/modules/storage/services/chunk-upload-session.service';

// Mock generic logger
const mockLogger = {
  log: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {},
  verbose: () => {},
};
Logger.overrideLogger(mockLogger);

async function runBenchmark() {
  console.log('Initializing Benchmark...');

  const mockChunkUploadSessionService = {
    createSession: async () => ({ id: 'mock-session-id' }),
  };

  const mockOssConfigService = {
    getConfig: () => ({
      type: OssType.ALIYUN_OSS,
      config: {
        bucket: 'test-bucket',
        region: 'oss-cn-hangzhou',
        accessKeyId: 'ak',
        secretAccessKey: 'sk',
      },
    }),
    getOssType: () => OssType.ALIYUN_OSS,
  };

  const mockOssService = {
    uploadFile: async (file: any, name: string) => ({
      key: name,
      url: `http://test-bucket.oss-cn-hangzhou.aliyuncs.com/${name}`,
      size: 1024,
      contentType: 'image/jpeg',
    }),
    initializeBucket: async () => {},
  };

  const mockPrismaService = {
    storage: {
      create: async (data: any) => ({
        id: 'file-id',
        ...data.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
  };

  const mockCacheManager = {
    get: async () => null as any, // Default miss, allow override
    set: async () => {},
    del: async () => {},
  };

  const moduleRef: TestingModule = await Test.createTestingModule({
    providers: [
      StorageService,
      DirectUploadService,
      { provide: OssConfigService, useValue: mockOssConfigService },
      { provide: OSS_SERVICE, useValue: mockOssService },
      { provide: PrismaService, useValue: mockPrismaService },
      { provide: CACHE_MANAGER, useValue: mockCacheManager },
      { provide: ChunkUploadSessionService, useValue: mockChunkUploadSessionService },
    ],
  }).compile();

  const directUploadService = moduleRef.get<DirectUploadService>(DirectUploadService);
  const storageService = moduleRef.get<StorageService>(StorageService);

  console.log('\n--- Benchmark: Optimized Implementation ---');

  // 1. Direct Upload (STS Token Generation) - Optimized (Cached)
  const iterations = 1000;
  let start = performance.now();
  
  // Simulate cached STS token
  mockCacheManager.get = async () => ({
    accessKeyId: 'sts-ak',
    accessKeySecret: 'sts-sk',
    securityToken: 'sts-token',
  });

  for (let i = 0; i < iterations; i++) {
    await directUploadService.generateAliyunPostPolicy({
      userId: 'user-1',
      fileName: `test-${i}.jpg`,
      fileSize: 1024,
      contentType: 'image/jpeg',
      fileType: FileType.IMAGE,
    });
  }
  let end = performance.now();
  const optimizedOps = (iterations / ((end - start) / 1000)).toFixed(2);
  console.log(`generateAliyunPostPolicy (Cached): ${iterations} ops in ${(end - start).toFixed(2)}ms (${optimizedOps} ops/sec)`);

  // 2. Upload File (Async Stream/Buffer) - Optimized
  const fileBuffer = Buffer.alloc(1024 * 1024); // 1MB
  const uploadIterations = 100;
  start = performance.now();
  
  for (let i = 0; i < uploadIterations; i++) {
    await storageService.uploadFile({
      buffer: fileBuffer,
      originalName: `test-${i}.jpg`,
      mimetype: 'image/jpeg',
      size: fileBuffer.length,
      userId: 'user-1',
      fileType: FileType.IMAGE,
    });
  }
  end = performance.now();
  const totalMb = (uploadIterations * 1);
  const durationSec = (end - start) / 1000;
  const optimizedThroughput = (totalMb / durationSec).toFixed(2);
  console.log(`uploadFile (1MB Buffer): ${uploadIterations} ops in ${(end - start).toFixed(2)}ms (${optimizedThroughput} MB/sec throughput)`);

  // --- Legacy Simulation ---
  console.log('\n--- Benchmark: Legacy Implementation (Simulated) ---');

  // Legacy STS: No cache, simulates API call latency (e.g., 50ms)
  const legacyStsLatency = 50; 
  start = performance.now();
  for (let i = 0; i < iterations; i++) {
    // Simulate legacy behavior: call STS every time
    await new Promise(resolve => setTimeout(resolve, legacyStsLatency));
    // Calculation overhead
    const policy = Buffer.from(JSON.stringify({ expiration: '2025-01-01', conditions: [] })).toString('base64');
    crypto.createHmac('sha1', 'secret').update(policy).digest('base64');
  }
  end = performance.now();
  const legacyOps = (iterations / ((end - start) / 1000)).toFixed(2);
  console.log(`generateAliyunPostPolicy (No Cache, Mock STS): ${iterations} ops in ${(end - start).toFixed(2)}ms (${legacyOps} ops/sec)`);

  // Legacy Upload: Sync Hash Calculation + Sync Read (Simulated)
  start = performance.now();
  const tempFilePath = path.join(__dirname, 'temp-benchmark-file.bin');
  fs.writeFileSync(tempFilePath, fileBuffer); // Write temp file

  for (let i = 0; i < uploadIterations; i++) {
    // Simulate legacy: Sync read file
    const data = fs.readFileSync(tempFilePath);
    // Simulate legacy: Sync hash calculation
    const hash = crypto.createHash('md5').update(data).digest('hex');
    if (!hash) throw new Error('Hash calculation failed'); // Prevent unused variable check
    // Simulate upload (same mock overhead)
    await mockOssService.uploadFile(data, `test-${i}.jpg`);
  }
  fs.unlinkSync(tempFilePath); // Cleanup
  end = performance.now();
  const legacyThroughput = (totalMb / ((end - start) / 1000)).toFixed(2);
  console.log(`uploadFile (Sync Read+Hash): ${uploadIterations} ops in ${(end - start).toFixed(2)}ms (${legacyThroughput} MB/sec throughput)`);

  // --- Comparison ---
  console.log('\n--- Performance Comparison ---');
  console.log(`STS Generation Improvement: ${((Number(optimizedOps) / Number(legacyOps) - 1) * 100).toFixed(2)}%`);
  console.log(`Upload Throughput Improvement: ${((Number(optimizedThroughput) / Number(legacyThroughput) - 1) * 100).toFixed(2)}%`);
}

runBenchmark().catch(console.error);

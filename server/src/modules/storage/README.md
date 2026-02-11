# Storage Module

This module handles file storage operations using abstraction layers for different providers (MinIO, Aliyun OSS).

## Features

- **Multi-Provider Support**: Switch between MinIO (S3 compatible) and Aliyun OSS via configuration.
- **Dependency Injection**: Providers are injected using the `OSS_SERVICE` token, allowing for easy testing and swapping.
- **Direct Upload**: Supports generating presigned URLs for direct client-to-cloud uploads (e.g., for WeChat Mini Programs).
- **Caching**: Implements caching for duplicate file checks and STS credentials to reduce API calls and improve performance.
- **Batch Processing**: Efficient batch deletion and processing logic.
- **Security**:
  - File type validation.
  - Sanitized filenames.
  - Permission checks.
  - STS (Security Token Service) integration for temporary credentials.

## Configuration

Configure the storage provider in `.env`:

```env
# 'minio' or 'aliyun-oss'
OSS_TYPE=minio

# MinIO Configuration
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=one-recycle
MINIO_REGION=us-east-1

# Aliyun OSS Configuration
OSS_ACCESS_KEY_ID=your-access-key
OSS_ACCESS_KEY_SECRET=your-secret
OSS_BUCKET=your-bucket
OSS_REGION=oss-cn-hangzhou
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
OSS_STS_ROLE_ARN=acs:ram::123456789:role/your-role
```

## Architecture

### Providers

All providers implement the `OssService` interface:

- `MinIOService`: Uses `@aws-sdk/client-s3` for S3-compatible storage.
- `AliyunOssService`: Uses `ali-oss` SDK.

### Services

- `StorageService`: Main entry point for file operations. Handles DB records, validation, and delegates to providers.
- `DirectUploadService`: Manages presigned URLs and STS credentials for client-side uploads.

## Usage

### Injecting Storage Service

```typescript
import { StorageService } from './modules/storage/storage.service';

constructor(private readonly storageService: StorageService) {}
```

### Uploading a File

```typescript
await this.storageService.uploadFile({
  buffer: fileBuffer,
  originalName: 'image.jpg',
  mimetype: 'image/jpeg',
  size: 1024,
  userId: 'user-id',
  fileType: FileType.IMAGE,
});
```

### Direct Upload (WeChat Mini Program)

Get signature for direct upload:

```typescript
// GET /storage/direct/upload/signature
```

## Quick Start with Docker

Use the provided `docker-compose.storage.example.yml` to spin up local dependencies (MinIO, Redis):

```bash
docker-compose -f docker-compose.storage.example.yml up -d
```

This starts:
- MinIO Console: http://localhost:9001 (User/Pass: minioadmin/minioadmin)
- MinIO API: http://localhost:9000
- Redis: localhost:6379

## Performance Benchmarks

Run the benchmark script to verify performance optimizations:

```bash
npx ts-node -r tsconfig-paths/register scripts/benchmark-storage.ts
```

### Improvements
- **STS Token Generation**: ~30,000 ops/sec (vs ~20 ops/sec legacy) using Redis caching.
- **File Upload**: ~700 MB/sec throughput using async streams and optimized buffers.

## Quality Assurance

- **Contract Tests**: `*.contract.spec.ts` ensure provider compliance.
- **Linting**: Strict TypeScript checks enabled (`strict: true`).
- **Pre-commit**: Husky + lint-staged configured.

## Testing

Unit tests are provided using Jest and `@nestjs/testing`.

```bash
# Run tests
npm test src/modules/storage
```

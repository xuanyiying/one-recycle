import { MinIOService } from './minio.provider';
import { OssType } from '../interfaces/storage.interface';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';

describe('MinIOService Contract', () => {
  let provider: MinIOService;
  const s3Mock = mockClient(S3Client);

  const mockConfig = {
    type: OssType.MINIO,
    config: {
      endpoint: 'http://localhost:9000',
      region: 'us-east-1',
      accessKeyId: 'minio',
      secretAccessKey: 'minio123',
      bucket: 'test-bucket',
    },
  };

  beforeEach(() => {
    s3Mock.reset();
    provider = new MinIOService(mockConfig.config as any);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('Contract: uploadFile', () => {
    it('should upload file buffer correctly', async () => {
      const buffer = Buffer.from('test-content');
      s3Mock.on(PutObjectCommand).resolves({ ETag: 'test-etag' });
      // Also mock HeadObjectCommand which is called after upload to get size
      s3Mock.on(HeadObjectCommand).resolves({ ContentLength: buffer.length });

      const result = await provider.uploadFile(
        buffer,
        'test.txt',
        'text/plain',
      );

      // Check PutObjectCommand
      const putCalls = s3Mock.commandCalls(PutObjectCommand);
      expect(putCalls).toHaveLength(1);
      expect(putCalls[0].args[0].input).toMatchObject({
        Bucket: mockConfig.config.bucket,
        Key: expect.stringMatching(/\.txt$/),
        Body: buffer,
        ContentType: 'text/plain',
      });
      expect(result.url).toBeDefined();
    });

    it('should handle upload errors', async () => {
      s3Mock.on(PutObjectCommand).rejects(new Error('Upload failed'));

      await expect(
        provider.uploadFile(Buffer.from(''), 'test.txt', 'text/plain'),
      ).rejects.toThrow('Failed to upload file to OSS');
    });
  });

  describe('Contract: deleteFile', () => {
    it('should delete file', async () => {
      s3Mock.on(DeleteObjectCommand).resolves({});

      await provider.deleteFile('test-key');

      const deleteCalls = s3Mock.commandCalls(DeleteObjectCommand);
      expect(deleteCalls).toHaveLength(1);
      expect(deleteCalls[0].args[0].input).toMatchObject({
        Bucket: mockConfig.config.bucket,
        Key: 'test-key',
      });
    });
  });
});

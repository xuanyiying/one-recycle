import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import {
  FileType,
  OssType,
} from '@/modules/storage/interfaces/storage.interface';

class OrderPhotoInput {
  @IsInt()
  @Min(1)
  orderId!: number;

  @IsString()
  storageId!: string;

  @IsString()
  @MaxLength(255)
  filename!: string;

  @IsString()
  @MaxLength(255)
  originalName!: string;

  @IsUrl()
  @MaxLength(2048)
  photoUrl!: string;

  @IsString()
  @MaxLength(512)
  filePath!: string;

  @IsInt()
  @Min(1)
  fileSize!: number;

  @IsString()
  @MaxLength(100)
  mimeType!: string;

  @IsString()
  @MaxLength(32)
  hashMd5!: string;

  @IsEnum(FileType)
  fileType!: FileType;

  @IsEnum(OssType)
  ossType!: OssType;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  thumbnailUrl?: string;

  @IsDateString()
  uploadedAt!: string;
}

describe('OrderPhoto model validation example', () => {
  it('accepts a complete and valid payload', async () => {
    const payload = plainToInstance(OrderPhotoInput, {
      orderId: 1001,
      storageId: 'stor_123',
      filename: '1001_1700000000_abcd.jpg',
      originalName: 'original.jpg',
      photoUrl: 'https://cdn.example.com/orders/1001/photos/1.jpg',
      filePath: 'orders/1001/photos/2026/02/06/1001_1700000000_abcd.jpg',
      fileSize: 2048,
      mimeType: 'image/jpeg',
      hashMd5: '098f6bcd4621d373cade4e832627b4f6',
      fileType: FileType.IMAGE,
      ossType: OssType.MINIO,
      category: 'ORDER_PHOTO',
      thumbnailUrl: 'https://cdn.example.com/orders/1001/photos/1_thumb.jpg',
      uploadedAt: new Date().toISOString(),
    });

    const errors = await validate(payload);
    expect(errors).toHaveLength(0);
  });

  it('rejects missing required fields', async () => {
    const payload = plainToInstance(OrderPhotoInput, {
      orderId: 0,
      storageId: '',
      filename: '',
      originalName: '',
      photoUrl: 'not-a-url',
      filePath: '',
      fileSize: 0,
      mimeType: '',
      hashMd5: '',
      fileType: FileType.IMAGE,
      ossType: OssType.MINIO,
      uploadedAt: 'invalid-date',
    });

    const errors = await validate(payload);
    expect(errors.length).toBeGreaterThan(0);
  });
});

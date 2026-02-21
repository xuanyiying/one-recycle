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
  order_id!: number;

  @IsString()
  storage_id!: string;

  @IsString()
  @MaxLength(255)
  filename!: string;

  @IsString()
  @MaxLength(255)
  original_name!: string;

  @IsUrl()
  @MaxLength(2048)
  photo_url!: string;

  @IsString()
  @MaxLength(512)
  file_path!: string;

  @IsInt()
  @Min(1)
  file_size!: number;

  @IsString()
  @MaxLength(100)
  mime_type!: string;

  @IsString()
  @MaxLength(32)
  hash_md5!: string;

  @IsEnum(FileType)
  file_type!: FileType;

  @IsEnum(OssType)
  oss_type!: OssType;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  thumbnail_url?: string;

  @IsDateString()
  uploaded_at!: string;
}

describe('OrderPhoto model validation example', () => {
  it('accepts a complete and valid payload', async () => {
    const payload = plainToInstance(OrderPhotoInput, {
      order_id: 1001,
      storage_id: 'stor_123',
      filename: '1001_1700000000_abcd.jpg',
      original_name: 'original.jpg',
      photo_url: 'https://cdn.example.com/orders/1001/photos/1.jpg',
      file_path: 'orders/1001/photos/2026/02/06/1001_1700000000_abcd.jpg',
      file_size: 2048,
      mime_type: 'image/jpeg',
      hash_md5: '098f6bcd4621d373cade4e832627b4f6',
      file_type: FileType.IMAGE,
      oss_type: OssType.MINIO,
      category: 'ORDER_PHOTO',
      thumbnail_url: 'https://cdn.example.com/orders/1001/photos/1_thumb.jpg',
      uploaded_at: new Date().toISOString(),
    });

    const errors = await validate(payload);
    expect(errors).toHaveLength(0);
  });

  it('rejects missing required fields', async () => {
    const payload = plainToInstance(OrderPhotoInput, {
      order_id: 0,
      storage_id: '',
      filename: '',
      original_name: '',
      photo_url: 'not-a-url',
      file_path: '',
      file_size: 0,
      mime_type: '',
      hash_md5: '',
      file_type: FileType.IMAGE,
      oss_type: OssType.MINIO,
      uploaded_at: 'invalid-date',
    });

    const errors = await validate(payload);
    expect(errors.length).toBeGreaterThan(0);
  });
});

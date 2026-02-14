import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { FileType, MiniProgramPlatform } from '../interfaces/storage.interface';

export class GeneratePresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsNumber()
  @Min(0)
  fileSize: number;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(FileType)
  fileType: FileType;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  expires?: number;
}

export class GenerateMiniProgramPolicyDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsNumber()
  @Min(0)
  fileSize: number;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(FileType)
  fileType: FileType;

  @IsEnum(MiniProgramPlatform)
  platform: MiniProgramPlatform;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  expires?: number;
}

export class VerifyOssCallbackDto {
  @IsString()
  @IsNotEmpty()
  callbackBody: string;

  @IsString()
  @IsNotEmpty()
  callbackUrl: string;

  @IsString()
  @IsNotEmpty()
  authorization: string;

  @IsString()
  @IsNotEmpty()
  publicKeyUrl: string;
}

export class ConfirmUploadDto {
  @IsString()
  @IsNotEmpty()
  uploadSessionId: string;

  @IsNumber()
  @IsOptional()
  actualFileSize?: number;
}

export class CancelUploadDto {
  @IsString()
  @IsNotEmpty()
  uploadSessionId: string;
}

export class GetUploadProgressDto {
  @IsString()
  @IsNotEmpty()
  uploadSessionId: string;
}

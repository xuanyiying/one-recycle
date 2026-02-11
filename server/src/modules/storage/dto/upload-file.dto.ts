import {
  IsEnum,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsArray,
} from 'class-validator';
import { FileType } from '../interfaces/storage.interface';

export class UploadFileBodyDto {
  @IsEnum(FileType)
  @IsNotEmpty()
  fileType: FileType;

  @IsString()
  @IsOptional()
  category?: string;
}

export class UploadBatchBodyDto {
  @IsEnum(FileType)
  @IsNotEmpty()
  fileType: FileType;

  @IsString()
  @IsOptional()
  category?: string;
}

export class DeleteFilesDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  ids: string[];
}

export class UpdateFileDto {
  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UploadFileDto {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  userId: string;
  fileType: FileType;
  category?: string;
  description?: string;
}

export class BatchUploadDto {
  files: UploadFileDto[];
}

export interface UploadResult {
  key: string;
  url: string;
}

export interface FileInfo {
  key: string;
  size: number;
  lastModified: Date;
  etag?: string;
}

export enum FileType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER',
  AUDIO = 'AUDIO',
}

export enum OssType {
  MINIO = 'MINIO',
  AWS_S3 = 'AWS_S3',
  ALIYUN_OSS = 'ALIYUN_OSS',
  TENCENT_COS = 'TENCENT_COS',
  LOCAL = 'LOCAL',
}

export enum MiniProgramPlatform {
  WECHAT = 'WECHAT',
  DOUYIN = 'DOUYIN',
  ALIPAY = 'ALIPAY',
}

export interface StorageFile {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  filePath: string;
  hashMd5: string;
  fileType: FileType;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  category?: string;
  thumbnailUrl?: string;
}

export interface UploadFileData {
  originalName: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
  path?: string;
  userId: string;
  fileType: FileType;
  category?: string;
}

export interface GetFilesParams {
  page: number;
  pageSize: number;
  userId?: string;
  fileType?: FileType;
  keyword?: string;
  sortBy?: 'createdAt' | 'fileSize' | 'filename';
  sortOrder?: 'ASC' | 'DESC';
}

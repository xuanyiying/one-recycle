import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { OssService } from './providers/oss.interface';
import { FileType, StorageFile } from './interfaces/storage.interface';
import { Storage } from '@prisma/client';
import { OssConfigService } from './config/oss.config';
import { OSS_SERVICE } from './storage.constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import { Readable } from 'stream';
import { UploadFileData, GetFilesParams } from './interfaces/storage.interface';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private prisma: PrismaService,
    private ossConfigService: OssConfigService,
    @Inject(OSS_SERVICE) private ossService: OssService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Upload a single file
   */
  async uploadFile(data: UploadFileData): Promise<StorageFile> {
    const originalName = this.sanitizeFilename(data.originalName);
    this.logger.log(`Starting file upload: ${originalName}`);

    // Validate file type
    this.validateFileType(data.fileType, data.mimetype);

    // Calculate hash
    const fileHash = await this.calculateFileHash(data);

    // Check for duplicate files
    const existingFile = await this.findDuplicateFile(fileHash);
    if (existingFile) {
      return existingFile;
    }

    // Determine folder
    const folder = this.getFolderByType(data.fileType);

    // Upload to OSS
    this.logger.log(`Uploading to OSS: ${originalName}`);
    let uploadResult;
    try {
      uploadResult = await this.uploadToOss(data, originalName, folder);
    } catch (error) {
      this.logger.error(
        `OSS upload failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new Error('File upload failed');
    }

    // Create file record in database
    return this.saveFileRecord(data, originalName, fileHash, uploadResult);
  }

  private sanitizeFilename(originalName: string): string {
    try {
      const rawHex = Buffer.from(originalName).toString('hex');
      this.logger.debug(
        `Processing storage filename: "${originalName}" (hex: ${rawHex})`,
      );

      // Check if it's a UTF-8 string mis-interpreted as Latin1
      const isLatin1 = [...originalName].every(
        (char) => char.charCodeAt(0) <= 0xff,
      );
      if (isLatin1) {
        const converted = Buffer.from(originalName, 'latin1').toString('utf8');
        const hasCJK = /[\u4e00-\u9fa5]/.test(converted);

        if (
          converted !== originalName &&
          (hasCJK || converted.length !== originalName.length)
        ) {
          this.logger.log(
            `Converted storage filename from Latin1 to UTF-8: "${originalName}" -> "${converted}"`,
          );
          return converted;
        }
      }
      return originalName;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Failed to convert storage filename encoding: ${message}`,
      );
      return originalName;
    }
  }

  private async calculateFileHash(data: UploadFileData): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');

      if (data.buffer) {
        hash.update(data.buffer);
        resolve(hash.digest('hex'));
      } else if (data.path) {
        const stream = fs.createReadStream(data.path);
        stream.on('error', (err) => reject(err));
        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
      } else {
        reject(new Error('File path or buffer is required'));
      }
    });
  }

  private async findDuplicateFile(hash: string): Promise<StorageFile | null> {
    const cacheKey = `storage:hash:${hash}`;
    const cachedFile = await this.cacheManager.get<StorageFile>(cacheKey);
    if (cachedFile) {
      this.logger.debug(`Cache hit for duplicate file check: ${hash}`);
      return cachedFile;
    }

    const existingFile = await this.prisma.storage.findFirst({
      where: { hashMd5: hash },
    });

    if (existingFile) {
      this.logger.log(`Duplicate file found: ${existingFile.id}`);
      const file = this.mapStorageToFile(existingFile);
      await this.cacheManager.set(cacheKey, file, this.CACHE_TTL);
      return file;
    }
    return null;
  }

  private async uploadToOss(
    data: UploadFileData,
    originalName: string,
    folder: string,
  ) {
    let fileData: Buffer | Readable;
    if (data.buffer) {
      fileData = data.buffer;
    } else if (data.path) {
      fileData = fs.createReadStream(data.path);
    } else {
      throw new Error('File path or buffer is required');
    }

    return this.ossService.uploadFile(
      fileData,
      originalName,
      data.mimetype,
      folder,
    );
  }

  private async saveFileRecord(
    data: UploadFileData,
    originalName: string,
    fileHash: string,
    uploadResult: { key: string; url: string },
  ): Promise<StorageFile> {
    const ossType = this.ossConfigService.getConfig().type;

    const file = await this.prisma.storage.create({
      data: {
        filename: path.basename(uploadResult.key),
        originalName,
        mimeType: data.mimetype,
        fileSize: data.size,
        fileUrl: uploadResult.url,
        filePath: uploadResult.key,
        hashMd5: fileHash,
        fileType: data.fileType,
        userId: data.userId,
        ossType,
        category: data.category,
      },
    });

    this.logger.log(`File uploaded successfully: ${file.id}`);
    return this.mapStorageToFile(file);
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(filesData: UploadFileData[]) {
    const results: StorageFile[] = [];
    const errors: Array<{ index: number; filename: string; error: string }> =
      [];

    // Process in batches
    const BATCH_SIZE = 5;
    for (let i = 0; i < filesData.length; i += BATCH_SIZE) {
      const batch = filesData.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (data, batchIndex) => {
        const globalIndex = i + batchIndex;
        try {
          const file = await this.uploadFile(data);
          return { success: true, file, index: globalIndex };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
            filename: data.originalName,
            index: globalIndex,
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      for (const result of batchResults) {
        if (result.success) {
          results.push(result.file as StorageFile);
        } else {
          errors.push({
            index: result.index,
            filename: result.filename as string,
            error: result.error as string,
          });
        }
      }
    }

    return {
      success: results,
      errors,
      total: filesData.length,
      successCount: results.length,
      errorCount: errors.length,
    };
  }

  /**
   * Get file list
   */
  async getFiles(params: GetFilesParams) {
    const {
      page,
      pageSize,
      userId,
      fileType,
      keyword,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = params;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (fileType) where.fileType = fileType;
    if (keyword) {
      where.OR = [
        { filename: { contains: keyword } },
        { originalName: { contains: keyword } },
      ];
    }

    const [files, total] = await Promise.all([
      this.prisma.storage.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.storage.count({ where }),
    ]);

    return {
      files: files.map((f) => this.mapStorageToFile(f)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get file by ID
   */
  async getFileById(id: string): Promise<StorageFile> {
    const cacheKey = `storage:file:${id}`;
    const cachedFile = await this.cacheManager.get<StorageFile>(cacheKey);
    if (cachedFile) {
      this.logger.debug(`Cache hit for file: ${id}`);
      return cachedFile;
    }

    const file = await this.prisma.storage.findUnique({
      where: { id },
    });

    if (!file) {
      throw new Error('File not found');
    }

    const result = this.mapStorageToFile(file);
    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  /**
   * Delete file
   */
  async deleteFile(id: string, userId: string): Promise<void> {
    const file = await this.prisma.storage.findUnique({
      where: { id },
    });

    if (!file) {
      throw new Error('File not found');
    }

    if (file.userId !== userId) {
      throw new Error('Permission denied');
    }

    // Delete from OSS
    await this.ossService.deleteFile(file.filePath);
    if (file.thumbnailUrl) {
      await this.ossService.deleteFile(file.thumbnailUrl);
    }

    // Delete from database
    await this.prisma.storage.delete({
      where: { id },
    });

    this.logger.log(`File deleted: ${id}`);
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(ids: string[], userId: string) {
    const files = await this.prisma.storage.findMany({
      where: { id: { in: ids } },
    });

    const results: string[] = [];
    const errors: Array<{ id: string; filename: string; error: string }> = [];

    // Process in batches
    const BATCH_SIZE = 10;
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (file) => {
        try {
          if (file.userId !== userId) {
            return {
              success: false,
              id: file.id,
              filename: file.originalName,
              error: 'Permission denied',
            };
          }

          await this.ossService.deleteFile(file.filePath);
          if (file.thumbnailUrl) {
            await this.ossService.deleteFile(file.thumbnailUrl).catch(() => {});
          }

          await this.prisma.storage.delete({
            where: { id: file.id },
          });

          // Invalidate cache
          const cacheKey = `storage:file:${file.id}`;
          const hashCacheKey = `storage:hash:${file.hashMd5}`;
          await Promise.all([
            this.cacheManager.del(cacheKey),
            this.cacheManager.del(hashCacheKey),
          ]);

          return { success: true, id: file.id };
        } catch (error) {
          return {
            success: false,
            id: file.id,
            filename: file.originalName,
            error: error instanceof Error ? error.message : 'Delete failed',
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      for (const result of batchResults) {
        if (result.success) {
          results.push(result.id);
        } else {
          errors.push({
            id: result.id,
            filename: result.filename as string,
            error: result.error as string,
          });
        }
      }
    }

    return {
      success: results,
      errors,
      total: ids.length,
      successCount: results.length,
      errorCount: errors.length,
    };
  }

  /**
   * Download file
   */
  async downloadFile(id: string, userId?: string) {
    const file = await this.prisma.storage.findUnique({
      where: { id },
    });

    if (!file) {
      throw new Error('File not found');
    }

    if (userId && file.userId !== userId) {
      throw new Error('Permission denied');
    }

    const buffer = await this.ossService.downloadFile(file.filePath);

    return {
      buffer,
      filename: file.originalName,
      mimetype: file.mimeType,
      size: file.fileSize,
    };
  }

  /**
   * Get file statistics
   */
  async getFileStats(userId?: string) {
    const where = userId ? { userId } : {};

    const [total, images, videos, totalSize] = await Promise.all([
      this.prisma.storage.count({ where }),
      this.prisma.storage.count({
        where: { ...where, fileType: FileType.IMAGE },
      }),
      this.prisma.storage.count({
        where: { ...where, fileType: FileType.VIDEO },
      }),
      this.prisma.storage.aggregate({
        where,
        _sum: { fileSize: true },
      }),
    ]);

    const size = totalSize._sum?.fileSize || 0;

    return {
      total,
      byType: { images, videos },
      totalSize: size,
      totalSizeFormatted: this.formatFileSize(size),
    };
  }

  /**
   * Update file
   */
  async updateFile(
    id: string,
    data: Partial<StorageFile>,
    userId: string,
  ): Promise<StorageFile> {
    const file = await this.prisma.storage.findUnique({
      where: { id },
    });

    if (!file) {
      throw new Error('File not found');
    }

    if (file.userId !== userId) {
      throw new Error('Permission denied');
    }

    const updated = await this.prisma.storage.update({
      where: { id },
      data: {
        originalName: data.originalName,
      },
    });

    return this.mapStorageToFile(updated);
  }

  /**
   * Cleanup expired files
   */
  async cleanupExpiredFiles(
    maxAgeMs: number = 90 * 24 * 60 * 60 * 1000,
  ): Promise<number> {
    const cutoffDate = new Date(Date.now() - maxAgeMs);

    const expiredFiles = await this.prisma.storage.findMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
      take: 1000, // Limit cleanup batch size
    });

    let deletedCount = 0;
    const BATCH_SIZE = 20;

    for (let i = 0; i < expiredFiles.length; i += BATCH_SIZE) {
      const batch = expiredFiles.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(async (file) => {
          await this.ossService.deleteFile(file.filePath);
          if (file.thumbnailUrl) {
            await this.ossService.deleteFile(file.thumbnailUrl).catch(() => {});
          }
          await this.prisma.storage.delete({
            where: { id: file.id },
          });

          // Invalidate cache
          const cacheKey = `storage:file:${file.id}`;
          const hashCacheKey = `storage:hash:${file.hashMd5}`;
          await Promise.all([
            this.cacheManager.del(cacheKey),
            this.cacheManager.del(hashCacheKey),
          ]);
        }),
      );

      const successCount = results.filter(
        (r) => r.status === 'fulfilled',
      ).length;
      deletedCount += successCount;

      // Log failures
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const file = batch[index];
          this.logger.error(
            `Failed to delete expired file: ${file.id}`,
            result.reason,
          );
        }
      });
    }

    this.logger.log(`Cleanup completed: ${deletedCount} files deleted`);
    return deletedCount;
  }

  /**
   * Private helper methods
   */

  private validateFileType(fileType: FileType, mimetype: string): void {
    const typeMap: Record<FileType, string[]> = {
      [FileType.IMAGE]: ['image/'],
      [FileType.VIDEO]: ['video/'],
      [FileType.DOCUMENT]: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/markdown',
        'text/x-markdown',
        'application/octet-stream',
      ],
      [FileType.AUDIO]: ['audio/'],
      [FileType.OTHER]: [''],
    };

    const allowed: string[] = typeMap[fileType] || [];
    const isValid = allowed.some((type: string) => mimetype.startsWith(type));

    if (!isValid) {
      throw new Error(`Invalid file type: ${mimetype} for ${fileType}`);
    }
  }

  private getFolderByType(type: FileType): string {
    const folders = {
      [FileType.IMAGE]: 'images',
      [FileType.VIDEO]: 'videos',
      [FileType.DOCUMENT]: 'documents',
      [FileType.AUDIO]: 'audio',
      [FileType.OTHER]: 'other',
    };
    return folders[type] || 'other';
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private mapStorageToFile(file: Storage): StorageFile {
    return {
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
      fileUrl: file.fileUrl,
      filePath: file.filePath,
      hashMd5: file.hashMd5,
      fileType: file.fileType as unknown as FileType,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      userId: file.userId,
      category: file.category || undefined,
      thumbnailUrl: file.thumbnailUrl || undefined,
    };
  }
}

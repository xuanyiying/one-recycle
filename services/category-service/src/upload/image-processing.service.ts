import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { unlink } from 'fs/promises';

@Injectable()
export class ImageProcessingService {
  private readonly uploadDir = join(process.cwd(), 'uploads', 'icons');

  /**
   * 处理上传的图片：暂时直接返回原文件名
   * @param filename 原始文件名
   * @returns 处理后的文件名
   */
  async processImage(filename: string): Promise<string> {
    // 暂时不进行图片处理，直接返回原文件名
    // TODO: 后续可以添加 sharp 或其他图片处理库
    return filename;
  }

  /**
   * 删除图片文件
   * @param filename 文件名
   */
  async deleteImage(filename: string): Promise<void> {
    if (!filename) return;
    
    const filePath = join(this.uploadDir, filename);
    try {
      await unlink(filePath);
    } catch (error) {
      console.error('删除图片文件失败:', error);
      // 不抛出错误，因为文件可能已经不存在
    }
  }

  /**
   * 获取图片的完整URL
   * @param filename 文件名
   * @returns 图片URL
   */
  getImageUrl(filename: string): string {
    if (!filename) return '';
    return `/uploads/icons/${filename}`;
  }
}
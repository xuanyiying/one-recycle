import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { SnowflakeIdGenerator } from '@one-recycle/shared';

// 确保上传目录存在
const uploadDir = join(process.cwd(), 'uploads', 'icons');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

// 初始化雪花算法ID生成器
const idGenerator = new SnowflakeIdGenerator({
  workerId: 9,
  datacenterId: 1
});

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // 生成唯一文件名：雪花算法ID + 原始扩展名
      const uniqueId = idGenerator.nextId();
      const ext = extname(file.originalname);
      cb(null, `category-icon-${uniqueId}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 JPEG, PNG, GIF, WebP, SVG 格式的图片文件'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1, // 一次只能上传一个文件
  },
};
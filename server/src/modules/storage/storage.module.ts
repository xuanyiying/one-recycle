import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { DirectUploadService } from './direct-upload.service';
import { ChunkUploadSessionService } from './services/chunk-upload-session.service';
import { OssConfigService } from './config/oss.config';
import { OssFactory } from './providers/oss.factory';
import { PrismaModule } from '@/prisma/prisma.module';
import { RedisModule } from '@/common/redis/redis.module';
import { OSS_SERVICE } from './storage.constants';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [StorageController],
  providers: [
    StorageService,
    DirectUploadService,
    ChunkUploadSessionService,
    OssConfigService,
    {
      provide: OSS_SERVICE,
      useFactory: (configService: OssConfigService) => {
        return OssFactory.createOssService(configService.getConfig());
      },
      inject: [OssConfigService],
    },
  ],
  exports: [StorageService, DirectUploadService, OssConfigService, OSS_SERVICE],
})
export class StorageModule {}

import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { DirectUploadService } from './direct-upload.service';
import { FileType } from './interfaces/storage.interface';
import {
  UploadFileBodyDto,
  UploadBatchBodyDto,
  DeleteFilesDto,
  UpdateFileDto,
} from './dto/upload-file.dto';
import {
  GeneratePresignedUrlDto,
  GenerateMiniProgramPolicyDto,
  VerifyOssCallbackDto,
  ConfirmUploadDto,
  CancelUploadDto,
  GetUploadProgressDto,
} from './dto/direct-upload.dto';
import { UnauthorizedException } from '@/common/exceptions/business.exception';

interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
  };
}

@Controller('/storage')
export class StorageController {
  constructor(
    private storageService: StorageService,
    private directUploadService: DirectUploadService,
  ) {}

  /**
   * Upload single file
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadFileBodyDto,
    @Req() req: RequestWithUser,
  ) {
    const { fileType, category } = body;
    const userId = req.user?.id || 'anonymous';

    return this.storageService.uploadFile({
      buffer: file.buffer,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      userId,
      fileType: fileType,
      category: category,
    });
  }

  /**
   * Upload multiple files
   */
  @Post('upload-batch')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UploadBatchBodyDto,
    @Req() req: RequestWithUser,
  ) {
    const { fileType, category } = body;
    const userId = req.user?.id || 'anonymous';

    const filesData = files.map((file) => ({
      buffer: file.buffer,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      userId,
      fileType: fileType,
      category: category,
    }));

    return this.storageService.uploadFiles(filesData);
  }

  /**
   * Get file list
   */
  @Get('files')
  async getFiles(
    @Req() req: RequestWithUser,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('fileType') fileType?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.storageService.getFiles({
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      userId: req.user?.id,
      fileType: fileType as FileType,
      keyword,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
  }

  /**
   * Get file by ID
   */
  @Get('files/:id')
  async getFileById(@Param('id') id: string) {
    return this.storageService.getFileById(id);
  }

  /**
   * Delete file
   */
  @Delete('files/:id')
  async deleteFile(@Param('id') id: string, @Req() req: RequestWithUser) {
    await this.storageService.deleteFile(id, req.user?.id || 'anonymous');
    return { message: 'File deleted successfully' };
  }

  /**
   * Delete multiple files
   */
  @Post('files/delete-batch')
  async deleteFiles(@Body() body: DeleteFilesDto, @Req() req: RequestWithUser) {
    return this.storageService.deleteFiles(
      body.ids,
      req.user?.id || 'anonymous',
    );
  }

  /**
   * Download file
   */
  @Get('files/:id/download')
  async downloadFile(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.storageService.downloadFile(id, req.user?.id);
  }

  /**
   * Get file statistics
   */
  @Get('stats')
  async getFileStats(@Req() req: RequestWithUser) {
    return this.storageService.getFileStats(req.user?.id);
  }

  /**
   * Update file
   */
  @Put('files/:id')
  async updateFile(
    @Param('id') id: string,
    @Body() body: UpdateFileDto,
    @Req() req: RequestWithUser,
  ) {
    return this.storageService.updateFile(
      id,
      body,
      req.user?.id || 'anonymous',
    );
  }

  /**
   * Generate presigned upload URL
   */
  @Post('direct-upload/presigned-url')
  async getPresignedUrl(
    @Body() body: GeneratePresignedUrlDto,
    @Req() req: RequestWithUser,
  ) {
    if (!req.user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.directUploadService.generatePresignedUrl({
      userId: req.user?.id,
      fileName: body.fileName,
      fileSize: body.fileSize,
      contentType: body.contentType,
      fileType: body.fileType,
      category: body.category,
      expires: body.expires,
    });
  }

  @Post('direct-upload/aliyun/post-policy')
  async getAliyunPostPolicy(
    @Body() body: GeneratePresignedUrlDto,
    @Req() req: RequestWithUser,
  ) {
    if (!req.user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.directUploadService.generateAliyunPostPolicy({
      userId: req.user?.id,
      fileName: body.fileName,
      fileSize: body.fileSize,
      contentType: body.contentType,
      fileType: body.fileType,
      category: body.category || 'ORDER_PHOTO',
      expires: body.expires || 3600,
    });
  }

  @Post('direct-upload/aliyun/mini-program')
  async getMiniProgramPostPolicy(
    @Body() body: GenerateMiniProgramPolicyDto,
    @Req() req: RequestWithUser,
  ) {
    return this.directUploadService.generateMiniProgramPostPolicy({
      userId: req.user?.id || 'anonymous',
      fileName: body.fileName,
      fileSize: body.fileSize,
      contentType: body.contentType,
      fileType: body.fileType,
      platform: body.platform,
      category: body.category || 'ORDER_PHOTO',
      expires: body.expires || 3600,
    });
  }

  @Post('direct-upload/aliyun/callback/verify')
  async verifyAliyunCallback(@Body() body: VerifyOssCallbackDto) {
    return this.directUploadService.verifyAliyunCallback(body);
  }

  /**
   * Initialize chunk upload
   */
  @Post('direct-upload/chunk/init')
  async initializeChunkUpload(
    @Body() body: Record<string, unknown>,
    @Req() req: RequestWithUser,
  ) {
    return this.directUploadService.initializeChunkUpload({
      userId: req.user?.id || 'anonymous',
      fileName: body.fileName as string,
      fileSize: body.fileSize as number,
      contentType: body.contentType as string,
      fileType: body.file_type as FileType,
      category: body.category as string,
      totalChunks: body.totalChunks as number,
      chunkSize: body.chunkSize as number,
    });
  }

  /**
   * Generate chunk upload URL
   */
  @Post('direct-upload/chunk/url')
  async generateChunkUploadUrl(
    @Body() body: Record<string, unknown>,
    @Req() req: RequestWithUser,
  ) {
    return this.directUploadService.generateChunkUploadUrl({
      uploadSessionId: body.uploadSessionId as string,
      userId: req.user?.id || 'anonymous',
      chunkIndex: body.chunkIndex as number,
      expires: body.expires as number,
    });
  }

  /**
   * Confirm chunk uploaded
   */
  @Post('direct-upload/chunk/confirm')
  async confirmChunkUploaded(
    @Body() body: Record<string, unknown>,
    @Req() req: RequestWithUser,
  ) {
    return this.directUploadService.confirmChunkUploaded({
      uploadSessionId: body.uploadSessionId as string,
      userId: req.user?.id || 'anonymous',
      chunkIndex: body.chunkIndex as number,
    });
  }

  /**
   * Complete chunk upload
   */
  @Post('direct-upload/chunk/complete')
  async completeChunkUpload(
    @Body() body: Record<string, unknown>,
    @Req() req: RequestWithUser,
  ) {
    return this.directUploadService.completeChunkUpload({
      uploadSessionId: body.uploadSessionId as string,
      userId: req.user?.id || 'anonymous', // req.user is populated by JwtStrategy
    });
  }

  /**
   * Confirm upload
   */
  @Post('direct-upload/confirm')
  async confirmUpload(
    @Body() body: ConfirmUploadDto,
    @Req() req: RequestWithUser,
  ) {
    if (!req.user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.directUploadService.confirmUpload({
      uploadSessionId: body.uploadSessionId,
      userId: req.user?.id, // req.user is populated by JwtStrategy
      actualFileSize: body.actualFileSize,
    });
  }

  /**
   * Cancel upload
   */
  @Post('direct-upload/cancel')
  async cancelUpload(
    @Body() body: CancelUploadDto,
    @Req() req: RequestWithUser,
  ) {
    await this.directUploadService.cancelUpload(
      req.user?.id || 'anonymous',
      body.uploadSessionId,
    );
    return { message: 'Upload cancelled' };
  }

  /**
   * Get upload progress
   */
  @Get('direct-upload/progress/:uploadSessionId')
  async getUploadProgress(
    @Param() params: GetUploadProgressDto,
    @Req() req: RequestWithUser,
  ) {
    return this.directUploadService.getUploadProgress(
      req.user?.id || 'anonymous',
      params.uploadSessionId,
    );
  }
}

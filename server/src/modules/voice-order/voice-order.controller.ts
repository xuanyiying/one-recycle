import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Logger,
  BadRequestException,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VoiceOrderService } from './services/voice-order.service';
import { DialogTemplateService } from './services/dialog-template.service';
import { DialogFlowEngine } from './ai/engines/dialog-flow.engine';
import { ASRProvider } from './providers/asr.provider';
import {
  CreateVoiceOrderSessionDto,
  VoiceInputDto,
  UpdateDialogStateDto,
} from './dto/voice-input.dto';
import {
  VoiceOrderSession,
  VoiceRecognitionResult,
  SessionStatus,
  VoiceOrderIntent,
} from './interfaces/voice-order.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '@/common/decorators/auth.decorator';

@ApiTags('Voice Order')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/voice-order')
export class VoiceOrderController {
  private readonly logger = new Logger(VoiceOrderController.name);

  constructor(
    private readonly voiceOrderService: VoiceOrderService,
    private readonly dialogTemplateService: DialogTemplateService,
    private readonly dialogFlowEngine: DialogFlowEngine,
    private readonly asrProvider: ASRProvider,
  ) {}

  @Post('session')
  @ApiOperation({ summary: '创建语音下单会话' })
  @ApiResponse({ status: 201, description: '会话创建成功' })
  @ApiResponse({ status: 401, description: '未登录或登录已过期' })
  async createSession(
    @Body() dto: CreateVoiceOrderSessionDto,
    @UserId() userId: string,
  ): Promise<{
    success: boolean;
    data: {
      sessionId: string;
      initialStep: string;
      initialPrompt: string;
    };
  }> {
    // 检查用户是否已登录
    if (!userId) {
      throw new UnauthorizedException('请先登录后再使用语音下单功能');
    }

    const session = await this.voiceOrderService.createSession({
      ...dto,
      userId,
    });
    const prompt = this.dialogTemplateService.getPrompt(session.currentStep);

    return {
      success: true,
      data: {
        sessionId: session.id,
        initialStep: session.currentStep,
        initialPrompt: prompt,
      },
    };
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: '获取会话状态' })
  @ApiResponse({ status: 200, description: '获取会话成功' })
  async getSession(@Param('sessionId') sessionId: string): Promise<{
    success: boolean;
    data: VoiceOrderSession;
  }> {
    const session = await this.voiceOrderService.getSession(sessionId);
    return {
      success: true,
      data: session,
    };
  }

  @Put('session/:sessionId')
  @ApiOperation({ summary: '更新会话状态' })
  @ApiResponse({ status: 200, description: '更新会话成功' })
  async updateSession(
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateDialogStateDto,
  ): Promise<{
    success: boolean;
    data: VoiceOrderSession;
  }> {
    const session = await this.voiceOrderService.updateSession(sessionId, {
      currentStep: dto.nextStep,
      collectedData: dto.collectedData,
    });

    return {
      success: true,
      data: session,
    };
  }

  @Delete('session/:sessionId')
  @ApiOperation({ summary: '结束会话' })
  @ApiResponse({ status: 200, description: '结束会话成功' })
  async endSession(@Param('sessionId') sessionId: string): Promise<{
    success: boolean;
  }> {
    await this.voiceOrderService.endSession(sessionId, SessionStatus.ABANDONED);
    return {
      success: true,
    };
  }

  @Post('recognize')
  @ApiOperation({ summary: '语音识别' })
  @UseInterceptors(FileInterceptor('audio'))
  @ApiResponse({ status: 200, description: '识别成功' })
  async recognize(
    @Body() dto: VoiceInputDto,
    @UploadedFile() audioFile?: Express.Request['file'],
    @UserId() userId?: string,
  ): Promise<{
    success: boolean;
    data: VoiceRecognitionResult;
  }> {
    try {
      let recognizedText = dto.recognizedText || '';

      // 1. 如果有音频文件，调用 ASR 服务
      if (audioFile && audioFile.buffer) {
        const asrResult = await this.asrProvider.recognize(audioFile.buffer, {
          format: dto.audioFormat || 'mp3',
          duration: dto.duration || 0,
        });
        recognizedText = asrResult.text;
      }

      // 2. 如果没有音频文件但有预识别文本，直接使用
      if (!recognizedText) {
        throw new BadRequestException('缺少音频数据或预识别文本');
      }

      // 3. 进行意图识别和实体抽取（通过对话流引擎）
      const sessionUserId =
        userId || (await this.getUserIdFromSession(dto.sessionId));
      const result = await this.dialogFlowEngine.processInput(
        dto.sessionId,
        sessionUserId,
        recognizedText,
      );

      return {
        success: true,
        data: {
          recognizedText,
          intent: VoiceOrderIntent.PROVIDE_ITEM_TYPE, // TODO: 从 result 中提取
          entities: result.updatedData as any,
          nextStep: result.nextStep,
          nextPrompt: result.botResponse,
          shouldConfirm: result.shouldConfirm,
        },
      };
    } catch (error) {
      this.logger.error('Voice recognition failed', error);
      throw new BadRequestException('语音识别失败');
    }
  }

  /**
   * 从会话中获取用户 ID
   */
  private async getUserIdFromSession(sessionId: string): Promise<string> {
    try {
      const session = await this.voiceOrderService.getSession(sessionId);
      return session.userId;
    } catch {
      return 'anonymous';
    }
  }

  @Post('create')
  @ApiOperation({ summary: '基于语音识别结果创建订单' })
  @ApiResponse({ status: 201, description: '订单创建成功' })
  async createOrder(
    @Body() dto: any, // TODO: 定义具体的 DTO
    @UserId() userId?: string,
  ): Promise<{
    success: boolean;
    data: {
      orderNo: string;
      orderId: string;
    };
  }> {
    try {
      // TODO: 实现订单创建逻辑
      // 1. 验证会话状态
      // 2. 验证收集的数据完整性
      // 3. 转换为标准订单 DTO
      // 4. 调用 OrderService 创建订单
      // 5. 结束会话

      return {
        success: true,
        data: {
          orderNo: 'ORDER_' + Date.now(),
          orderId: 'id_' + Date.now(),
        },
      };
    } catch (error) {
      this.logger.error('Create order failed', error);
      throw new BadRequestException('创建订单失败');
    }
  }
}

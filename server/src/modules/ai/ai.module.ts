/**
 * AI 大模型模块
 * 统一管理多平台 AI 提供商的接入
 */

import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AIService } from './services/ai.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}

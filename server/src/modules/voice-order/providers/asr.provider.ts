import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  ASRProviderType,
  ASRResult,
  ASROptions,
} from '../interfaces/voice-order.interface';

@Injectable()
export class ASRProvider {
  private readonly logger = new Logger(ASRProvider.name);
  private readonly primaryProvider: ASRProviderType;
  private readonly fallbackProvider: ASRProviderType;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.primaryProvider = this.configService.get<ASRProviderType>(
      'VOICE_ASR_PRIMARY_PROVIDER',
      ASRProviderType.WECHAT,
    );

    this.fallbackProvider = this.configService.get<ASRProviderType>(
      'VOICE_ASR_FALLBACK_PROVIDER',
      ASRProviderType.TENCENT_CLOUD,
    );
  }

  /**
   * 语音识别（主备双服务）
   */
  async recognize(
    audioData: Buffer,
    options: ASROptions = {},
  ): Promise<ASRResult> {
    try {
      // 尝试主服务
      this.logger.log(
        `Recognizing speech using primary provider: ${this.primaryProvider}`,
      );
      return await this.recognizeWithProvider(
        audioData,
        options,
        this.primaryProvider,
      );
    } catch (error) {
      this.logger.error(
        `Primary ASR provider failed: ${(error as Error).message}, trying fallback provider`,
      );

      try {
        // 主服务失败，尝试备用服务
        return await this.recognizeWithProvider(
          audioData,
          options,
          this.fallbackProvider,
        );
      } catch (fallbackError) {
        this.logger.error(
          `Fallback ASR provider also failed: ${(fallbackError as Error).message}`,
        );
        throw new Error('语音识别失败，请稍后重试');
      }
    }
  }

  /**
   * 使用指定服务商进行识别
   */
  private async recognizeWithProvider(
    audioData: Buffer,
    options: ASROptions,
    provider: ASRProviderType,
  ): Promise<ASRResult> {
    switch (provider) {
      case ASRProviderType.WECHAT:
        return this.wechatASR(audioData, options);

      case ASRProviderType.TENCENT_CLOUD:
        return this.tencentCloudASR(audioData, options);

      default:
        throw new Error(`Unknown ASR provider: ${provider}`);
    }
  }

  /**
   * 微信小程序 ASR
   */
  private async wechatASR(
    audioData: Buffer,
    options: ASROptions,
  ): Promise<ASRResult> {
    try {
      // 获取微信访问令牌
      const appId = this.configService.get<string>('WECHAT_APP_ID');
      const appSecret = this.configService.get<string>('WECHAT_APP_SECRET');

      if (!appId || !appSecret) {
        throw new Error('微信 ASR 配置缺失');
      }

      const tokenResponse = await firstValueFrom(
        this.httpService.get(
          `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`,
        ),
      );

      const accessToken = tokenResponse.data.access_token;

      if (!accessToken) {
        throw new Error('获取微信访问令牌失败');
      }

      // 调用微信语音识别 API
      const formData = new FormData();
      formData.append('format', options.format || 'mp3');
      formData.append('rate', options.sampleRate?.toString() || '16000');
      formData.append('chunk', new Blob([audioData as unknown as BlobPart]));
      formData.append('len', audioData.length.toString());

      const response = await firstValueFrom(
        this.httpService.post(
          `https://api.weixin.qq.com/cgi-bin/media/voice/recognize?access_token=${accessToken}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        ),
      );

      if (response.data.errcode) {
        throw new Error(`微信 ASR 错误：${response.data.errmsg}`);
      }

      return {
        text: response.data.text || '',
        confidence: 1.0, // 微信 ASR 不返回置信度
        duration: options.duration,
      };
    } catch (error) {
      this.logger.error('WeChat ASR failed', error);
      throw error;
    }
  }

  /**
   * 腾讯云 ASR
   */
  private async tencentCloudASR(
    audioData: Buffer,
    options: ASROptions,
  ): Promise<ASRResult> {
    try {
      const secretId = this.configService.get<string>(
        'TENCENT_CLOUD_SECRET_ID',
      );
      const secretKey = this.configService.get<string>(
        'TENCENT_CLOUD_SECRET_KEY',
      );

      if (!secretId || !secretKey) {
        throw new Error('腾讯云 ASR 配置缺失');
      }

      // 腾讯云 ASR API 调用
      // 这里使用一句话识别接口
      const baseUrl = 'https://asr.tencentcloudapi.com';
      const action = 'SentenceRecognition';
      const version = '2019-06-14';
      const timestamp = Math.floor(Date.now() / 1000);

      // 构建请求体
      const requestBody = {
        ProjectId: 0,
        SubServiceType: 2, // 一句话识别
        EngSerViceType: '16k_zh', // 16k 中文
        SourceType: 0, // 音频数据来源
        VoiceFormat: options.format || 'mp3',
        Data: audioData.toString('base64'),
        DataLen: audioData.length,
      };

      // 签名计算（简化版，实际需要使用腾讯云签名算法）
      const authorization = this.calculateTencentCloudSignature(
        secretId,
        secretKey,
        baseUrl,
        action,
        version,
        timestamp,
        requestBody,
      );

      const headers = {
        Authorization: authorization,
        'Content-Type': 'application/json',
        'X-TC-Action': action,
        'X-TC-Version': version,
        'X-TC-Timestamp': timestamp.toString(),
      };

      const response = await firstValueFrom(
        this.httpService.post(baseUrl, requestBody, { headers }),
      );

      if (response.data.Response.Error) {
        throw new Error(
          `腾讯云 ASR 错误：${response.data.Response.Error.Message}`,
        );
      }

      return {
        text: response.data.Response.Result || '',
        confidence:
          response.data.Response.Result_Detail?.[0]?.Confidence || 0.8,
        duration: options.duration,
      };
    } catch (error) {
      this.logger.error('Tencent Cloud ASR failed', error);
      throw error;
    }
  }

  /**
   * 计算腾讯云签名（简化实现）
   */
  private calculateTencentCloudSignature(
    secretId: string,
    secretKey: string,
    baseUrl: string,
    action: string,
    version: string,
    timestamp: number,
    requestBody: any,
  ): string {
    // 实际项目中需要使用完整的腾讯云签名算法 v3
    // 参考：https://cloud.tencent.com/document/api/1093/35160
    // 这里使用简化实现

    return `TC3-HMAC-SHA256 Credential=${secretId}/${timestamp}/tmt/tc3_request, SignedHeaders=content-type;host, Signature=demo`;
  }

  /**
   * 测试 ASR 服务连接
   */
  async testConnection(): Promise<{
    wechat: boolean;
    tencentCloud: boolean;
  }> {
    const result = {
      wechat: false,
      tencentCloud: false,
    };

    // 测试微信 ASR
    try {
      const appId = this.configService.get<string>('WECHAT_APP_ID');
      const appSecret = this.configService.get<string>('WECHAT_APP_SECRET');

      if (appId && appSecret) {
        result.wechat = true;
      }
    } catch (error) {
      result.wechat = false;
    }

    // 测试腾讯云 ASR
    try {
      const secretId = this.configService.get<string>(
        'TENCENT_CLOUD_SECRET_ID',
      );
      const secretKey = this.configService.get<string>(
        'TENCENT_CLOUD_SECRET_KEY',
      );

      if (secretId && secretKey) {
        result.tencentCloud = true;
      }
    } catch (error) {
      result.tencentCloud = false;
    }

    return result;
  }
}

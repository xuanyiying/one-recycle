import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface AlipayUserInfo {
  user_id: string;
  openid?: string;
  access_token: string;
}

@Injectable()
export class AlipayPlatform {
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly privateKey: string;
  private readonly publicKey: string;

  constructor(private readonly configService: ConfigService) {
    this.appId = this.configService.get<string>('ALIPAY_APP_ID');
    this.appSecret = this.configService.get<string>('ALIPAY_APP_SECRET');
    this.privateKey = this.configService.get<string>('ALIPAY_PRIVATE_KEY');
    this.publicKey = this.configService.get<string>('ALIPAY_PUBLIC_KEY');
  }

  async getAccessToken(authCode: string): Promise<AlipayUserInfo> {
    try {
      const url = 'https://openapi.alipay.com/gateway.do';
      
      // 支付宝需要签名，这里简化处理
      // 实际生产环境应使用支付宝官方SDK
      const response = await axios.post(url, null, {
        params: {
          app_id: this.appId,
          method: 'alipay.system.oauth.token',
          format: 'JSON',
          charset: 'utf-8',
          sign_type: 'RSA2',
          timestamp: new Date().toISOString(),
          version: '1.0',
          grant_type: 'authorization_code',
          code: authCode,
        },
      });

      const result = response.data?.alipay_system_oauth_token_response;

      if (!result || result.code !== '10000') {
        throw new BadRequestException(`支付宝登录失败: ${result?.sub_msg || '未知错误'}`);
      }

      return {
        user_id: result.user_id,
        openid: result.openid,
        access_token: result.access_token,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('支付宝登录服务异常');
    }
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface KuaishouUserInfo {
  openid: string;
  session_key: string;
}

@Injectable()
export class KuaishouPlatform {
  private readonly appId: string;
  private readonly appSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.appId = this.configService.get<string>('KUAISHOU_APP_ID') || '';
    this.appSecret =
      this.configService.get<string>('KUAISHOU_APP_SECRET') || '';
  }

  async code2Session(code: string): Promise<KuaishouUserInfo> {
    try {
      const url = 'https://open.kuaishou.com/oauth2/mp/code2session';

      const response = await axios.post(url, {
        app_id: this.appId,
        app_secret: this.appSecret,
        js_code: code,
        grant_type: 'authorization_code',
      });

      const { open_id, session_key, result, error_msg } = response.data;

      if (result !== 1) {
        throw new BadRequestException(`快手登录失败: ${error_msg}`);
      }

      if (!open_id) {
        throw new BadRequestException('获取快手用户信息失败');
      }

      return {
        openid: open_id,
        session_key,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('快手登录服务异常');
    }
  }
}

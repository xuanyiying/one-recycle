import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface TikTokUserInfo {
  openid: string;
  anonymous_openid?: string;
  session_key: string;
}

@Injectable()
export class TikTokPlatform {
  private readonly appId: string;
  private readonly appSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.appId = this.configService.get<string>('DOUYIN_APP_ID');
    this.appSecret = this.configService.get<string>('DOUYIN_APP_SECRET');
  }

  async code2Session(code: string): Promise<TikTokUserInfo> {
    try {
      const url = 'https://developer.toutiao.com/api/apps/v2/jscode2session';
      
      const response = await axios.post(url, {
        appid: this.appId,
        secret: this.appSecret,
        code: code,
      });

      const { openid, anonymous_openid, session_key, err_no, err_tips } = response.data;

      if (err_no !== 0) {
        throw new BadRequestException(`抖音登录失败: ${err_tips}`);
      }

      if (!openid) {
        throw new BadRequestException('获取抖音用户信息失败');
      }

      return {
        openid,
        anonymous_openid,
        session_key,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('抖音登录服务异常');
    }
  }
}

import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface WeChatUserInfo {
  openid: string;
  unionid?: string;
  session_key: string;
}

@Injectable()
export class WeChatPlatform implements OnModuleInit {
  private readonly appId: string;
  private readonly appSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.appId = this.configService.get<string>('WECHAT_APP_ID') || '';
    this.appSecret = this.configService.get<string>('WECHAT_APP_SECRET') || '';
  }

  onModuleInit() {
    if (!this.appId) {
      throw new Error(
        '[FATAL] WECHAT_APP_ID 环境变量未配置，请检查 server/.env 文件或生产环境变量是否正确设置',
      );
    }
    if (!this.appSecret) {
      throw new Error(
        '[FATAL] WECHAT_APP_SECRET 环境变量未配置，请检查 server/.env 文件或生产环境变量是否正确设置',
      );
    }
  }

  async code2Session(code: string): Promise<WeChatUserInfo> {
    try {
      const url = 'https://api.weixin.qq.com/sns/jscode2session';
      const response = await axios.get(url, {
        params: {
          appid: this.appId,
          secret: this.appSecret,
          js_code: code,
          grant_type: 'authorization_code',
        },
      });

      const { openid, unionid, session_key, errcode, errmsg } = response.data;

      if (errcode) {
        console.error(`微信登录失败: errcode=${errcode}, errmsg=${errmsg}`);
        throw new BadRequestException(`微信登录失败: ${errmsg}`);
      }

      if (!openid) {
        console.error('微信登录失败: openid缺失', response.data);
        throw new BadRequestException('获取微信用户信息失败');
      }

      return {
        openid,
        unionid,
        session_key,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('微信登录服务异常');
    }
  }
}

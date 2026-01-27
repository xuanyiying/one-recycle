import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IPaymentProvider,
  PaymentResult,
  TransferQueryResult,
  TransferStatus,
  WithdrawalAccountInfo,
} from '../interfaces/payment-provider.interface';
import * as crypto from 'crypto';
import * as https from 'https';
import * as fs from 'fs';
import axios, { AxiosInstance } from 'axios';
import * as xml2js from 'xml2js';
import { SnowflakeIdGenerator } from '@/common';
import { PaymentProvider } from '@prisma/client';

/**
 * 微信支付提供商
 * 实现企业付款到零钱功能
 * API文档: https://pay.weixin.qq.com/wiki/doc/api/tools/mch_pay.php
 */
@Injectable()
export class WeChatPayProvider implements IPaymentProvider {
  private readonly logger = new Logger(WeChatPayProvider.name);
  private readonly appId: string;
  private readonly mchId: string;
  private readonly apiKey: string;
  private readonly certPath: string;
  private readonly keyPath: string;
  private readonly apiUrl: string;
  private readonly idGenerator = new SnowflakeIdGenerator({
    workerId: 5,
    datacenterId: 1,
  });
  private readonly httpClient: AxiosInstance;
  private readonly isDevelopment: boolean;

  constructor(private readonly configService: ConfigService) {
    this.appId = this.configService.get<string>('WECHAT_APP_ID', '');
    this.mchId = this.configService.get<string>('WECHAT_MCH_ID', '');
    this.apiKey = this.configService.get<string>('WECHAT_API_KEY', '');
    this.certPath = this.configService.get<string>('WECHAT_CERT_PATH', '');
    this.keyPath = this.configService.get<string>('WECHAT_KEY_PATH', '');
    this.apiUrl = this.configService.get<string>(
      'WECHAT_PAY_API_URL',
      'https://api.mch.weixin.qq.com',
    );
    this.isDevelopment =
      this.configService.get<string>('NODE_ENV') === 'development';

    if (!this.appId || !this.mchId || !this.apiKey) {
      this.logger.warn('WeChat Pay configuration is incomplete');
    }

    // 初始化HTTP客户端
    this.httpClient = axios.create({
      timeout: this.configService.get<number>('PAYMENT_TIMEOUT', 30000),
      headers: {
        'Content-Type': 'application/xml',
        'User-Agent': 'OneRecycle-WeChatPay/1.0',
      },
      httpsAgent: this.createHttpsAgent(),
    });
  }

  getProviderType(): PaymentProvider {
    return PaymentProvider.WECHAT;
  }

  /**
   * 发起企业付款到零钱
   * API文档: https://pay.weixin.qq.com/wiki/doc/api/tools/mch_pay.php?chapter=14_2
   */
  async transfer(
    amount: number,
    accountInfo: WithdrawalAccountInfo,
    outTradeNo: string,
    description: string,
  ): Promise<PaymentResult> {
    this.logger.log(`WeChat transfer: ${outTradeNo}, amount: ${amount}`);

    try {
      // 验证配置
      if (!this.appId || !this.mchId || !this.apiKey) {
        throw new Error('微信支付配置不完整');
      }

      // 验证账户信息
      if (!accountInfo.openid || !accountInfo.realName) {
        return {
          success: false,
          message: '微信账户信息不完整',
          errorCode: 'INVALID_ACCOUNT_INFO',
        };
      }

      // 验证金额
      if (amount <= 0 || amount > 20000) {
        return {
          success: false,
          message: '转账金额必须在0.01-20000元之间',
          errorCode: 'INVALID_AMOUNT',
        };
      }

      // 开发环境模拟
      if (this.isDevelopment) {
        this.logger.warn(
          'Development mode: simulating WeChat transfer success',
        );
        await this.simulateDelay(1000);
        return {
          success: true,
          transactionId: `WX${this.idGenerator.nextId()}`,
          message: '转账成功',
        };
      }

      // 构建请求参数
      const params = {
        mch_appid: this.appId,
        mchid: this.mchId,
        nonce_str: this.generateNonceStr(),
        partner_trade_no: outTradeNo,
        openid: accountInfo.openid,
        check_name: 'FORCE_CHECK', // 强制校验真实姓名
        re_user_name: accountInfo.realName,
        amount: Math.round(amount * 100), // 转换为分
        desc: description || '提现',
        spbill_create_ip: this.getServerIp(),
      };

      // 生成签名
      const sign = this.generateSign(params);
      const requestData = { ...params, sign };

      // 调用微信支付API
      const xmlData = this.buildXml(requestData);
      const response = await this.httpClient.post(
        `${this.apiUrl}/mmpaymkttransfers/promotion/transfers`,
        xmlData,
      );

      // 解析响应
      const result = await this.parseXmlResponse(response.data);

      // 验证响应签名
      if (!this.verifyResponseSign(result)) {
        throw new Error('响应签名验证失败');
      }

      // 检查返回状态
      if (result.return_code !== 'SUCCESS') {
        return {
          success: false,
          message: result.return_msg || '请求失败',
          errorCode: result.err_code || 'REQUEST_FAILED',
        };
      }

      if (result.result_code !== 'SUCCESS') {
        return {
          success: false,
          message: result.err_code_des || '转账失败',
          errorCode: result.err_code || 'TRANSFER_FAILED',
        };
      }

      // 转账成功
      return {
        success: true,
        transactionId: result.payment_no,
        message: '转账成功',
      };
    } catch (error: any) {
      this.logger.error(
        `WeChat transfer failed: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: this.getErrorMessage(error),
        errorCode: 'TRANSFER_FAILED',
      };
    }
  }

  /**
   * 查询企业付款状态
   * API文档: https://pay.weixin.qq.com/wiki/doc/api/tools/mch_pay.php?chapter=14_3
   */
  async queryTransfer(outTradeNo: string): Promise<TransferQueryResult> {
    this.logger.log(`Query WeChat transfer: ${outTradeNo}`);

    try {
      // 开发环境模拟
      if (this.isDevelopment) {
        await this.simulateDelay(500);
        return {
          status: TransferStatus.SUCCESS,
          transactionId: `WX${Date.now()}`,
        };
      }

      // 构建请求参数
      const params = {
        appid: this.appId,
        mch_id: this.mchId,
        partner_trade_no: outTradeNo,
        nonce_str: this.generateNonceStr(),
      };

      // 生成签名
      const sign = this.generateSign(params);
      const requestData = { ...params, sign };

      // 调用微信支付API
      const xmlData = this.buildXml(requestData);
      const response = await this.httpClient.post(
        `${this.apiUrl}/mmpaymkttransfers/gettransferinfo`,
        xmlData,
      );

      // 解析响应
      const result = await this.parseXmlResponse(response.data);

      // 验证响应签名
      if (!this.verifyResponseSign(result)) {
        throw new Error('响应签名验证失败');
      }

      // 检查返回状态
      if (
        result.return_code !== 'SUCCESS' ||
        result.result_code !== 'SUCCESS'
      ) {
        return {
          status: TransferStatus.FAILED,
          message: result.err_code_des || result.return_msg || '查询失败',
        };
      }

      // 映射状态
      const statusMap: Record<string, TransferStatus> = {
        SUCCESS: TransferStatus.SUCCESS,
        FAILED: TransferStatus.FAILED,
        PROCESSING: TransferStatus.PROCESSING,
      };

      return {
        status: statusMap[result.status] || TransferStatus.PROCESSING,
        transactionId: result.detail_id,
        message: result.reason,
      };
    } catch (error: any) {
      this.logger.error(`Query WeChat transfer failed: ${error.message}`);
      return {
        status: TransferStatus.FAILED,
        message: this.getErrorMessage(error),
      };
    }
  }

  /**
   * 验证微信支付回调签名
   */
  verifyCallback(callbackData: any): boolean {
    try {
      const { sign, ...params } = callbackData;

      if (!sign) {
        this.logger.warn('Callback data missing sign');
        return false;
      }

      const calculatedSign = this.generateSign(params);
      const isValid = calculatedSign === sign;

      if (!isValid) {
        this.logger.warn('Callback signature verification failed');
      }

      return isValid;
    } catch (error: any) {
      this.logger.error(`Verify callback failed: ${error.message}`);
      return false;
    }
  }

  /**
   * 生成随机字符串
   */
  private generateNonceStr(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * 生成微信支付签名
   * 签名算法: MD5(key1=value1&key2=value2...&key=API_KEY)
   */
  private generateSign(params: Record<string, any>): string {
    // 1. 参数按key排序
    const sortedKeys = Object.keys(params).sort();

    // 2. 拼接参数字符串
    const stringA = sortedKeys
      .filter((key) => params[key] !== undefined && params[key] !== '')
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    // 3. 拼接API密钥
    const stringSignTemp = `${stringA}&key=${this.apiKey}`;

    // 4. MD5加密并转大写
    const sign = crypto
      .createHash('md5')
      .update(stringSignTemp, 'utf8')
      .digest('hex')
      .toUpperCase();

    return sign;
  }

  /**
   * 构建XML请求体
   */
  private buildXml(params: Record<string, any>): string {
    const xmlParts = ['<xml>'];

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        // 对特殊字符进行转义
        const escapedValue = this.escapeXml(String(value));
        xmlParts.push(`<${key}><![CDATA[${escapedValue}]]></${key}>`);
      }
    }

    xmlParts.push('</xml>');
    return xmlParts.join('');
  }

  /**
   * 解析XML响应
   */
  private async parseXmlResponse(xmlData: string): Promise<any> {
    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: true,
    });
    const result = await parser.parseStringPromise(xmlData);
    return result.xml || {};
  }

  /**
   * 验证响应签名
   */
  private verifyResponseSign(data: any): boolean {
    if (!data.sign) {
      return false;
    }

    const { sign, ...params } = data;
    const calculatedSign = this.generateSign(params);
    return calculatedSign === sign;
  }

  /**
   * 创建HTTPS代理（用于证书认证）
   */
  private createHttpsAgent(): https.Agent | undefined {
    if (this.isDevelopment || !this.certPath || !this.keyPath) {
      return undefined;
    }

    try {
      return new https.Agent({
        cert: fs.readFileSync(this.certPath),
        key: fs.readFileSync(this.keyPath),
        rejectUnauthorized: true,
      });
    } catch (error: any) {
      this.logger.error(`Failed to load certificates: ${error.message}`);
      return undefined;
    }
  }

  /**
   * 获取服务器IP
   */
  private getServerIp(): string {
    return this.configService.get<string>('SERVER_IP', '127.0.0.1');
  }

  /**
   * 转义XML特殊字符
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * 模拟延迟（开发环境）
   */
  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 获取错误消息
   */
  private getErrorMessage(error: any): string {
    if (error.response?.data) {
      return (
        error.response.data.return_msg ||
        error.response.data.err_code_des ||
        error.message
      );
    }
    return error.message || '未知错误';
  }
}

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
import axios, { AxiosInstance } from 'axios';
import { SnowflakeIdGenerator } from '@/common';
import { PaymentProvider } from '@prisma/client';

// 定义支付宝响应类型
interface AlipayResponse {
  code: string;
  msg: string;
  sub_code?: string;
  sub_msg?: string;
  sign?: string;
}

interface AlipayTransferResponse extends AlipayResponse {
  out_biz_no: string;
  order_id: string;
  pay_fund_order_id?: string;
  status: string;
}

interface AlipayQueryResponse extends AlipayResponse {
  out_biz_no: string;
  order_id: string;
  pay_fund_order_id?: string;
  status: string;
  fail_reason?: string;
}

/**
 * 支付宝支付提供商
 * 实现转账到账户功能
 * API文档: https://opendocs.alipay.com/open/309
 */
@Injectable()
export class AlipayProvider implements IPaymentProvider {
  private readonly logger = new Logger(AlipayProvider.name);
  private readonly appId: string;
  private readonly privateKey: string;
  private readonly alipayPublicKey: string;
  private readonly apiUrl: string;
  private readonly idGenerator = new SnowflakeIdGenerator({
    workerId: 4,
    datacenterId: 1,
  });
  private readonly httpClient: AxiosInstance;
  private readonly isDevelopment: boolean;

  constructor(private readonly configService: ConfigService) {
    this.appId = this.configService.get<string>('ALIPAY_APP_ID', '');
    this.privateKey = this.configService.get<string>('ALIPAY_PRIVATE_KEY', '');
    this.alipayPublicKey = this.configService.get<string>(
      'ALIPAY_PUBLIC_KEY',
      '',
    );
    this.apiUrl = this.configService.get<string>(
      'ALIPAY_API_URL',
      'https://openapi.alipay.com/gateway.do',
    );
    this.isDevelopment =
      this.configService.get<string>('NODE_ENV') === 'development';

    if (!this.appId || !this.privateKey || !this.alipayPublicKey) {
      this.logger.warn('Alipay configuration is incomplete');
    }

    // 初始化HTTP客户端
    this.httpClient = axios.create({
      timeout: this.configService.get<number>('PAYMENT_TIMEOUT', 30000),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'OneRecycle-Alipay/1.0',
      },
    });
  }

  getProviderType(): PaymentProvider {
    return PaymentProvider.ALIPAY;
  }

  /**
   * 发起支付宝转账
   * API文档: https://opendocs.alipay.com/open/309/alipay.fund.trans.uni.transfer
   */
  async transfer(
    amount: number,
    accountInfo: WithdrawalAccountInfo,
    outTradeNo: string,
    description: string,
  ): Promise<PaymentResult> {
    this.logger.log(`Alipay transfer: ${outTradeNo}, amount: ${amount}`);

    try {
      // 验证配置
      if (!this.appId || !this.privateKey || !this.alipayPublicKey) {
        throw new Error('支付宝配置不完整');
      }

      // 验证账户信息
      if (!accountInfo.alipayAccount || !accountInfo.alipayName) {
        return {
          success: false,
          message: '支付宝账户信息不完整',
          errorCode: 'INVALID_ACCOUNT_INFO',
        };
      }

      // 验证金额
      if (amount <= 0 || amount > 100000) {
        return {
          success: false,
          message: '转账金额必须在0.01-100000元之间',
          errorCode: 'INVALID_AMOUNT',
        };
      }

      // 开发环境模拟
      if (this.isDevelopment) {
        this.logger.warn(
          'Development mode: simulating Alipay transfer success',
        );
        await this.simulateDelay(1000);
        return {
          success: true,
          transactionId: `ALI${this.idGenerator.nextId()}`,
          message: '转账成功',
        };
      }

      // 构建业务参数
      const bizContent = {
        out_biz_no: outTradeNo,
        trans_amount: amount.toFixed(2),
        product_code: 'TRANS_ACCOUNT_NO_PWD', // 转账到支付宝账户
        biz_scene: 'DIRECT_TRANSFER', // 单笔转账
        order_title: description || '提现',
        payee_info: {
          identity: accountInfo.alipayAccount,
          identity_type: 'ALIPAY_LOGON_ID', // 支付宝登录号
          name: accountInfo.alipayName,
        },
        remark: description,
      };

      // 构建公共参数
      const params = {
        app_id: this.appId,
        method: 'alipay.fund.trans.uni.transfer',
        format: 'JSON',
        charset: 'utf-8',
        sign_type: 'RSA2',
        timestamp: this.getTimestamp(),
        version: '1.0',
        biz_content: JSON.stringify(bizContent),
      };

      // 生成签名
      const sign = this.generateSign(params);
      const requestData = { ...params, sign };

      // 调用支付宝API
      const response = await this.httpClient.post(
        this.apiUrl,
        new URLSearchParams(requestData).toString(),
      );

      // 解析响应
      const result = response.data as Record<string, AlipayTransferResponse>;
      const responseKey = 'alipay_fund_trans_uni_transfer_response';

      if (!result[responseKey]) {
        throw new Error('响应格式错误');
      }

      const transferResponse = result[responseKey];

      // 验证响应签名
      if (!this.verifyResponseSign(result, responseKey)) {
        throw new Error('响应签名验证失败');
      }

      // 检查返回状态
      if (transferResponse.code !== '10000') {
        return {
          success: false,
          message:
            transferResponse.sub_msg || transferResponse.msg || '转账失败',
          errorCode: transferResponse.sub_code || transferResponse.code,
        };
      }

      // 转账成功
      return {
        success: true,
        transactionId: transferResponse.order_id,
        message: '转账成功',
      };
    } catch (error: any) {
      this.logger.error(
        `Alipay transfer failed: ${error.message}`,
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
   * 查询支付宝转账状态
   * API文档: https://opendocs.alipay.com/open/309/alipay.fund.trans.common.query
   */
  async queryTransfer(outTradeNo: string): Promise<TransferQueryResult> {
    this.logger.log(`Query Alipay transfer: ${outTradeNo}`);

    try {
      // 开发环境模拟
      if (this.isDevelopment) {
        await this.simulateDelay(500);
        return {
          status: TransferStatus.SUCCESS,
          transactionId: `ALI${Date.now()}`,
        };
      }

      // 构建业务参数
      const bizContent = {
        out_biz_no: outTradeNo,
        product_code: 'TRANS_ACCOUNT_NO_PWD',
      };

      // 构建公共参数
      const params = {
        app_id: this.appId,
        method: 'alipay.fund.trans.common.query',
        format: 'JSON',
        charset: 'utf-8',
        sign_type: 'RSA2',
        timestamp: this.getTimestamp(),
        version: '1.0',
        biz_content: JSON.stringify(bizContent),
      };

      // 生成签名
      const sign = this.generateSign(params);
      const requestData = { ...params, sign };

      // 调用支付宝API
      const response = await this.httpClient.post(
        this.apiUrl,
        new URLSearchParams(requestData).toString(),
      );

      // 解析响应
      const result = response.data as Record<string, AlipayQueryResponse>;
      const responseKey = 'alipay_fund_trans_common_query_response';

      if (!result[responseKey]) {
        throw new Error('响应格式错误');
      }

      const queryResponse = result[responseKey];

      // 验证响应签名
      if (!this.verifyResponseSign(result, responseKey)) {
        throw new Error('响应签名验证失败');
      }

      // 检查返回状态
      if (queryResponse.code !== '10000') {
        return {
          status: TransferStatus.FAILED,
          message: queryResponse.sub_msg || queryResponse.msg || '查询失败',
        };
      }

      // 映射状态
      const statusMap: Record<string, TransferStatus> = {
        SUCCESS: TransferStatus.SUCCESS,
        FAIL: TransferStatus.FAILED,
        DEALING: TransferStatus.PROCESSING,
        REFUND: TransferStatus.FAILED,
      };

      return {
        status: statusMap[queryResponse.status] || TransferStatus.PROCESSING,
        transactionId: queryResponse.order_id,
        message: queryResponse.fail_reason,
      };
    } catch (error: any) {
      this.logger.error(`Query Alipay transfer failed: ${error.message}`);
      return {
        status: TransferStatus.FAILED,
        message: this.getErrorMessage(error),
      };
    }
  }

  /**
   * 验证支付宝回调签名
   */
  verifyCallback(callbackData: any): boolean {
    try {
      const { sign, sign_type, ...params } = callbackData;

      if (!sign || sign_type !== 'RSA2') {
        this.logger.warn('Callback data missing sign or invalid sign_type');
        return false;
      }

      // 构建待签名字符串
      const signString = this.buildSignString(params);

      // 验证签名
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(signString, 'utf8');

      const isValid = verify.verify(
        this.formatPublicKey(this.alipayPublicKey),
        sign,
        'base64',
      );

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
   * 验证响应签名
   */
  private verifyResponseSign(response: any, responseKey: string): boolean {
    try {
      if (!response.sign) {
        return false;
      }

      // 提取响应内容
      const responseContent = JSON.stringify(response[responseKey]);

      // 验证签名
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(responseContent, 'utf8');

      return verify.verify(
        this.formatPublicKey(this.alipayPublicKey),
        response.sign,
        'base64',
      );
    } catch (error: any) {
      this.logger.error(`Verify response sign failed: ${error.message}`);
      return false;
    }
  }

  /**
   * 获取当前时间戳（支付宝格式）
   */
  private getTimestamp(): string {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  /**
   * 生成支付宝签名
   * 使用RSA2（SHA256WithRSA）算法
   */
  private generateSign(params: Record<string, any>): string {
    // 构建待签名字符串
    const signString = this.buildSignString(params);

    // 使用私钥签名
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signString, 'utf8');

    return sign.sign(this.formatPrivateKey(this.privateKey), 'base64');
  }

  /**
   * 构建待签名字符串
   * 规则: key1=value1&key2=value2（按key排序，排除sign和sign_type）
   */
  private buildSignString(params: Record<string, any>): string {
    return Object.keys(params)
      .filter((key) => key !== 'sign' && key !== 'sign_type')
      .filter((key) => params[key] !== undefined && params[key] !== '')
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');
  }

  /**
   * 格式化私钥
   * 添加PEM头尾
   */
  private formatPrivateKey(privateKey: string): string {
    if (privateKey.includes('BEGIN PRIVATE KEY')) {
      return privateKey;
    }

    return `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
  }

  /**
   * 格式化公钥
   * 添加PEM头尾
   */
  private formatPublicKey(publicKey: string): string {
    if (publicKey.includes('BEGIN PUBLIC KEY')) {
      return publicKey;
    }

    return `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
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
      const responseKey = Object.keys(error.response.data).find((key) =>
        key.endsWith('_response'),
      );
      if (responseKey) {
        const errorResponse = error.response.data[responseKey];
        return errorResponse.sub_msg || errorResponse.msg || error.message;
      }
    }
    return error.message || '未知错误';
  }
}

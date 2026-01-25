import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface SendSmsRequest {
  phone: string;
  template: string;
  params: Record<string, any>;
}

export interface SendSmsResponse {
  success: boolean;
  messageId: string;
  sentAt: string;
}

export interface SendPushRequest {
  userId: string;
  title: string;
  content: string;
  data?: Record<string, any>;
}

export interface SendPushResponse {
  success: boolean;
  devicesCount: number;
  successCount: number;
  sentAt: string;
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  content: string;
  template?: string;
  params?: Record<string, any>;
}

export interface SendEmailResponse {
  success: boolean;
  messageId: string;
  sentAt: string;
}

@Injectable()
export class NotificationServiceClient {
  private readonly logger = new Logger(NotificationServiceClient.name);
  private readonly httpClient: AxiosInstance;
  private readonly baseURL: string;

  constructor(private readonly configService: ConfigService) {
    this.baseURL =
      this.configService.get<string>('NOTIFICATION_SERVICE_URL') ||
      'http://localhost:3004';

    this.httpClient = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(
          `Notification request: ${config.method?.toUpperCase()} ${config.url}`,
        );
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error(`Notification error: ${error.message}`);
        return Promise.reject(error);
      },
    );
  }

  /**
   * 发送短信
   */
  async sendSms(request: SendSmsRequest): Promise<SendSmsResponse> {
    try {
      this.logger.log(
        `Sending SMS to ${request.phone}, template: ${request.template}`,
      );

      const response = await this.httpClient.post<SendSmsResponse>(
        '/notifications/sms',
        request,
      );

      this.logger.log(`SMS sent successfully to ${request.phone}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${request.phone}:`, error);
      throw error;
    }
  }

  /**
   * 发送推送通知
   */
  async sendPush(request: SendPushRequest): Promise<SendPushResponse> {
    try {
      this.logger.log(`Sending push notification to user ${request.userId}`);

      const response = await this.httpClient.post<SendPushResponse>(
        '/notifications/push',
        request,
      );

      this.logger.log(
        `Push notification sent to user ${request.userId}: ${response.data.successCount}/${response.data.devicesCount} devices`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to send push notification to user ${request.userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * 发送邮件
   */
  async sendEmail(request: SendEmailRequest): Promise<SendEmailResponse> {
    try {
      this.logger.log(`Sending email to ${request.to}`);

      const response = await this.httpClient.post<SendEmailResponse>(
        '/notifications/email',
        request,
      );

      this.logger.log(`Email sent successfully to ${request.to}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send email to ${request.to}:`, error);
      throw error;
    }
  }

  /**
   * 批量发送通知
   */
  async sendBatch(
    type: 'sms' | 'push' | 'email',
    notifications: any[],
  ): Promise<any> {
    try {
      this.logger.log(
        `Sending batch ${type} notifications: ${notifications.length} items`,
      );

      const response = await this.httpClient.post(
        `/notifications/batch/${type}`,
        {
          notifications,
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send batch ${type} notifications:`, error);
      throw error;
    }
  }

  /**
   * 获取用户手机号
   */
  async getUserPhone(userId: string): Promise<string | null> {
    try {
      const response = await this.httpClient.get<{ phone: string }>(
        `/users/${userId}/phone`,
      );
      return response.data.phone;
    } catch (error) {
      this.logger.error(`Failed to get phone for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * 获取用户邮箱
   */
  async getUserEmail(userId: string): Promise<string | null> {
    try {
      const response = await this.httpClient.get<{ email: string }>(
        `/users/${userId}/email`,
      );
      return response.data.email;
    } catch (error) {
      this.logger.error(`Failed to get email for user ${userId}:`, error);
      return null;
    }
  }
}

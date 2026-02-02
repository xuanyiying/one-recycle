import { apiClient } from './apiClient';
// admin 认证服务接口
export interface LoginDto {
  account: string;
  password?: string;
}

export interface StaffLoginDto {
  username: string;
  password?: string;
  tenantCode: string;
}

export interface SendCodeDto {
  mobile: string;
  type?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface LogoutDto {
  refreshToken?: string;
  allDevices?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: any; // Using any for User to avoid circular dependency or complex type import if not available
  expiresIn: number;
}

export interface ThirdPartyLoginDto {
  code: string;
  nickname?: string;
  avatarUrl?: string;
  state?: string;
  deviceFingerprint?: string;
}

class AuthService {
  /**
   * 规范化后端返回的数据结构，压平 tokens 并统一 user/staff 字段
   */
  private normalizeAuthResponse(res: any): AuthResponse {
    const tokens = res.tokens || {};
    return {
      accessToken: tokens.accessToken || res.accessToken,
      refreshToken: tokens.refreshToken || res.refreshToken,
      expiresIn: tokens.expiresIn || res.expiresIn,
      user: res.user || res.staff,
    };
  }

  /**
   * 用户登录 (平台管理员)
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    const res = await apiClient.post<any>('/auth/login', data);
    return this.normalizeAuthResponse(res);
  }

  /**
   * 租户员工登录
   */
  async tenantLogin(data: StaffLoginDto): Promise<AuthResponse> {
    const res = await apiClient.post<any>('/tenant/auth/login', data);
    return this.normalizeAuthResponse(res);
  }

  /**
   * 发送验证码
   */
  async sendSmsCode(data: SendCodeDto): Promise<void> {
    return apiClient.post('/auth/send-sms-code', data);
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(data: RefreshTokenDto): Promise<AuthResponse> {
    return apiClient.post('/auth/refresh', data);
  }

  /**
   * 用户登出
   */
  async logout(data: LogoutDto = {}): Promise<void> {
    return apiClient.post('/auth/logout', data);
  }

  /**
   * 第三方平台登录
   */
  async thirdPartyLogin(platform: string, data: ThirdPartyLoginDto): Promise<AuthResponse> {
    return apiClient.post(`/auth/third-party/${platform}`, data);
  }
}

export const authService = new AuthService();

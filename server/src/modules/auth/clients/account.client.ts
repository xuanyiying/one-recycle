import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ApiResponse } from '@/common/types/common.types';

export interface CreateUserRequest {
  mobile?: string;
  nickname?: string;
  avatarUrl?: string;
}

export interface UserIdentityRequest {
  provider: string;
  openid: string;
  unionid?: string;
  appId: string;
}

export interface UserResponse {
  id: string;
  mobile?: string;
  nickname?: string;
  avatarUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class AccountClient {
  private readonly client: AxiosInstance;
  private readonly accountServiceUrl: string;
  private readonly timeout: number;

  constructor(private readonly configService: ConfigService) {
    this.accountServiceUrl = this.configService.get<string>(
      'ACCOUNT_SERVICE_URL',
      'http://localhost:3001/api',
    );
    this.timeout = this.configService.get<number>('ACCOUNT_SERVICE_TIMEOUT', 5000);

    this.client = axios.create({
      baseURL: this.accountServiceUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async findUserByIdentity(
    provider: string,
    openid: string,
  ): Promise<UserResponse | null> {
    try {
      const response = await this.client.get<ApiResponse<UserResponse>>(
        `/users/identity/${provider}/${openid}`,
      );
      return response.data.data || null;
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return null;
      }
      throw new BadRequestException('查询用户失败');
    }
  }

  async findUserByMobile(mobile: string): Promise<UserResponse | null> {
    try {
      const response = await this.client.get<ApiResponse<UserResponse>>(`/users/mobile/${mobile}`);
      return response.data.data || null;
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return null;
      }
      throw new BadRequestException('查询用户失败');
    }
  }

  async findUserById(userId: string): Promise<UserResponse | null> {
    try {
      const response = await this.client.get<ApiResponse<UserResponse>>(`/users/${userId}`);
      return response.data.data || null;
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return null;
      }
      throw new BadRequestException('查询用户失败');
    }
  }

  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    try {
      const response = await this.client.post<ApiResponse<UserResponse>>('/users', data);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || '创建用户失败');
      }
      return response.data.data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async createOrUpdateUserIdentity(
    userId: string,
    identity: UserIdentityRequest,
  ): Promise<void> {
    try {
      const response = await this.client.post<ApiResponse<void>>(`/users/${userId}/identities`, identity);
      if (!response.data.success) {
        throw new Error(response.data.message || '绑定用户身份失败');
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateUser(
    userId: string,
    data: Partial<CreateUserRequest>,
  ): Promise<UserResponse> {
    try {
      const response = await this.client.put<ApiResponse<UserResponse>>(`/users/${userId}`, data);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || '更新用户失败');
      }
      return response.data.data;
    } catch (error: any) {
      throw new BadRequestException(error);
    }
  }
}

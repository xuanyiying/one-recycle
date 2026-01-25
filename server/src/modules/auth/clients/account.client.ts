import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

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

  constructor(private readonly configService: ConfigService) {
    this.accountServiceUrl = this.configService.get<string>(
      'ACCOUNT_SERVICE_URL',
      'http://localhost:3001',
    );

    this.client = axios.create({
      baseURL: this.accountServiceUrl,
      timeout: 5000,
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
      const response = await this.client.get(
        `/users/identity/${provider}/${openid}`,
      );
      return response.data;
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return null;
      }
      throw new BadRequestException('查询用户失败');
    }
  }

  async findUserByMobile(mobile: string): Promise<UserResponse | null> {
    try {
      const response = await this.client.get(`/users/mobile/${mobile}`);
      return response.data;
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return null;
      }
      throw new BadRequestException('查询用户失败');
    }
  }

  async findUserById(userId: string): Promise<UserResponse | null> {
    try {
      const response = await this.client.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return null;
      }
      throw new BadRequestException('查询用户失败');
    }
  }

  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    try {
      const response = await this.client.post('/users', data);
      return response.data;
    } catch (error) {
      throw new BadRequestException('创建用户失败');
    }
  }

  async createOrUpdateUserIdentity(
    userId: string,
    identity: UserIdentityRequest,
  ): Promise<void> {
    try {
      await this.client.post(`/users/${userId}/identities`, identity);
    } catch (error) {
      throw new BadRequestException('绑定用户身份失败');
    }
  }

  async updateUser(
    userId: string,
    data: Partial<CreateUserRequest>,
  ): Promise<UserResponse> {
    try {
      const response = await this.client.put(`/users/${userId}`, data);
      return response.data;
    } catch (error) {
      throw new BadRequestException('更新用户失败');
    }
  }
}

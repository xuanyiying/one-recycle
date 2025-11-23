import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from '../services/user.service';
import {
  GetUserRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse
} from '../../../proto/account.pb';

@Controller()
export class UserGrpcController {
  constructor(private readonly userService: UserService) { }

  @GrpcMethod('AccountService', 'GetUser')
  async getUser(data: GetUserRequest): Promise<UserResponse> {
    try {
      const user = await this.userService.findOne(data.id.toString());
      return this.mapToUserResponse(user);
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('AccountService', 'CreateUser')
  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    try {
      const user = await this.userService.create({
        mobile: data.mobile,
        nickname: data.nickname,
        avatarUrl: data.avatarUrl
      });
      return this.mapToUserResponse(user);
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('AccountService', 'UpdateUser')
  async updateUser(data: UpdateUserRequest): Promise<UserResponse> {
    try {
      const user = await this.userService.update(data.id.toString(), {
        nickname: data.nickname,
        avatarUrl: data.avatarUrl
      });
      return this.mapToUserResponse(user);
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  private mapToUserResponse(user: any): UserResponse {
    return {
      id: Number(user.id),
      mobile: user.mobile || '',
      nickname: user.nickname || '',
      avatarUrl: user.avatarUrl || '',
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }

  private handleGrpcError(error: any): any {
    if (error.code === 'NOT_FOUND') {
      return { code: 5, message: error.message }; // NOT_FOUND
    }
    if (error.code === 'ALREADY_EXISTS') {
      return { code: 6, message: error.message }; // ALREADY_EXISTS
    }
    if (error.code === 'INTERNAL') {
      return { code: 13, message: error.message }; // INTERNAL
    }
    // 处理普通错误对象
    if (error instanceof Error) {
      return { code: 13, message: error.message || 'Internal server error' };
    }
    return { code: 13, message: 'Internal server error' }; // INTERNAL
  }
}
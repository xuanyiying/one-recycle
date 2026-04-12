import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from '../services/user.service';
import { UserResponseDto } from '../dto';
import {
  FindOneRequest,
  FindByMobileRequest,
  FindByIdentityRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
} from '@/proto/user.pb';

@Controller()
export class UserGrpcController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'FindOne')
  async findOne(data: FindOneRequest): Promise<UserResponse> {
    const result = await this.userService.findOne(data.id);
    return this.mapToUserResponse(result);
  }

  @GrpcMethod('UserService', 'FindByMobile')
  async findByMobile(data: FindByMobileRequest): Promise<UserResponse> {
    const result = await this.userService.findByMobile(data.mobile);
    if (!result) return {} as UserResponse;
    return this.mapToUserResponse(result);
  }

  @GrpcMethod('UserService', 'FindByIdentity')
  async findByIdentity(data: FindByIdentityRequest): Promise<UserResponse> {
    const result = await this.userService.findByIdentity(data.provider, data.openid);
    if (!result) return {} as UserResponse;
    return this.mapToUserResponse(result);
  }

  @GrpcMethod('UserService', 'CreateUser')
  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    const result = await this.userService.create({
      mobile: data.mobile,
      nickname: data.nickname,
      avatarUrl: data.avatarUrl,
    });
    return this.mapToUserResponse(result);
  }

  @GrpcMethod('UserService', 'UpdateUser')
  async updateUser(data: UpdateUserRequest): Promise<UserResponse> {
    const result = await this.userService.update(data.id, {
      nickname: data.nickname,
      avatarUrl: data.avatarUrl,
      mobile: data.mobile,
    });
    return this.mapToUserResponse(result);
  }

  // AccountService methods - implements GetUser/CreateUser/UpdateUser from account.proto
  @GrpcMethod('AccountService', 'GetUser')
  async getUser(data: { id: number }): Promise<UserResponse> {
    const result = await this.userService.findOne(data.id.toString());
    return this.mapToUserResponse(result);
  }

  @GrpcMethod('AccountService', 'CreateUser')
  async accountCreateUser(data: { mobile: string; nickname: string; avatarUrl: string }): Promise<UserResponse> {
    const result = await this.userService.create({
      mobile: data.mobile,
      nickname: data.nickname,
      avatarUrl: data.avatarUrl,
    });
    return this.mapToUserResponse(result);
  }

  @GrpcMethod('AccountService', 'UpdateUser')
  async accountUpdateUser(data: { id: number; nickname: string; avatarUrl: string }): Promise<UserResponse> {
    const result = await this.userService.update(data.id.toString(), {
      nickname: data.nickname,
      avatarUrl: data.avatarUrl,
    });
    return this.mapToUserResponse(result);
  }

  private mapToUserResponse(dto: UserResponseDto): UserResponse {
    return {
      id: dto.id,
      email: dto.email,
      mobile: dto.mobile,
      nickname: dto.nickname,
      avatarUrl: dto.avatarUrl,
      role: dto.role || 'USER',
      status: dto.status || 'ACTIVE',
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }
}

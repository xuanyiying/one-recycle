import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from '../services/user.service';
import { UserResponseDto } from '../dto';

@Controller()
export class UserGrpcController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'FindOne')
  async findOne(data: { id: string }): Promise<UserResponseDto> {
    return this.userService.findOne(data.id);
  }

  @GrpcMethod('UserService', 'FindByMobile')
  async findByMobile(data: {
    mobile: string;
  }): Promise<UserResponseDto | null> {
    return this.userService.findByMobile(data.mobile);
  }

  @GrpcMethod('UserService', 'FindByIdentity')
  async findByIdentity(data: {
    provider: string;
    openid: string;
  }): Promise<UserResponseDto | null> {
    return this.userService.findByIdentity(data.provider, data.openid);
  }
}

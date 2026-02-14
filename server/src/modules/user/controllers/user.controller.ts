import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import {
  CreateUserDto,
  UpdateUserDto,
  QueryUserDto,
  UserResponseDto,
  UserListResponseDto,
} from '../dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Get()
  async findMany(@Query() query: QueryUserDto): Promise<UserListResponseDto> {
    return this.userService.findMany(query);
  }

  @Get('stats')
  async getStats() {
    return this.userService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(id);
  }

  @Get('mobile/:mobile')
  async findByMobile(
    @Param('mobile') mobile: string,
  ): Promise<UserResponseDto | null> {
    return this.userService.findByMobile(mobile);
  }

  @Get('identity/:provider/:openid')
  async findByIdentity(
    @Param('provider') provider: string,
    @Param('openid') openid: string,
  ): Promise<UserResponseDto | null> {
    return this.userService.findByIdentity(provider, openid);
  }

  @Post(':id/identities')
  async createIdentity(
    @Param('id') userId: string,
    @Body()
    identityData: {
      provider: string;
      openid: string;
      unionid?: string;
      appId: string;
    },
  ): Promise<void> {
    return this.userService.createOrUpdateIdentity(userId, identityData);
  }
}

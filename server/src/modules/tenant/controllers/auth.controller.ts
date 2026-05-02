import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StaffService } from '../services/staff.service';
import { StaffLoginDto } from '../dto/staff-login.dto';
import { Public } from '@/common/decorators/auth.decorator';

class RefreshTokenDto {
  refreshToken: string;
}

@ApiTags('租户员工认证')
@Controller('tenant/auth')
export class AuthController {
  constructor(private readonly staffService: StaffService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '员工登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '认证失败' })
  async login(@Body() loginDto: StaffLoginDto) {
    return this.staffService.login(loginDto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResponse({ status: 200, description: '令牌刷新成功' })
  @ApiResponse({ status: 401, description: '刷新令牌无效' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.staffService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取员工个人资料' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProfile(@Request() req: any) {
    return this.staffService.getProfile(req.user.id);
  }
}

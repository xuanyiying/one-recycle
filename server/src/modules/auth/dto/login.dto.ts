import { IsString, IsMobilePhone, IsOptional, Length, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsMobilePhone('zh-CN', {}, { message: '手机号格式不正确' })
  mobile: string;

  @ApiProperty({ description: '验证码', example: '123456' })
  @IsString({ message: '验证码必须为字符串' })
  @Length(6, 6, { message: '验证码必须为6位数字' })
  verificationCode: string;

  @ApiProperty({ description: '设备指纹', required: false })
  @IsOptional()
  @IsString({ message: '设备指纹必须为字符串' })
  deviceFingerprint?: string;

  @ApiProperty({ description: '邀请码（选填）', required: false, maxLength: 6 })
  @IsOptional()
  @IsString({ message: '邀请码必须为字符串' })
  @MaxLength(6, { message: '邀请码长度不能超过 6 位' })
  inviteCode?: string;
}

import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class ThirdPartyLoginDto {
  @IsNotEmpty({ message: '授权码不能为空' })
  @IsString({ message: '授权码必须为字符串' })
  code: string;

  @IsOptional()
  @IsString({ message: '昵称必须为字符串' })
  nickname?: string;

  @IsOptional()
  @IsString({ message: '头像URL必须为字符串' })
  avatarUrl?: string;

  @IsOptional()
  @IsString({ message: '状态参数必须为字符串' })
  state?: string;

  @IsOptional()
  @IsString({ message: '设备指纹必须为字符串' })
  deviceFingerprint?: string;

  @IsOptional()
  @IsString({ message: '邀请码必须为字符串' })
  @MaxLength(6, { message: '邀请码长度不能超过 6 位' })
  inviteCode?: string;
}

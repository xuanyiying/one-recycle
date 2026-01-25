import { IsString, IsOptional } from 'class-validator';

export class LogoutDto {
  @IsOptional()
  @IsString({ message: '刷新令牌必须为字符串' })
  refreshToken?: string;
}

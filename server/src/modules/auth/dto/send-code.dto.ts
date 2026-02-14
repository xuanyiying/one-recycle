import { IsMobilePhone, IsOptional, IsIn } from 'class-validator';

export class SendCodeDto {
  @IsMobilePhone('zh-CN', {}, { message: '手机号格式不正确' })
  mobile: string;

  @IsOptional()
  @IsIn(['login', 'register', 'reset_password'], { message: '验证码类型无效' })
  type?: string;
}

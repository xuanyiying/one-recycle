import { IsNotEmpty, IsString } from 'class-validator';

export class BindInviteDto {
  @IsString()
  @IsNotEmpty()
  inviteCode: string;
}

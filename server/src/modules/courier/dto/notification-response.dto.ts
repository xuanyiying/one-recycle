import { IsString, IsOptional } from 'class-validator';

export class NotificationResponseDto {
  @IsString()
  action: 'ACCEPT' | 'REJECT';

  @IsOptional()
  reason?: string;
}

import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateTaskStatusDto {
  @IsString()
  status:
    | 'ASSIGNED'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'IN_PROGRESS'
    | 'PICKED_UP'
    | 'IN_TRANSIT'
    | 'DELIVERED'
    | 'FAILED'
    | 'CANCELLED';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  actualDuration?: number;
}

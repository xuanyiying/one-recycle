import { TaskStatus } from '../entities/courier.entity';

export class UpdateTaskStatusDto {
  status: TaskStatus;
  notes?: string;
  actualDuration?: number;
}
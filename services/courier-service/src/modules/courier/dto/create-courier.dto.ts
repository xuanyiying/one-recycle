import { WorkingHoursEntity } from '../entities/courier.entity';

export class CreateCourierDto {
  name: string;
  phone: string;
  email?: string;
  workingHours: WorkingHoursEntity;
  serviceAreas: string[];
}
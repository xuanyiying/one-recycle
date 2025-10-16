import { CourierStatus, WorkingHoursEntity } from '../entities/courier.entity';

export class UpdateCourierDto {
  name?: string;
  phone?: string;
  email?: string;
  status?: CourierStatus;
  workingHours?: WorkingHoursEntity;
  serviceAreas?: string[];
  rating?: number;
}
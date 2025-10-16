export class NotificationResponseDto {
  action: 'ACCEPT' | 'REJECT';
  reason?: string;
  estimatedArrivalTime?: Date;
  notes?: string;
}
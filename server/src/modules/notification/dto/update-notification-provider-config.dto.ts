import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificationProviderConfigDto } from './create-notification-provider-config.dto';

export class UpdateNotificationProviderConfigDto extends PartialType(
  CreateNotificationProviderConfigDto,
) {}

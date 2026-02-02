import { PartialType } from '@nestjs/mapped-types';
import { CreateLogisticsProviderDto } from './create-provider.dto';

export class UpdateLogisticsProviderDto extends PartialType(
  CreateLogisticsProviderDto,
) {}

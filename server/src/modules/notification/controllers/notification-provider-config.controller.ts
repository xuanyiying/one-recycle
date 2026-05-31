import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  NotificationProviderConfigService,
  NotificationProviderConfigQueryParams,
} from '../services/notification-provider-config.service';
import { CreateNotificationProviderConfigDto } from '../dto/create-notification-provider-config.dto';
import { UpdateNotificationProviderConfigDto } from '../dto/update-notification-provider-config.dto';
import { IsBoolean } from 'class-validator';

class ToggleStatusDto {
  @IsBoolean()
  isActive: boolean;
}

@Controller('notification-provider-config')
export class NotificationProviderConfigController {
  constructor(
    private readonly configService: NotificationProviderConfigService,
  ) {}

  @Post()
  create(@Body() createDto: CreateNotificationProviderConfigDto) {
    return this.configService.create(createDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('type') type?: string,
    @Query('provider') provider?: string,
  ) {
    const params: NotificationProviderConfigQueryParams = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      type,
      provider,
    };
    return this.configService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.configService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateNotificationProviderConfigDto,
  ) {
    return this.configService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.configService.remove(id);
  }

  @Patch(':id/status')
  toggleStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ToggleStatusDto,
  ) {
    return this.configService.toggleStatus(id, body.isActive);
  }
}

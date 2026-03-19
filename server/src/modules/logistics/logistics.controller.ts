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
  LogisticsService,
  LogisticsProviderQueryParams,
} from './logistics.service';
import { CreateLogisticsProviderDto } from './dto/create-provider.dto';
import { UpdateLogisticsProviderDto } from './dto/update-provider.dto';

@Controller('logistics')
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Post('providers')
  create(@Body() createDto: CreateLogisticsProviderDto) {
    return this.logisticsService.create(createDto);
  }

  @Get('providers')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('sortBy') sortBy?: 'name' | 'createdAt',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const params: LogisticsProviderQueryParams = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      sortBy,
      sortOrder,
    };
    return this.logisticsService.findAll(params);
  }

  @Get('providers/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.logisticsService.findOne(id);
  }

  @Patch('providers/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateLogisticsProviderDto,
  ) {
    return this.logisticsService.update(id, updateDto);
  }

  @Delete('providers/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.logisticsService.remove(id);
  }

  @Get('calculate-freight')
  calculateFreight(
    @Query('weight') weight: number,
    @Query('volume') volume: number,
    @Query('distance') distance: number,
  ) {
    return this.logisticsService.calculateFreight(
      Number(weight),
      Number(volume),
      Number(distance),
    );
  }
}

import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { OrderService } from './services/order.service';

@ApiTags('time-slots')
@Controller('order')
export class TimeSlotController {
  constructor(private readonly orderService: OrderService) {}

  @Get('time-slots/batch')
  @ApiOperation({ summary: '批量获取可用时间段' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: '开始日期 (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'daysCount',
    required: true,
    type: Number,
    description: '获取天数',
  })
  @ApiQuery({
    name: 'addressId',
    required: false,
    type: String,
    description: '地址ID',
  })
  @ApiResponse({ status: 200, description: '获取时间段列表成功' })
  async getBatchTimeSlots(
    @Query('startDate') startDate: string,
    @Query('daysCount', ParseIntPipe) daysCount: number,
    @Query('addressId') addressId?: string,
  ) {
    return this.orderService.getBatchTimeSlots(startDate, daysCount, addressId);
  }

  @Get('time-slots/available')
  @ApiOperation({ summary: '获取指定日期可用时间段' })
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    description: '日期 (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'addressId',
    required: false,
    type: String,
    description: '地址ID',
  })
  @ApiResponse({ status: 200, description: '获取时间段列表成功' })
  async getAvailableTimeSlots(
    @Query('date') date: string,
    @Query('addressId') addressId?: string,
  ) {
    return this.orderService.getAvailableTimeSlots(date, addressId);
  }

  @Get('time-slots/release')
  @ApiOperation({ summary: '释放时间槽' })
  @ApiQuery({
    name: 'slotId',
    required: true,
    type: String,
    description: '时间槽ID',
  })
  @ApiResponse({ status: 200, description: '释放成功' })
  async releaseTimeSlot(@Query('slotId') slotId: string) {
    return this.orderService.releaseTimeSlot(slotId);
  }
}

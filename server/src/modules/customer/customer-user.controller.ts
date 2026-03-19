import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { CustomerUserService } from './customer-user.service';
import {
  CustomerUserQueryDto,
  CustomerPointsRecordResponseDto,
  CustomerOrderResponseDto,
} from './dto/customer-user.dto';

@Controller('admin/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class CustomerUserController {
  constructor(private readonly customerUserService: CustomerUserService) {}

  @Get()
  async findAll(@Query() query: CustomerUserQueryDto) {
    return this.customerUserService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.customerUserService.findOne(id);
  }

  @Get(':id/points-records')
  async getPointsRecords(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<CustomerPointsRecordResponseDto> {
    return this.customerUserService.getPointsRecords(
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      startDate,
      endDate,
    );
  }

  @Get(':id/orders')
  async getOrders(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ): Promise<CustomerOrderResponseDto> {
    return this.customerUserService.getOrders(
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      status,
    );
  }
}

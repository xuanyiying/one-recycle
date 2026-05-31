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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import {
  PaymentConfigService,
  PaymentConfigQueryParams,
} from './payment-config.service';
import { CreatePaymentConfigDto } from './dto/create-payment-config.dto';
import { UpdatePaymentConfigDto } from './dto/update-payment-config.dto';

@Controller('payment-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class PaymentConfigController {
  constructor(private readonly paymentConfigService: PaymentConfigService) {}

  @Post()
  async create(@Body() createDto: CreatePaymentConfigDto): Promise<any> {
    return this.paymentConfigService.create(createDto);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('provider') provider?: string,
  ): Promise<any> {
    const params: PaymentConfigQueryParams = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      provider,
    };
    return this.paymentConfigService.findAll(params);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.paymentConfigService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePaymentConfigDto,
  ): Promise<any> {
    return this.paymentConfigService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.paymentConfigService.remove(id);
  }

  @Patch(':id/status')
  async toggleStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isActive: boolean },
  ): Promise<any> {
    return this.paymentConfigService.toggleStatus(id, body.isActive);
  }

  @Post(':id/test')
  async testConnection(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.paymentConfigService.testConnection(id);
  }
}

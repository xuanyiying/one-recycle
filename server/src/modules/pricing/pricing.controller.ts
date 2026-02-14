import { Body, Controller, Post, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsNumber } from 'class-validator';
import { PricingService, PricingItemInput } from './pricing.service';

class PricingItemDto implements PricingItemInput {
  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  categoryName?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;
}

class PricingEstimateRequestDto {
  @IsArray()
  items: PricingItemDto[];

  @IsOptional()
  @IsString()
  tenantId?: string;
}

@ApiTags('Pricing')
@Controller('pricing')
export class PricingController {
  private readonly logger = new Logger(PricingController.name);

  constructor(private readonly pricingService: PricingService) {}

  @Post('estimate')
  @ApiOperation({ summary: 'Estimate pricing for items' })
  @ApiResponse({ status: 200, description: 'Pricing estimate success' })
  async estimate(@Body() body: PricingEstimateRequestDto) {
    try {
      const result = await this.pricingService.estimatePricing(
        body.items,
        body.tenantId,
      );
      return result.pricing;
    } catch (error) {
      this.logger.error(
        'Pricing estimate failed',
        JSON.stringify({
          tenantId: body.tenantId,
          itemCount: Array.isArray(body.items) ? body.items.length : 0,
        }),
      );
      throw error;
    }
  }
}

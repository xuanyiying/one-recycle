import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { LocationService } from './location.service';
import { Public } from '@/common';

@ApiTags('location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Public()
  @Get('ip')
  @ApiOperation({ summary: '根据 IP 获取大致城市定位' })
  async getCityByIp(@Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.ip ||
      '127.0.0.1';

    const result = await this.locationService.getCityByIp(ip);
    return { success: true, data: result };
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheckResult, HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: '健康检查' })
  @ApiResponse({ status: 200, description: '服务健康' })
  async check(): Promise<HealthCheckResult> {
    return this.healthService.check();
  }

  @Get('ready')
  @ApiOperation({ summary: '就绪检查' })
  @ApiResponse({ status: 200, description: '服务就绪' })
  async readiness() {
    return this.healthService.checkReadiness();
  }

  @Get('live')
  @ApiOperation({ summary: '存活检查' })
  @ApiResponse({ status: 200, description: '服务存活' })
  async liveness() {
    return this.healthService.checkLiveness();
  }
}

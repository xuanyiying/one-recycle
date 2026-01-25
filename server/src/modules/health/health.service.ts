import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/common';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: { status: 'up' | 'down'; responseTime?: number; error?: string };
    redis: { status: 'up' | 'down'; responseTime?: number; error?: string };
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async check(): Promise<HealthCheckResult> {
    const [databaseCheck, redisCheck] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const isHealthy =
      databaseCheck.status === 'up' && redisCheck.status === 'up';

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks: {
        database: databaseCheck,
        redis: redisCheck,
      },
    };
  }

  async checkReadiness() {
    const health = await this.check();
    return {
      status: health.status === 'healthy' ? 'ready' : 'not_ready',
      timestamp: health.timestamp,
    };
  }

  checkLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  private async checkDatabase(): Promise<{
    status: 'up' | 'down';
    responseTime?: number;
    error?: string;
  }> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'up',
        responseTime: Date.now() - start,
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'down',
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkRedis(): Promise<{
    status: 'up' | 'down';
    responseTime?: number;
    error?: string;
  }> {
    const start = Date.now();
    try {
      await this.redis.ping();
      return {
        status: 'up',
        responseTime: Date.now() - start,
      };
    } catch (error) {
      this.logger.error('Redis health check failed', error);
      return {
        status: 'down',
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

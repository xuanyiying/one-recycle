import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/common';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
      warning?: string;
    };
    redis: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
      warning?: string;
    };
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
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
    warning?: string;
  }> {
    const start = Date.now();
    const threshold = this.configService.get<number>(
      'HEALTH_DB_THRESHOLD_MS',
      1000,
    );

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;
      const result: any = {
        status: 'up',
        responseTime,
      };

      if (responseTime > threshold) {
        const msg = `Database response time (${responseTime}ms) exceeded threshold (${threshold}ms)`;
        this.logger.warn(msg);
        result.warning = msg;
      }

      return result;
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
    warning?: string;
  }> {
    const start = Date.now();
    const threshold = this.configService.get<number>(
      'HEALTH_REDIS_THRESHOLD_MS',
      500,
    );

    try {
      await this.redis.ping();
      const responseTime = Date.now() - start;
      const result: any = {
        status: 'up',
        responseTime,
      };

      if (responseTime > threshold) {
        const msg = `Redis response time (${responseTime}ms) exceeded threshold (${threshold}ms)`;
        this.logger.warn(msg);
        result.warning = msg;
      }

      return result;
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

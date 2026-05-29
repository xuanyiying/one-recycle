import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@/common/redis/redis.service';

export interface IpLocationResult {
  city: string;
  province: string;
}

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);
  private readonly tencentMapKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.tencentMapKey = this.configService.get<string>('TENCENT_MAP_KEY', '');
  }

  async getCityByIp(ip: string): Promise<IpLocationResult> {
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return { city: '北京', province: '北京市' };
    }

    const cacheKey = `location:ip:${ip}`;
    const cached = await this.redisService.get<IpLocationResult>(cacheKey);
    if (cached) return cached;

    if (this.tencentMapKey) {
      try {
        const result = await this.fetchTencentIpLocation(ip);
        if (result) {
          await this.redisService.set(cacheKey, result, 3600);
          return result;
        }
      } catch (error) {
        this.logger.warn(`Tencent IP location failed for ${ip}: ${error}`);
      }
    }

    const fallback: IpLocationResult = { city: '北京', province: '北京市' };
    await this.redisService.set(cacheKey, fallback, 3600);
    return fallback;
  }

  private async fetchTencentIpLocation(ip: string): Promise<IpLocationResult | null> {
    const url = `https://apis.map.qq.com/ws/location/v1/ip?ip=${ip}&key=${this.tencentMapKey}`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json() as any;
    if (data.status !== 0 || !data.result?.ad_info) return null;

    const adInfo = data.result.ad_info;
    return {
      city: adInfo.city || adInfo.province || '',
      province: adInfo.province || '',
    };
  }
}

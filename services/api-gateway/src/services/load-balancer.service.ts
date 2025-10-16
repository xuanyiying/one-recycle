import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ServiceConfig } from '../config/gateway.config';
import { firstValueFrom } from 'rxjs';

export interface ServiceInstance {
  config: ServiceConfig;
  isHealthy: boolean;
  currentWeight: number;
  lastHealthCheck: Date;
}

@Injectable()
export class LoadBalancerService {
  private readonly logger = new Logger(LoadBalancerService.name);
  private serviceInstances: Map<string, ServiceInstance[]> = new Map();
  private roundRobinCounters: Map<string, number> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.initializeServices();
    this.startHealthChecks();
  }

  private initializeServices() {
    const services = this.configService.get<Record<string, ServiceConfig[]>>('services');
    
    if (!services) {
      this.logger.error('No services configuration found');
      return;
    }
    
    for (const [serviceName, configs] of Object.entries(services)) {
      const instances: ServiceInstance[] = configs.map((config: ServiceConfig) => ({
        config,
        isHealthy: true,
        currentWeight: config.weight,
        lastHealthCheck: new Date(),
      }));
      
      this.serviceInstances.set(serviceName, instances);
      this.roundRobinCounters.set(serviceName, 0);
    }
  }

  /**
   * 获取服务实例 - 使用加权轮询算法
   */
  getServiceInstance(serviceName: string): ServiceConfig | null {
    const instances = this.serviceInstances.get(serviceName);
    if (!instances || instances.length === 0) {
      this.logger.warn(`No instances found for service: ${serviceName}`);
      return null;
    }

    // 过滤健康的实例
    const healthyInstances = instances.filter(instance => instance.isHealthy);
    if (healthyInstances.length === 0) {
      this.logger.warn(`No healthy instances found for service: ${serviceName}`);
      return null;
    }

    // 如果只有一个健康实例，直接返回
    if (healthyInstances.length === 1) {
      return healthyInstances[0].config;
    }

    // 使用加权轮询算法
    return this.weightedRoundRobin(serviceName, healthyInstances);
  }

  /**
   * 加权轮询算法
   */
  private weightedRoundRobin(serviceName: string, instances: ServiceInstance[]): ServiceConfig {
    let totalWeight = 0;
    let maxCurrentWeight = 0;
    let selectedInstance: ServiceInstance | null = null;

    // 计算总权重并找到当前权重最大的实例
    for (const instance of instances) {
      totalWeight += instance.config.weight;
      instance.currentWeight += instance.config.weight;
      
      if (!selectedInstance || instance.currentWeight > maxCurrentWeight) {
        maxCurrentWeight = instance.currentWeight;
        selectedInstance = instance;
      }
    }

    if (selectedInstance) {
      selectedInstance.currentWeight -= totalWeight;
      return selectedInstance.config;
    }

    // 降级到简单轮询
    return this.roundRobin(serviceName, instances);
  }

  /**
   * 简单轮询算法
   */
  private roundRobin(serviceName: string, instances: ServiceInstance[]): ServiceConfig {
    const counter = this.roundRobinCounters.get(serviceName) || 0;
    const selectedInstance = instances[counter % instances.length];
    this.roundRobinCounters.set(serviceName, counter + 1);
    return selectedInstance.config;
  }

  /**
   * 标记实例为不健康
   */
  markInstanceUnhealthy(serviceName: string, baseUrl: string) {
    const instances = this.serviceInstances.get(serviceName);
    if (instances) {
      const instance = instances.find(inst => inst.config.baseUrl === baseUrl);
      if (instance) {
        instance.isHealthy = false;
        this.logger.warn(`Marked instance as unhealthy: ${serviceName} - ${baseUrl}`);
      }
    }
  }

  /**
   * 健康检查
   */
  private startHealthChecks() {
    setInterval(async () => {
      for (const [serviceName, instances] of this.serviceInstances.entries()) {
        for (const instance of instances) {
          await this.checkInstanceHealth(serviceName, instance);
        }
      }
    }, 30000); // 每30秒检查一次
  }

  private async checkInstanceHealth(serviceName: string, instance: ServiceInstance) {
    try {
      const healthCheckUrl = `${instance.config.baseUrl}${instance.config.healthCheck}`;
      const response = await firstValueFrom(
        this.httpService.get(healthCheckUrl, {
          timeout: 5000,
        })
      );

      const wasUnhealthy = !instance.isHealthy;
      instance.isHealthy = response.status === 200;
      instance.lastHealthCheck = new Date();

      if (wasUnhealthy && instance.isHealthy) {
        this.logger.log(`Instance recovered: ${serviceName} - ${instance.config.baseUrl}`);
      }
    } catch (error) {
      const wasHealthy = instance.isHealthy;
      instance.isHealthy = false;
      instance.lastHealthCheck = new Date();

      if (wasHealthy) {
        this.logger.error(
          `Health check failed for ${serviceName} - ${instance.config.baseUrl}: ${error.message}`
        );
      }
    }
  }

  /**
   * 获取所有服务的健康状态
   */
  getServicesHealth(): Record<string, any> {
    const health: Record<string, any> = {};
    
    for (const [serviceName, instances] of this.serviceInstances.entries()) {
      health[serviceName] = {
        total: instances.length,
        healthy: instances.filter(inst => inst.isHealthy).length,
        instances: instances.map(inst => ({
          name: inst.config.name,
          baseUrl: inst.config.baseUrl,
          isHealthy: inst.isHealthy,
          lastHealthCheck: inst.lastHealthCheck,
        })),
      };
    }
    
    return health;
  }
}
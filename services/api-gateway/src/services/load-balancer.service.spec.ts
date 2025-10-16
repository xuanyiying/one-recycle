import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { LoadBalancerService } from './load-balancer.service';
import { createMockConfigService, createMockHttpService, createTestServiceConfig } from '../../tests/test-utils';
import { of, throwError } from 'rxjs';

describe('LoadBalancerService', () => {
  let service: LoadBalancerService;
  let configService: ConfigService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadBalancerService,
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
        {
          provide: HttpService,
          useValue: createMockHttpService(),
        },
      ],
    }).compile();

    service = module.get<LoadBalancerService>(LoadBalancerService);
    configService = module.get<ConfigService>(ConfigService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getServiceInstance', () => {
    it('should return a service instance using weighted round-robin', () => {
      const serviceName = 'test-service';
      const instance = service.getServiceInstance(serviceName);
      
      expect(instance).toBeDefined();
      expect(instance.name).toBe('test-service-1');
    });

    it('should return null for non-existent service', () => {
      const instance = service.getServiceInstance('non-existent-service');
      expect(instance).toBeNull();
    });

    it('should cycle through instances with round-robin', () => {
      const serviceName = 'test-service';
      
      // Mock multiple instances
      jest.spyOn(configService, 'get').mockReturnValue({
        'test-service': [
          { ...createTestServiceConfig(), name: 'test-service-1' },
          { ...createTestServiceConfig(), name: 'test-service-2' },
        ],
      });

      // Reinitialize service to pick up new config
      service['initializeServices']();

      const instance1 = service.getServiceInstance(serviceName);
      const instance2 = service.getServiceInstance(serviceName);
      const instance3 = service.getServiceInstance(serviceName);

      expect(instance1.name).toBe('test-service-1');
      expect(instance2.name).toBe('test-service-2');
      expect(instance3.name).toBe('test-service-1'); // Should cycle back
    });
  });

  describe('markInstanceUnhealthy', () => {
    it('should mark instance as unhealthy', () => {
      const serviceName = 'test-service';
      
      // Mark instance as unhealthy
      service.markInstanceUnhealthy(serviceName, 'http://localhost:3001');
      
      // Should still return an instance (the healthy one)
      const instance = service.getServiceInstance(serviceName);
      expect(instance).toBeDefined();
    });

    it('should return null when no healthy instances available', () => {
      const serviceName = 'test-service';
      
      // Mark all instances as unhealthy
      service.markInstanceUnhealthy(serviceName, 'http://localhost:3001');
      service.markInstanceUnhealthy(serviceName, 'http://localhost:3002');
      
      const instance = service.getServiceInstance(serviceName);
      expect(instance).toBeNull();
    });
  });

  describe('markInstanceUnhealthy', () => {
    it('should mark instance as unhealthy', () => {
      const serviceName = 'test-service';
      const instanceName = 'test-service-1';
      
      service.markInstanceUnhealthy(serviceName, instanceName);
      
      const instances = service['serviceInstances'].get(serviceName);
      const instance = instances?.find(i => i.config.name === instanceName);
      
      expect(instance?.isHealthy).toBe(false);
    });

    it('should handle non-existent service gracefully', () => {
      expect(() => {
        service.markInstanceUnhealthy('non-existent', 'instance');
      }).not.toThrow();
    });
  });

  describe('getServicesHealth', () => {
    it('should return health status of all services', () => {
      const health = service.getServicesHealth();
      
      expect(health).toBeDefined();
      expect(typeof health).toBe('object');
    });

    it('should include service instance details', () => {
      const health = service.getServicesHealth();
      
      expect(health['test-service']).toBeDefined();
      expect(Array.isArray(health['test-service'])).toBe(true);
    });
  });

  describe('checkHealth', () => {
    it('should perform health check on all services', async () => {
      const httpGetSpy = jest.spyOn(httpService, 'get').mockReturnValue(
        of({ data: { status: 'ok' }, status: 200 } as any)
      );

      await service['checkHealth']();

      expect(httpGetSpy).toHaveBeenCalled();
    });

    it('should mark instance unhealthy on failed health check', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(
        throwError(() => new Error('Health check failed'))
      );

      await service['checkHealth']();

      const instances = service['serviceInstances'].get('test-service');
      const instance = instances?.[0];
      
      expect(instance?.isHealthy).toBe(false);
    });

    it('should mark instance healthy on successful health check', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(
        of({ data: { status: 'ok' }, status: 200 } as any)
      );

      // First mark as unhealthy
      const instances = service['serviceInstances'].get('test-service');
      if (instances?.[0]) {
        instances[0].isHealthy = false;
      }

      await service['checkHealth']();

      expect(instances?.[0]?.isHealthy).toBe(true);
    });
  });

  describe('weighted round-robin', () => {
    it('should respect instance weights', () => {
      const serviceName = 'test-service';
      
      // Mock instances with different weights
      jest.spyOn(configService, 'get').mockReturnValue({
        'test-service': [
          { ...createTestServiceConfig(), name: 'test-service-1', weight: 3 },
          { ...createTestServiceConfig(), name: 'test-service-2', weight: 1 },
        ],
      });

      service['initializeServices']();

      const selections = [];
      for (let i = 0; i < 8; i++) {
        const instance = service.getServiceInstance(serviceName);
        selections.push(instance?.name);
      }

      // Should select service-1 more frequently due to higher weight
      const service1Count = selections.filter(name => name === 'test-service-1').length;
      const service2Count = selections.filter(name => name === 'test-service-2').length;
      
      expect(service1Count).toBeGreaterThan(service2Count);
    });
  });

  describe('error handling', () => {
    it('should handle missing service configuration', () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);
      
      expect(() => {
        service['initializeServices']();
      }).not.toThrow();
    });

    it('should handle empty service configuration', () => {
      jest.spyOn(configService, 'get').mockReturnValue({});
      
      expect(() => {
        service['initializeServices']();
      }).not.toThrow();
    });
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should return "Hello Dispatch Service!"', () => {
      const result = service.getHello();
      expect(result).toBe('Hello Dispatch Service!');
    });

    it('should always return the same message', () => {
      const result1 = service.getHello();
      const result2 = service.getHello();
      expect(result1).toBe(result2);
    });

    it('should return a string', () => {
      const result = service.getHello();
      expect(typeof result).toBe('string');
    });

    it('should return a non-empty string', () => {
      const result = service.getHello();
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should contain service name', () => {
      const result = service.getHello();
      expect(result).toContain('Dispatch Service');
    });

    it('should start with "Hello"', () => {
      const result = service.getHello();
      expect(result).toMatch(/^Hello/);
    });
  });
});
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('should return hello message', () => {
      const result = service.getHello();
      expect(result).toBe('Hello Notification Service!');
    });

    it('should always return the same message', () => {
      const result1 = service.getHello();
      const result2 = service.getHello();
      
      expect(result1).toBe(result2);
      expect(result1).toBe('Hello Notification Service!');
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

    it('should return message containing service name', () => {
      const result = service.getHello();
      expect(result).toContain('Notification Service');
    });

    it('should return message starting with Hello', () => {
      const result = service.getHello();
      expect(result).toMatch(/^Hello/);
    });
  });
});
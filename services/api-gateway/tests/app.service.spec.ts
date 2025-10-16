import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../src/app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe('getHealth', () => {
    it('should return health message', () => {
      const result = service.getHealth();
      expect(result).toBe('API Gateway is healthy!');
    });

    it('should always return the same message', () => {
      const result1 = service.getHealth();
      const result2 = service.getHealth();
      
      expect(result1).toBe(result2);
      expect(result1).toBe('API Gateway is healthy!');
    });
  });
});
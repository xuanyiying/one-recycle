import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';

describe('SystemController', () => {
  let controller: SystemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [SystemController],
      providers: [SystemService],
    }).compile();

    controller = module.get<SystemController>(SystemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getQA', () => {
    it('should return an array of QA items', () => {
      const result = controller.getQA();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should match the QAResponseDto structure', () => {
      const result = controller.getQA();
      const firstItem = result[0];

      expect(firstItem).toHaveProperty('id');
      expect(firstItem).toHaveProperty('question');
      expect(firstItem).toHaveProperty('answer');
      expect(firstItem).toHaveProperty('order');

      expect(typeof firstItem.id).toBe('number');
      expect(typeof firstItem.question).toBe('string');
    });

    it('should return at least 20 items (as requested)', () => {
      const result = controller.getQA();
      expect(result.length).toBeGreaterThanOrEqual(20);
    });
  });

  describe('getNewsBriefs', () => {
    it('should return random news briefs', () => {
      const result = controller.getNewsBriefs();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('nickname');
      expect(result[0]).toHaveProperty('earnings');
    });
  });
});

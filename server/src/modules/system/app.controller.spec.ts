import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('SystemController', () => {
  let controller: SystemController;

  const mockPrismaService = {
    fAQ: {
      findMany: jest.fn().mockResolvedValue(
        Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          question: `Question ${i + 1}`,
          answer: `Answer ${i + 1}`,
          sortOrder: i,
          isActive: true,
        })),
      ),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [SystemController],
      providers: [
        SystemService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<SystemController>(SystemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getQA', () => {
    it('should return an array of QA items', async () => {
      const result = await controller.getQA();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should match the QAResponseDto structure', async () => {
      const result = await controller.getQA();
      const firstItem = result[0];

      expect(firstItem).toHaveProperty('id');
      expect(firstItem).toHaveProperty('question');
      expect(firstItem).toHaveProperty('answer');
      expect(firstItem).toHaveProperty('order');

      expect(typeof firstItem.id).toBe('number');
      expect(typeof firstItem.question).toBe('string');
    });

    it('should return at least 20 items (as requested)', async () => {
      const result = await controller.getQA();
      expect(result.length).toBeGreaterThanOrEqual(20);
    });
  });

  describe('getNewsBriefs', () => {
    it('should return news briefs from completed orders', async () => {
      const result = await controller.getNewsBriefs();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('nickname');
        expect(result[0]).toHaveProperty('earnings');
      }
    });
  });
});

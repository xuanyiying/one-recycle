import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  const mockAppService = {
    getHello: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHello', () => {
    it('should return "Hello Dispatch Service!"', () => {
      const expectedMessage = 'Hello Dispatch Service!';
      mockAppService.getHello.mockReturnValue(expectedMessage);

      const result = appController.getHello();

      expect(result).toBe(expectedMessage);
      expect(appService.getHello).toHaveBeenCalledTimes(1);
    });

    it('should handle service error', () => {
      const errorMessage = 'Service error';
      mockAppService.getHello.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      expect(() => appController.getHello()).toThrow(errorMessage);
      expect(appService.getHello).toHaveBeenCalledTimes(1);
    });

    it('should return different message when service returns different value', () => {
      const customMessage = 'Custom message';
      mockAppService.getHello.mockReturnValue(customMessage);

      const result = appController.getHello();

      expect(result).toBe(customMessage);
      expect(appService.getHello).toHaveBeenCalledTimes(1);
    });

    it('should handle empty string from service', () => {
      mockAppService.getHello.mockReturnValue('');

      const result = appController.getHello();

      expect(result).toBe('');
      expect(appService.getHello).toHaveBeenCalledTimes(1);
    });

    it('should handle null from service', () => {
      mockAppService.getHello.mockReturnValue(null);

      const result = appController.getHello();

      expect(result).toBeNull();
      expect(appService.getHello).toHaveBeenCalledTimes(1);
    });

    it('should handle undefined from service', () => {
      mockAppService.getHello.mockReturnValue(undefined);

      const result = appController.getHello();

      expect(result).toBeUndefined();
      expect(appService.getHello).toHaveBeenCalledTimes(1);
    });
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });

    it('should have appService injected', () => {
      expect(appService).toBeDefined();
    });
  });
});
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

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('getHello', () => {
    it('should return hello message', () => {
      const expectedMessage = 'Hello Notification Service!';
      mockAppService.getHello.mockReturnValue(expectedMessage);

      const result = appController.getHello();

      expect(appService.getHello).toHaveBeenCalled();
      expect(result).toBe(expectedMessage);
    });

    it('should handle service error', () => {
      const error = new Error('Service error');
      mockAppService.getHello.mockImplementation(() => {
        throw error;
      });

      expect(() => appController.getHello()).toThrow('Service error');
      expect(appService.getHello).toHaveBeenCalled();
    });

    it('should return different messages from service', () => {
      const customMessage = 'Custom notification service message';
      mockAppService.getHello.mockReturnValue(customMessage);

      const result = appController.getHello();

      expect(result).toBe(customMessage);
    });

    it('should handle empty string from service', () => {
      mockAppService.getHello.mockReturnValue('');

      const result = appController.getHello();

      expect(result).toBe('');
    });

    it('should handle null from service', () => {
      mockAppService.getHello.mockReturnValue(null);

      const result = appController.getHello();

      expect(result).toBeNull();
    });

    it('should handle undefined from service', () => {
      mockAppService.getHello.mockReturnValue(undefined);

      const result = appController.getHello();

      expect(result).toBeUndefined();
    });
  });
});
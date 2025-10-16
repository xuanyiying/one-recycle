import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { NotificationController } from './notification.controller';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('NotificationController', () => {
  let controller: NotificationController;
  let httpService: HttpService;

  const mockAxiosResponse: AxiosResponse = {
    data: {},
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(() => of(mockAxiosResponse)),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendSms', () => {
    it('should call httpService.post with correct URL and SMS data', async () => {
      const smsData = { phoneNumber: '+1234567890', message: 'Test message' };
      
      await controller.sendSms(smsData);
      
      expect(httpService.post).toHaveBeenCalledWith(
        'http://notification-service:3004/notifications/send-sms',
        smsData
      );
    });
  });

  describe('sendEmail', () => {
    it('should call httpService.post with correct URL and email data', async () => {
      const emailData = { 
        to: 'test@example.com', 
        subject: 'Test Subject', 
        body: 'Test Body' 
      };
      
      await controller.sendEmail(emailData);
      
      expect(httpService.post).toHaveBeenCalledWith(
        'http://notification-service:3004/notifications/send-email',
        emailData
      );
    });
  });

  describe('sendPush', () => {
    it('should call httpService.post with correct URL and push data', async () => {
      const pushData = { 
        userId: '123', 
        title: 'Test Title', 
        body: 'Test Body' 
      };
      
      await controller.sendPush(pushData);
      
      expect(httpService.post).toHaveBeenCalledWith(
        'http://notification-service:3004/notifications/send-push',
        pushData
      );
    });
  });
});
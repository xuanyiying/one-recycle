import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AccountClient } from './account.client';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AccountClient', () => {
  let service: AccountClient;

  beforeEach(async () => {
    mockedAxios.create.mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
    } as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountClient,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key, defaultValue) => defaultValue),
          },
        },
      ],
    }).compile();

    service = module.get<AccountClient>(AccountClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUserByMobile', () => {
    it('should normalize mobile number by removing spaces', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { id: '1', mobile: '15529328373' },
          message: 'Success',
        },
      };

      // Mock axios instance method
      const mockGet = jest.fn().mockResolvedValue(mockResponse);
      (service as any).client.get = mockGet;

      const mobileWithSpaces = ' 155 2932 8373 ';
      const result = await service.findUserByMobile(mobileWithSpaces);

      expect(mockGet).toHaveBeenCalledWith('/users/mobile/15529328373');
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should return null if user not found (data is null)', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: null,
          message: 'Success',
        },
      };

      const mockGet = jest.fn().mockResolvedValue(mockResponse);
      (service as any).client.get = mockGet;

      const result = await service.findUserByMobile('15529328373');

      expect(result).toBeNull();
    });

    it('should return null on 404 error', async () => {
      const mockGet = jest.fn().mockRejectedValue({
        response: { status: 404 },
      });
      (service as any).client.get = mockGet;

      const result = await service.findUserByMobile('15529328373');

      expect(result).toBeNull();
    });
  });
});

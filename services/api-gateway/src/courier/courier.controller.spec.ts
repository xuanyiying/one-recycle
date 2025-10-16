import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { CourierController } from './courier.controller';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('CourierController', () => {
  let controller: CourierController;
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
      controllers: [CourierController],
      providers: [
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(() => of(mockAxiosResponse)),
            post: jest.fn(() => of(mockAxiosResponse)),
            put: jest.fn(() => of(mockAxiosResponse)),
            delete: jest.fn(() => of(mockAxiosResponse)),
          },
        },
      ],
    }).compile();

    controller = module.get<CourierController>(CourierController);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllCouriers', () => {
    it('should call httpService.get with correct URL', async () => {
      await controller.getAllCouriers();
      expect(httpService.get).toHaveBeenCalledWith('http://courier-service:3005/couriers');
    });
  });

  describe('getCourier', () => {
    it('should call httpService.get with correct URL and ID', async () => {
      const id = '123';
      await controller.getCourier(id);
      expect(httpService.get).toHaveBeenCalledWith(`http://courier-service:3005/couriers/${id}`);
    });
  });

  describe('createCourier', () => {
    it('should call httpService.post with correct URL and data', async () => {
      const courierData = { name: 'Test Courier' };
      await controller.createCourier(courierData);
      expect(httpService.post).toHaveBeenCalledWith('http://courier-service:3005/couriers', courierData);
    });
  });

  describe('updateCourier', () => {
    it('should call httpService.put with correct URL, ID and data', async () => {
      const id = '123';
      const courierData = { name: 'Updated Courier' };
      await controller.updateCourier(id, courierData);
      expect(httpService.put).toHaveBeenCalledWith(`http://courier-service:3005/couriers/${id}`, courierData);
    });
  });

  describe('deleteCourier', () => {
    it('should call httpService.delete with correct URL and ID', async () => {
      const id = '123';
      await controller.deleteCourier(id);
      expect(httpService.delete).toHaveBeenCalledWith(`http://courier-service:3005/couriers/${id}`);
    });
  });

  describe('getCourierAssignments', () => {
    it('should call httpService.get with correct URL and ID', async () => {
      const id = '123';
      await controller.getCourierAssignments(id);
      expect(httpService.get).toHaveBeenCalledWith(`http://courier-service:3005/couriers/${id}/assignments`);
    });
  });
});
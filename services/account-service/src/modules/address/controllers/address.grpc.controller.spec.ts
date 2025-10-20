// 添加 BigInt 序列化支持
if (!(BigInt.prototype as any).toJSON) {
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
}

import { Test, TestingModule } from '@nestjs/testing';
import { AddressGrpcController } from './address.grpc.controller';
import { AddressService } from '../services/address.service';
import {
  createTestAddress,
} from '../../../../tests/test-utils';
import {
  CreateAddressRequest,
  GetAddressesRequest,
  UpdateAddressRequest,
  DeleteAddressRequest,
} from '../../../proto/account.pb';

describe('AddressGrpcController', () => {
  let controller: AddressGrpcController;
  let addressService: jest.Mocked<AddressService>;

  beforeEach(async () => {
    const mockAddressService = {
      create: jest.fn(),
      findAllByUserId: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressGrpcController],
      providers: [
        {
          provide: AddressService,
          useValue: mockAddressService,
        },
      ],
    }).compile();

    controller = module.get<AddressGrpcController>(AddressGrpcController);
    addressService = module.get(AddressService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAddress', () => {
    it('should create an address successfully', async () => {
      const request: CreateAddressRequest = {
        userId: 1,
        consignee: 'John Doe',
        mobile: '13800138000',
        province: 'Beijing',
        city: 'Beijing',
        district: 'Chaoyang',
        detail: '123 Main St',
        isDefault: true,
      };
      const expectedAddress = createTestAddress();

      addressService.create.mockResolvedValue(expectedAddress);

      const result = await controller.createAddress(request);

      expect(addressService.create).toHaveBeenCalledWith({
        userId: Number(request.userId),
        consignee: request.consignee,
        mobile: request.mobile,
        province: request.province,
        city: request.city,
        district: request.district,
        detail: request.detail,
        isDefault: request.isDefault,
      });
      expect(result.id).toEqual(Number(expectedAddress.id));
      expect(result.consignee).toEqual(expectedAddress.consignee);
      expect(result.mobile).toEqual(expectedAddress.mobile);
    });

    it('should handle address creation error', async () => {
      const request: CreateAddressRequest = {
        userId: 1,
        consignee: 'John Doe',
        mobile: '13800138000',
        province: 'Beijing',
        city: 'Beijing',
        district: 'Chaoyang',
        detail: '123 Main St',
        isDefault: false,
      };
      const error = new Error('Address creation failed');
      (error as any).code = 'NOT_FOUND';

      addressService.create.mockRejectedValue(error);

      const result = await controller.createAddress(request) as any;
      expect(result).toEqual({ code: 5, message: 'Address creation failed' }); // NOT_FOUND
    });
  });

  describe('getAddresses', () => {
    it('should return all addresses for a user', async () => {
      const request: GetAddressesRequest = { userId: 1 };
      const expectedAddresses = [
        createTestAddress({ userId: 1 }),
        createTestAddress({ userId: 1, id: 2, isDefault: false }),
      ];

      addressService.findAllByUserId.mockResolvedValue(expectedAddresses);

      const result = await controller.getAddresses(request);

      expect(addressService.findAllByUserId).toHaveBeenCalledWith(Number(request.userId));
      expect(result.addresses).toHaveLength(2);
      expect(result.addresses[0].id).toEqual(Number(expectedAddresses[0].id));
      expect(result.addresses[1].id).toEqual(Number(expectedAddresses[1].id));
    });

    it('should handle address not found', async () => {
      const request: GetAddressesRequest = { userId: 999 };
      const error = new Error('User not found');
      (error as any).code = 'NOT_FOUND';

      addressService.findAllByUserId.mockRejectedValue(error);

      const result = await controller.getAddresses(request) as any;
      expect(result).toEqual({ code: 5, message: 'User not found' }); // NOT_FOUND
    });
  });

  describe('updateAddress', () => {
    it('should update an address successfully', async () => {
      const request: UpdateAddressRequest = {
        id: 1,
        consignee: 'Updated Name',
        mobile: '13800138001',
        province: 'Shanghai',
        city: 'Shanghai',
        district: 'Pudong',
        detail: '456 New St',
        isDefault: false,
      };
      const expectedAddress = createTestAddress({
        consignee: 'Updated Name',
        mobile: '13800138001',
        province: 'Shanghai',
        city: 'Shanghai',
        district: 'Pudong',
        detail: '456 New St',
        isDefault: false,
      });

      addressService.update.mockResolvedValue(expectedAddress);

      const result = await controller.updateAddress(request);

      expect(addressService.update).toHaveBeenCalledWith(Number(request.id), {
        consignee: request.consignee,
        mobile: request.mobile,
        province: request.province,
        city: request.city,
        district: request.district,
        detail: request.detail,
        isDefault: request.isDefault,
      });
      expect(result.id).toEqual(Number(expectedAddress.id));
      expect(result.consignee).toEqual(expectedAddress.consignee);
    });

    it('should handle service errors', async () => {
      const request: UpdateAddressRequest = {
        id: 999,
        consignee: 'Updated Name',
        mobile: '13800138001',
        province: 'Shanghai',
        city: 'Shanghai',
        district: 'Pudong',
        detail: '456 New St',
        isDefault: false,
      };
      const error = new Error('Address not found');
      (error as any).code = 'NOT_FOUND';

      addressService.update.mockRejectedValue(error);

      const result = await controller.updateAddress(request) as any;
      expect(result).toEqual({ code: 5, message: 'Address not found' }); // NOT_FOUND
    });
  });

  describe('deleteAddress', () => {
    it('should delete an address successfully', async () => {
      const request: DeleteAddressRequest = { id: 1 };
      const expectedAddress = createTestAddress();

      addressService.remove.mockResolvedValue(expectedAddress);

      const result = await controller.deleteAddress(request);

      expect(addressService.remove).toHaveBeenCalledWith(Number(request.id));
      expect(result).toEqual({});
    });

    it('should handle service errors', async () => {
      const request: DeleteAddressRequest = { id: 999 };
      const error = new Error('Address not found');
      (error as any).code = 'NOT_FOUND';

      addressService.remove.mockRejectedValue(error);

      const result = await controller.deleteAddress(request) as any;
      expect(result).toEqual({ code: 5, message: 'Address not found' }); // NOT_FOUND
    });
  });
});
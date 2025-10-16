import { Test, TestingModule } from '@nestjs/testing';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import {
  createTestAddress,
  createCreateAddressDto,
} from '../../tests/test-utils';

describe('AddressController', () => {
  let controller: AddressController;
  let addressService: jest.Mocked<AddressService>;

  beforeEach(async () => {
    const mockAddressService = {
      create: jest.fn(),
      findAllByUserId: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressController],
      providers: [
        {
          provide: AddressService,
          useValue: mockAddressService,
        },
      ],
    }).compile();

    controller = module.get<AddressController>(AddressController);
    addressService = module.get(AddressService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an address successfully', async () => {
      const createAddressDto = createCreateAddressDto();
      const expectedAddress = createTestAddress();

      addressService.create.mockResolvedValue(expectedAddress);

      const result = await controller.create(createAddressDto);

      expect(addressService.create).toHaveBeenCalledWith(createAddressDto);
      expect(result).toEqual(expectedAddress);
    });

    it('should handle service errors', async () => {
      const createAddressDto = createCreateAddressDto();
      const error = new Error('Service error');

      addressService.create.mockRejectedValue(error);

      await expect(controller.create(createAddressDto)).rejects.toThrow(error);
      expect(addressService.create).toHaveBeenCalledWith(createAddressDto);
    });
  });

  describe('findAllByUserId', () => {
    it('should return all addresses for a user', async () => {
      const userId = 1;
      const expectedAddresses = [
        createTestAddress({ userId }),
        createTestAddress({ userId, id: 2, isDefault: false }),
      ];

      addressService.findAllByUserId.mockResolvedValue(expectedAddresses);

      const result = await controller.findAllByUserId(userId);

      expect(addressService.findAllByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedAddresses);
    });

    it('should return empty array when user has no addresses', async () => {
      const userId = 1;
      const expectedAddresses: any[] = [];

      addressService.findAllByUserId.mockResolvedValue(expectedAddresses);

      const result = await controller.findAllByUserId(userId);

      expect(addressService.findAllByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedAddresses);
    });

    it('should handle service errors', async () => {
      const userId = 999;
      const error = new Error('User not found');

      addressService.findAllByUserId.mockRejectedValue(error);

      await expect(controller.findAllByUserId(userId)).rejects.toThrow(error);
      expect(addressService.findAllByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update an address successfully', async () => {
      const addressId = 1;
      const updateData = { 
        consignee: 'Updated Name',
        mobile: '13800138001'
      };
      const expectedAddress = createTestAddress({ ...updateData });

      addressService.update.mockResolvedValue(expectedAddress);

      const result = await controller.update(addressId, updateData);

      expect(addressService.update).toHaveBeenCalledWith(addressId, updateData);
      expect(result).toEqual(expectedAddress);
    });

    it('should handle service errors', async () => {
      const addressId = 999;
      const updateData = { consignee: 'Updated Name' };
      const error = new Error('Address not found');

      addressService.update.mockRejectedValue(error);

      await expect(controller.update(addressId, updateData)).rejects.toThrow(error);
      expect(addressService.update).toHaveBeenCalledWith(addressId, updateData);
    });

    it('should handle partial updates', async () => {
      const addressId = 1;
      const partialUpdateData = { isDefault: true };
      const expectedAddress = createTestAddress({ isDefault: true });

      addressService.update.mockResolvedValue(expectedAddress);

      const result = await controller.update(addressId, partialUpdateData);

      expect(addressService.update).toHaveBeenCalledWith(addressId, partialUpdateData);
      expect(result).toEqual(expectedAddress);
    });
  });

  describe('remove', () => {
    it('should remove an address successfully', async () => {
      const addressId = 1;
      const removedAddress = createTestAddress();

      addressService.remove.mockResolvedValue(removedAddress);

      const result = await controller.remove(addressId);

      expect(addressService.remove).toHaveBeenCalledWith(addressId);
      expect(result).toEqual(removedAddress);
    });

    it('should handle service errors', async () => {
      const addressId = 999;
      const error = new Error('Address not found');

      addressService.remove.mockRejectedValue(error);

      await expect(controller.remove(addressId)).rejects.toThrow(error);
      expect(addressService.remove).toHaveBeenCalledWith(addressId);
    });
  });
});
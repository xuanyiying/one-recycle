import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Address } from '@prisma/client';
import { AddressService } from './address.service';
import {
  CreateAddressRequest,
  GetAddressesRequest,
  UpdateAddressRequest,
  DeleteAddressRequest,
  AddressResponse,
  AddressListResponse,
  Empty,
} from '@/proto/account.pb';

@Controller()
export class AddressGrpcController {
  constructor(private readonly addressService: AddressService) {}

  @GrpcMethod('AccountService', 'CreateAddress')
  async createAddress(data: CreateAddressRequest): Promise<AddressResponse> {
    const address = await this.addressService.create({
      userId: String(data.userId),
      name: data.name,
      mobile: data.mobile,
      province: data.province,
      city: data.city,
      district: data.district,
      town: data.town || '',
      street: data.street || '',
      zipCode: data.zipCode || '',
      detail: data.detail,
      isDefault: data.isDefault,
    });
    return this.mapToAddressResponse(address);
  }

  @GrpcMethod('AccountService', 'GetAddresses')
  async getAddresses(data: GetAddressesRequest): Promise<AddressListResponse> {
    const addresses = await this.addressService.findAllByUserId(data.userId);
    return {
      addresses: addresses.map((address: Address) =>
        this.mapToAddressResponse(address),
      ),
    };
  }

  @GrpcMethod('AccountService', 'UpdateAddress')
  async updateAddress(data: UpdateAddressRequest): Promise<AddressResponse> {
    const address = await this.addressService.update(data.id, {
      name: data.name,
      mobile: data.mobile,
      province: data.province,
      city: data.city,
      district: data.district,
      detail: data.detail,
      isDefault: data.isDefault,
    });
    return this.mapToAddressResponse(address);
  }

  @GrpcMethod('AccountService', 'DeleteAddress')
  async deleteAddress(data: DeleteAddressRequest): Promise<Empty> {
    await this.addressService.remove(data.id);
    return {};
  }

  private mapToAddressResponse(address: Address): AddressResponse {
    return {
      id: address.id.toString(),
      userId: address.userId.toString(),
      name: address.name,
      mobile: address.mobile,
      province: address.province,
      city: address.city,
      district: address.district,
      detail: address.detail,
      isDefault: address.isDefault,
      createdAt: address.createdAt.toISOString(),
      updatedAt: address.updatedAt.toISOString(),
    };
  }
}

import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AddressService } from './address.service';
import {
  CreateAddressRequest,
  GetAddressesRequest,
  UpdateAddressRequest,
  DeleteAddressRequest,
  AddressResponse,
  AddressListResponse,
  Empty
} from '../proto/account.pb';

@Controller()
export class AddressGrpcController {
  constructor(private readonly addressService: AddressService) { }

  @GrpcMethod('AccountService', 'CreateAddress')
  async createAddress(data: CreateAddressRequest): Promise<AddressResponse> {
    try {
      const address = await this.addressService.create({
        userId: Number(data.userId),
        consignee: data.consignee,
        mobile: data.mobile,
        province: data.province,
        city: data.city,
        district: data.district,
        detail: data.detail,
        isDefault: data.isDefault
      });
      return this.mapToAddressResponse(address);
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('AccountService', 'GetAddresses')
  async getAddresses(data: GetAddressesRequest): Promise<AddressListResponse> {
    try {
      const addresses = await this.addressService.findAllByUserId(Number(data.userId));
      return {
        addresses: addresses.map((address: any) => this.mapToAddressResponse(address))
      };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('AccountService', 'UpdateAddress')
  async updateAddress(data: UpdateAddressRequest): Promise<AddressResponse> {
    try {
      const address = await this.addressService.update(Number(data.id), {
        consignee: data.consignee,
        mobile: data.mobile,
        province: data.province,
        city: data.city,
        district: data.district,
        detail: data.detail,
        isDefault: data.isDefault
      });
      return this.mapToAddressResponse(address);
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('AccountService', 'DeleteAddress')
  async deleteAddress(data: DeleteAddressRequest): Promise<Empty> {
    try {
      await this.addressService.remove(Number(data.id));
      return {};
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  private mapToAddressResponse(address: any): AddressResponse {
    return {
      id: Number(address.id),
      userId: Number(address.userId),
      consignee: address.consignee || '',
      mobile: address.mobile || '',
      province: address.province || '',
      city: address.city || '',
      district: address.district || '',
      detail: address.detail || '',
      isDefault: address.isDefault || false,
      createdAt: address.createdAt.toISOString(),
      updatedAt: address.updatedAt.toISOString()
    };
  }

  private handleGrpcError(error: any): any {
    if (error.code === 'NOT_FOUND') {
      return { code: 5, message: error.message }; // NOT_FOUND
    }
    if (error.code === 'ALREADY_EXISTS') {
      return { code: 6, message: error.message }; // ALREADY_EXISTS
    }
    return { code: 13, message: 'Internal server error' }; // INTERNAL
  }
}
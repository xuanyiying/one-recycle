import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { AddressService } from '../services/address.service';
import { CreateAddressDto } from '../dto/create-address.dto';

@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) { }

  @Post()
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressService.create(createAddressDto);
  }

  @Get('user/:userId')
  findAllByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.addressService.findAllByUserId(userId);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateData: Partial<CreateAddressDto>) {
    return this.addressService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.addressService.remove(id);
  }
}
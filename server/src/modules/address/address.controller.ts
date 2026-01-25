import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';

@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressService.create(createAddressDto);
  }

  @Get('regions/:parentCode')
  getRegions(@Param('parentCode') parentCode: string) {
    return this.addressService.getRegionsByParent(parentCode);
  }

  @Get('user/:userId')
  findAllByUserId(@Param('userId') userId: string) {
    return this.addressService.findAllByUserId(userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateAddressDto>,
  ) {
    return this.addressService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.addressService.remove(id);
  }

  @Put(':id/default')
  setDefault(@Param('id') id: string) {
    return this.addressService.setDefault(id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async create(createAddressDto: CreateAddressDto) {
    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(createAddressDto.userId) }
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return this.prisma.address.create({
      data: {
        ...createAddressDto,
        userId: BigInt(createAddressDto.userId)
      }
    });
  }

  async findAllByUserId(userId: number) {
    return this.prisma.address.findMany({
      where: { userId: BigInt(userId) },
      orderBy: { isDefault: 'desc' }
    });
  }

  async update(id: number, updateData: Partial<CreateAddressDto>) {
    const address = await this.prisma.address.findUnique({
      where: { id: BigInt(id) }
    });

    if (!address) {
      throw new NotFoundException('地址不存在');
    }

    // 如果设置为默认地址，取消其他地址的默认状态
    if (updateData.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId: address.userId, id: { not: BigInt(id) } },
        data: { isDefault: false }
      });
    }

    return this.prisma.address.update({
      where: { id: BigInt(id) },
      data: {
        ...updateData,
        userId: updateData.userId ? BigInt(updateData.userId) : undefined
      }
    });
  }

  async remove(id: number) {
    const address = await this.prisma.address.findUnique({
      where: { id: BigInt(id) }
    });

    if (!address) {
      throw new NotFoundException('地址不存在');
    }

    return this.prisma.address.delete({
      where: { id: BigInt(id) }
    });
  }
}
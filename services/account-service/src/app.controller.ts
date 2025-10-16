import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PrismaService } from './prisma/prisma.service';

interface FindOneUserRequest {
  id: number;
}

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @GrpcMethod('AccountService', 'FindOne')
  async findOne(data: FindOneUserRequest): Promise<any> {
    return this.prisma.user.findUnique({
      where: { id: BigInt(data.id) },
    });
  }
}
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserGrpcController } from './user.grpc.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [UserController, UserGrpcController],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
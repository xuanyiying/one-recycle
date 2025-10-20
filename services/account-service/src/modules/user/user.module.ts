import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { UserGrpcController } from './controllers/user.grpc.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [UserController, UserGrpcController],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule { }
import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { UserGrpcController } from './controllers/user.grpc.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController, UserGrpcController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { UserGrpcController } from './controllers/user.grpc.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AccountModule)],
  controllers: [UserController, UserGrpcController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

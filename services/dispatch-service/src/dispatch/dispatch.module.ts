import { Module } from '@nestjs/common';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';
import { JdExpressService } from '../jd-express/jd-express.service';

@Module({
    controllers: [DispatchController],
    providers: [DispatchService, JdExpressService],
    exports: [DispatchService, JdExpressService],
})
export class DispatchModule { }
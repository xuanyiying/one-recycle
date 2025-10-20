import { Module } from '@nestjs/common';
import { ExampleService } from './services/example.service';
import { ExampleController } from './controllers/example.controller';

@Module({
  controllers: [ExampleController],
  providers: [ExampleService],
  exports: [ExampleService],
})
export class ExampleModule {}
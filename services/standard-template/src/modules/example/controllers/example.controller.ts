import { Controller, Get } from '@nestjs/common';
import { ExampleService } from '../services/example.service';

@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get()
  getHello(): string {
    return this.exampleService.getHello();
  }
}
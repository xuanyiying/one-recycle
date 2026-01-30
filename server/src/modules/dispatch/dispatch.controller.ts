import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { TaskStatus } from '@prisma/client';

@Controller('dispatch')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post('assign')
  async assignOrder(
    @Body() assignData: { orderId: string; courierId: string },
  ) {
    return this.dispatchService.assignOrder(
      assignData.orderId,
      assignData.courierId,
    );
  }

  @Get('assignments')
  async getAllAssignments() {
    return this.dispatchService.getAllAssignments();
  }

  @Get('assignments/:id')
  async getAssignment(@Param('id') id: string) {
    return this.dispatchService.getAssignment(id);
  }

  @Put('assignments/:id/status')
  async updateAssignmentStatus(
    @Param('id') id: string,
    @Body() statusData: { status: TaskStatus },
  ) {
    return this.dispatchService.updateAssignmentStatus(id, statusData.status);
  }

  @Post('assignments/:id/accept')
  async acceptAssignment(@Param('id') id: string) {
    return this.dispatchService.acceptAssignment(id);
  }

  @Post('assignments/:id/reject')
  async rejectAssignment(@Param('id') id: string) {
    return this.dispatchService.rejectAssignment(id);
  }
}

import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DispatchService } from './dispatch.service';
import {
  AssignOrderRequest,
  GetAssignmentRequest,
  UpdateAssignmentStatusRequest,
  AcceptAssignmentRequest,
  RejectAssignmentRequest,
  ListAssignmentsRequest,
  AssignOrderResponse,
  AssignmentResponse,
  ListAssignmentsResponse,
} from '@/proto/dispatch.pb';

@Controller()
export class DispatchGrpcController {
  constructor(private readonly dispatchService: DispatchService) {}

  @GrpcMethod('DispatchService', 'AssignOrder')
  async assignOrder(data: AssignOrderRequest): Promise<AssignOrderResponse> {
    const result = await this.dispatchService.assignOrder(
      data.orderId,
      data.courierId,
    );
    return {
      success: result.success,
      orderId: result.orderId,
      courierId: result.courierId,
      assignmentId: result.assignmentId,
    };
  }

  @GrpcMethod('DispatchService', 'GetAssignment')
  async getAssignment(data: GetAssignmentRequest): Promise<AssignmentResponse> {
    const result = await this.dispatchService.getAssignment(data.id);
    return this.mapToAssignmentResponse(result);
  }

  @GrpcMethod('DispatchService', 'UpdateAssignmentStatus')
  async updateAssignmentStatus(
    data: UpdateAssignmentStatusRequest,
  ): Promise<AssignmentResponse> {
    const result = await this.dispatchService.updateAssignmentStatus(
      data.id,
      data.status as any,
    );
    return this.mapToAssignmentResponse(result);
  }

  @GrpcMethod('DispatchService', 'AcceptAssignment')
  async acceptAssignment(
    data: AcceptAssignmentRequest,
  ): Promise<AssignmentResponse> {
    const result = await this.dispatchService.acceptAssignment(data.id);
    return this.mapToAssignmentResponse(result);
  }

  @GrpcMethod('DispatchService', 'RejectAssignment')
  async rejectAssignment(
    data: RejectAssignmentRequest,
  ): Promise<AssignmentResponse> {
    const result = await this.dispatchService.rejectAssignment(data.id);
    return this.mapToAssignmentResponse(result);
  }

  @GrpcMethod('DispatchService', 'ListAssignments')
  async listAssignments(
    _data: ListAssignmentsRequest,
  ): Promise<ListAssignmentsResponse> {
    const items = await this.dispatchService.getAllAssignments();
    return {
      items: items.map((item: any) => this.mapToAssignmentResponse(item)),
      total: items.length,
    };
  }

  private mapToAssignmentResponse(data: any): AssignmentResponse {
    return {
      id: data.id?.toString() || '',
      orderId: data.orderId?.toString() || '',
      orderNo: data.orderNo || '',
      courierId: data.courierId || '',
      taskId: data.taskId || '',
      status: data.status || '',
      acceptedAt: data.acceptedAt?.toISOString?.() || undefined,
      arrivedAt: data.arrivedAt?.toISOString?.() || undefined,
      finishedAt: data.finishedAt?.toISOString?.() || undefined,
      createdAt:
        data.assignedAt?.toISOString?.() ||
        data.createdAt?.toISOString?.() ||
        '',
    };
  }
}

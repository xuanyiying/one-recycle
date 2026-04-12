import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { OrderService } from './services/order.service';
import {
  GetOrderRequest,
  CreateOrderRequest,
  UpdateOrderRequest,
  CancelOrderRequest,
  GetOrderResponse,
  ListOrdersRequest,
  ListOrdersResponse,
} from '@/proto/order.pb';
import { generateSecureorderNo } from '@/common';

@Controller()
export class OrderGrpcController {
  constructor(private readonly orderService: OrderService) {}

  @GrpcMethod('OrderService', 'GetOrder')
  async getOrder(data: GetOrderRequest): Promise<GetOrderResponse> {
    try {
      const order = await this.orderService.findOne(parseInt(data.orderId));
      return { order: this.mapToOrder(order) };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('OrderService', 'CreateOrder')
  async createOrder(data: CreateOrderRequest): Promise<GetOrderResponse> {
    try {
      const orderNo = generateSecureorderNo();
      const order = await this.orderService.createRecycleOrder({
        orderNo,
        userId: data.userId,
        addressId: data.addressId,
        // orderType is handled by createRecycleOrder internally
        channel: 'GRPC',
        items: [], // gRPC createOrder might need to handle items properly
        estimatedAmount: 0, // 临时值，实际应该根据items计算
        expectPickupTime: data.items.length > 0 ? new Date().toISOString() : '',
        source: 'grpc',
        remark: data.remark,
      });
      return { order: this.mapToOrder(order) };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('OrderService', 'UpdateOrder')
  async updateOrder(data: UpdateOrderRequest): Promise<GetOrderResponse> {
    try {
      const order = await this.orderService.update(parseInt(data.orderId), {
        status: data.status as any,
        remark: data.remark,
      });
      return { order: this.mapToOrder(order) };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('OrderService', 'CancelOrder')
  async cancelOrder(data: CancelOrderRequest): Promise<GetOrderResponse> {
    try {
      const order = await this.orderService.cancel(parseInt(data.orderId));
      return { order: this.mapToOrder(order) };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('OrderService', 'ListOrders')
  async listOrders(data: ListOrdersRequest): Promise<ListOrdersResponse> {
    try {
      const result = await this.orderService.findAll(
        { userId: data.userId },
        data.page,
        data.limit,
      );

      return {
        orders: result.orders.map((order) => this.mapToOrder(order)),
        total: result.total,
        page: data.page,
        limit: data.limit,
      };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  private mapToOrder(order: any) {
    return {
      id: order.id.toString(),
      orderNo: order.orderNo,
      userId: order.userId.toString(),
      addressId: order.addressId.toString(),
      status: order.status,
      orderType: order.orderType,
      priority: order.priority,
      expectPickupTime: order.expectPickupTime?.toISOString() || '',
      actualPickupTime: order.actualPickupTime?.toISOString() || '',
      expectDeliveryTime: order.expectDeliveryTime?.toISOString() || '',
      actualDeliveryTime: order.actualDeliveryTime?.toISOString() || '',
      estimatedAmount: order.estimatedAmount.toString(),
      settlementAmount: order.settlementAmount.toString(),
      payAmount: order.payAmount.toString(),
      channel: order.channel,
      remark: order.remark || '',
      source: order.source || '',
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items:
        order.items?.map((item: any) => ({
          id: item.id.toString(),
          orderId: item.orderId.toString(),
          categoryId: item.categoryId.toString(),
          estimatedWeight: item.estimatedWeight,
          actualWeight: item.actualWeight || 0,
          unitPrice: item.unitPrice,
          amount: item.amount,
          createdAt: item.createdAt.toISOString(),
        })) || [],
      assignments:
        order.assignments?.map((assignment: any) => ({
          id: assignment.id.toString(),
          orderId: assignment.orderId.toString(),
          courierId: assignment.courierId.toString(),
          status: assignment.status,
          acceptedAt: assignment.acceptedAt?.toISOString() || '',
          arrivedAt: assignment.arrivedAt?.toISOString() || '',
          finishedAt: assignment.finishedAt?.toISOString() || '',
          createdAt: assignment.createdAt.toISOString(),
        })) || [],
    };
  }

  private handleGrpcError(error: any): any {
    if (error.code === 'NOT_FOUND') {
      return { code: 5, message: error.message }; // NOT_FOUND
    }
    if (error.code === 'ALREADY_EXISTS') {
      return { code: 6, message: error.message }; // ALREADY_EXISTS
    }
    if (error.code === 'FAILED_PRECONDITION') {
      return { code: 9, message: error.message }; // FAILED_PRECONDITION
    }
    return { code: 13, message: 'Internal server error' }; // INTERNAL
  }
}

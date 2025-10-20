import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { OrderService } from './services/order.service';
import { generateSecureOrderNumber } from '@one-recycle/shared';
import {
  GetOrderRequest,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  CancelOrderRequest,
  OrderResponse,
  GetUserStatisticsRequest,
  UserStatisticsResponse
} from '../../proto/order.pb';

@Controller()
export class OrderGrpcController {
  constructor(private readonly orderService: OrderService) { }

  @GrpcMethod('OrderService', 'GetOrder')
  async getOrder(data: GetOrderRequest): Promise<OrderResponse> {
    try {
      const order = await this.orderService.findOne(parseInt(data.id.toString()));
      return this.mapToOrderResponse(order);
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('OrderService', 'CreateOrder')
  async createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
    try {
      const orderNo = generateSecureOrderNumber();
      const order = await this.orderService.createRecycleOrder({
        orderNo,
        userId: data.userId,
        addressId: data.addressId,
        orderType: 'RECYCLE' as any,
        estimatedAmount: 0, // 临时值，实际应该根据items计算
        expectPickupTime: new Date(data.expectPickupTime),
        source: 'grpc',
        remark: data.remark
      });
      return this.mapToOrderResponse(order);
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('OrderService', 'UpdateOrderStatus')
  async updateOrderStatus(data: UpdateOrderStatusRequest): Promise<OrderResponse> {
    try {
      const order = await this.orderService.update(parseInt(data.id.toString()), { status: data.status as any });
      return this.mapToOrderResponse(order);
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('OrderService', 'CancelOrder')
  async cancelOrder(data: CancelOrderRequest): Promise<OrderResponse> {
    try {
      const order = await this.orderService.cancel(parseInt(data.id.toString()));
      return this.mapToOrderResponse(order);
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('OrderService', 'GetUserStatistics')
  async getUserStatistics(data: GetUserStatisticsRequest): Promise<UserStatisticsResponse> {
    try {
      const userId = parseInt(data.userId.toString());
      const stats = await this.orderService.getOrderStats(userId);
      
      // 获取用户的详细统计数据
      const userStats = await this.orderService.getUserDetailedStats(userId);
      
      return {
        totalOrders: stats.total || 0,
        totalAmount: userStats.totalAmount || 0,
        savedCarbon: userStats.savedCarbon || 0
      };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  private mapToOrderResponse(order: any): OrderResponse {
    return {
      id: Number(order.id),
      orderNo: order.orderNo,
      userId: Number(order.userId),
      addressId: Number(order.addressId),
      status: order.status,
      expectPickupTime: order.expectPickupTime.toISOString(),
      actualPickupTime: order.actualPickupTime?.toISOString() || '',
      estimatedAmount: order.estimatedAmount?.toString() || '0',
      settlementAmount: order.settlementAmount?.toString() || '0',
      payAmount: order.payAmount?.toString() || '0',
      channel: order.channel,
      remark: order.remark || '',
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items?.map((item: any) => ({
        id: Number(item.id),
        categoryId: Number(item.categoryId),
        estimatedWeight: item.estimatedWeight?.toString() || '0',
        actualWeight: item.actualWeight?.toString() || '0',
        unitPrice: item.unitPrice?.toString() || '0',
        amount: item.amount?.toString() || '0'
      })) || [],
      assignments: order.assignments?.map((assignment: any) => ({
        id: Number(assignment.id),
        courierId: Number(assignment.courierId),
        status: assignment.status,
        acceptedAt: assignment.acceptedAt?.toISOString() || '',
        arrivedAt: assignment.arrivedAt?.toISOString() || '',
        finishedAt: assignment.finishedAt?.toISOString() || '',
        createdAt: assignment.createdAt.toISOString()
      })) || []
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
// @ts-nocheck
/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

export const protobufPackage = 'order';

export interface CreateOrderRequest {
  userId: string;
  addressId: string;
  items: OrderItem[];
  remark: string;
}

export interface OrderItem {
  categoryId: string;
  estimatedWeight: number;
  unitPrice: number;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  message: string;
}

export interface GetOrderRequest {
  orderId: string;
}

export interface GetOrderResponse {
  order: Order | undefined;
}

export interface Order {
  id: string;
  orderNo: string;
  userId: string;
  status: string;
  items: OrderItem[];
  estimatedAmount: number;
  settlementAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrderRequest {
  orderId: string;
  status: string;
  remark: string;
}

export interface UpdateOrderResponse {
  success: boolean;
  order: Order | undefined;
}

export interface ListOrdersRequest {
  userId: string;
  page: number;
  limit: number;
}

export interface ListOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface CancelOrderRequest {
  orderId: string;
}

export interface CancelOrderResponse {
  success: boolean;
  message: string;
}

export const ORDER_PACKAGE_NAME = 'order';

export interface OrderServiceClient {
  createOrder(request: CreateOrderRequest): Observable<CreateOrderResponse>;

  getOrder(request: GetOrderRequest): Observable<GetOrderResponse>;

  updateOrder(request: UpdateOrderRequest): Observable<UpdateOrderResponse>;

  listOrders(request: ListOrdersRequest): Observable<ListOrdersResponse>;

  cancelOrder(request: CancelOrderRequest): Observable<CancelOrderResponse>;
}

export interface OrderServiceController {
  createOrder(
    request: CreateOrderRequest,
  ):
    | Promise<CreateOrderResponse>
    | Observable<CreateOrderResponse>
    | CreateOrderResponse;

  getOrder(
    request: GetOrderRequest,
  ):
    | Promise<GetOrderResponse>
    | Observable<GetOrderResponse>
    | GetOrderResponse;

  updateOrder(
    request: UpdateOrderRequest,
  ):
    | Promise<UpdateOrderResponse>
    | Observable<UpdateOrderResponse>
    | UpdateOrderResponse;

  listOrders(
    request: ListOrdersRequest,
  ):
    | Promise<ListOrdersResponse>
    | Observable<ListOrdersResponse>
    | ListOrdersResponse;

  cancelOrder(
    request: CancelOrderRequest,
  ):
    | Promise<CancelOrderResponse>
    | Observable<CancelOrderResponse>
    | CancelOrderResponse;
}

export function OrderServiceControllerMethods() {
  return function (constructor: Function) {
    const methodNames = [
      'createOrder',
      'getOrder',
      'updateOrder',
      'listOrders',
      'cancelOrder',
    ];
    methodNames.forEach((methodName) => {
      const descriptor: any = Object.getOwnPropertyDescriptor(
        constructor.prototype,
        methodName,
      );
      GrpcMethod('OrderService', methodName)(
        constructor.prototype[methodName],
        methodName,
        descriptor,
      );
    });
    const grpcStreamMethods = [];
    grpcStreamMethods.forEach((methodName) => {
      const descriptor: any = Object.getOwnPropertyDescriptor(
        constructor.prototype,
        methodName,
      );
      GrpcStreamMethod('OrderService', methodName)(
        constructor.prototype[methodName],
        methodName,
        descriptor,
      );
    });
  };
}

export const ORDER_SERVICE_NAME = 'OrderService';

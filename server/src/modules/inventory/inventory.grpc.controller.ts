import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { InventoryService } from './services/inventory.service';
import {
  GetInventoryItemRequest,
  ListInventoryItemsRequest,
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  DeleteInventoryItemRequest,
  CreateReservationRequest,
  ConfirmReservationRequest,
  CancelReservationRequest,
  InventoryItemResponse,
  ListInventoryItemsResponse,
  ReservationResponse,
  InventoryStatsResponse,
  CheckAvailabilityRequest,
  CheckAvailabilityResponse,
  Empty,
} from '@/proto/inventory.pb';
import { InventoryStatus, ItemType, ItemCondition, ProcessingStatus } from './entities/inventory.entity';

@Controller()
export class InventoryGrpcController {
  constructor(private readonly inventoryService: InventoryService) {}

  @GrpcMethod('InventoryService', 'GetInventoryItem')
  async getInventoryItem(data: GetInventoryItemRequest): Promise<InventoryItemResponse> {
    const item = await this.inventoryService.getInventoryItemById(BigInt(data.id));
    if (!item) throw new Error('Inventory item not found');
    return this.mapToInventoryItemResponse(item);
  }

  @GrpcMethod('InventoryService', 'ListInventoryItems')
  async listInventoryItems(data: ListInventoryItemsRequest): Promise<ListInventoryItemsResponse> {
    const filters: any = {};
    if (data.status) filters.status = data.status as InventoryStatus;
    if (data.itemType) filters.itemType = data.itemType as ItemType;
    if (data.categoryId) filters.categoryId = BigInt(data.categoryId);
    if (data.warehouseId) filters.warehouseId = BigInt(data.warehouseId);

    const result = await this.inventoryService.getInventoryItems(
      filters,
      undefined,
      { page: data.page || 1, pageSize: data.limit || 20 },
    );
    return {
      items: (result.items || []).map((item: any) => this.mapToInventoryItemResponse(item)),
      total: result.total,
      page: result.page,
      limit: result.pageSize,
      totalPages: result.totalPages,
    };
  }

  @GrpcMethod('InventoryService', 'CreateInventoryItem')
  async createInventoryItem(data: CreateInventoryItemRequest): Promise<InventoryItemResponse> {
    const item = await this.inventoryService.createInventoryItem({
      warehouseId: BigInt(data.warehouseId),
      categoryId: BigInt(data.categoryId),
      name: data.name,
      description: data.description,
      unit: data.unit,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      location: data.location,
      itemType: data.itemType as ItemType,
      condition: data.condition as ItemCondition,
      sourceOrderId: data.sourceOrderId,
      processingStatus: data.processingStatus as ProcessingStatus,
    });
    return this.mapToInventoryItemResponse(item);
  }

  @GrpcMethod('InventoryService', 'UpdateInventoryItem')
  async updateInventoryItem(data: UpdateInventoryItemRequest): Promise<InventoryItemResponse> {
    const item = await this.inventoryService.updateInventoryItem(BigInt(data.id), {
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      location: data.location,
      condition: data.condition as ItemCondition,
      processingStatus: data.processingStatus as ProcessingStatus,
    });
    return this.mapToInventoryItemResponse(item);
  }

  @GrpcMethod('InventoryService', 'DeleteInventoryItem')
  async deleteInventoryItem(data: DeleteInventoryItemRequest): Promise<Empty> {
    await this.inventoryService.deleteInventoryItem(BigInt(data.id));
    return {};
  }

  @GrpcMethod('InventoryService', 'CreateReservation')
  async createReservation(data: CreateReservationRequest): Promise<ReservationResponse> {
    const reservation = await this.inventoryService.createReservation({
      itemId: BigInt(data.itemId),
      quantity: data.quantity,
      orderId: data.orderId,
      expiresAt: new Date(data.expiresAt),
      notes: data.notes,
    });
    return this.mapToReservationResponse(reservation);
  }

  @GrpcMethod('InventoryService', 'ConfirmReservation')
  async confirmReservation(data: ConfirmReservationRequest): Promise<ReservationResponse> {
    const reservation = await this.inventoryService.confirmReservation(BigInt(data.reservationId));
    return this.mapToReservationResponse(reservation);
  }

  @GrpcMethod('InventoryService', 'CancelReservation')
  async cancelReservation(data: CancelReservationRequest): Promise<ReservationResponse> {
    const reservation = await this.inventoryService.cancelReservation(BigInt(data.reservationId));
    return this.mapToReservationResponse(reservation);
  }

  @GrpcMethod('InventoryService', 'GetInventoryStats')
  async getInventoryStats(_data: Empty): Promise<InventoryStatsResponse> {
    const stats = await this.inventoryService.getInventoryStats();
    return stats;
  }

  @GrpcMethod('InventoryService', 'CheckAvailability')
  async checkAvailability(data: CheckAvailabilityRequest): Promise<CheckAvailabilityResponse> {
    const results: CheckAvailabilityResponse['items'] = [];
    let allAvailable = true;

    for (const item of data.items || []) {
      const inventoryItems = await this.inventoryService.getInventoryItems(
        { categoryId: BigInt(item.categoryId) },
        undefined,
        { page: 1, pageSize: 1 },
      );
      const available = inventoryItems.total > 0;
      if (!available) allAvailable = false;
      results.push({
        categoryId: item.categoryId,
        available,
        availableQuantity: available ? 999 : 0,
        requestedQuantity: item.quantity,
      });
    }

    return { available: allAvailable, items: results };
  }

  private mapToInventoryItemResponse(item: any): InventoryItemResponse {
    return {
      id: item.id?.toString() || '',
      warehouseId: item.warehouseId?.toString() || '',
      categoryId: item.categoryId?.toString() || '',
      name: item.name || '',
      description: item.description || undefined,
      unit: item.unit || 'kg',
      quantity: Number(item.quantity) || 0,
      reservedQty: Number(item.reservedQty) || 0,
      availableQty: Number(item.availableQty) || 0,
      unitPrice: Number(item.unitPrice) || 0,
      totalPrice: Number(item.totalPrice) || 0,
      location: item.location || undefined,
      status: item.status || '',
      itemType: item.itemType || '',
      condition: item.condition || '',
      sourceOrderId: item.sourceOrderId?.toString() || undefined,
      processingStatus: item.processingStatus || '',
      expiryDate: item.expiryDate?.toISOString?.() || undefined,
      createdAt: item.createdAt?.toISOString?.() || '',
      updatedAt: item.updatedAt?.toISOString?.() || '',
    };
  }

  private mapToReservationResponse(reservation: any): ReservationResponse {
    return {
      id: reservation.id?.toString() || '',
      itemId: reservation.itemId?.toString() || '',
      orderId: reservation.orderId?.toString() || '',
      quantity: Number(reservation.quantity) || 0,
      status: reservation.status || '',
      expiresAt: reservation.expiresAt?.toISOString?.() || '',
      confirmedAt: reservation.confirmedAt?.toISOString?.() || undefined,
      cancelledAt: reservation.cancelledAt?.toISOString?.() || undefined,
      createdAt: reservation.createdAt?.toISOString?.() || reservation.reservedAt?.toISOString?.() || '',
    };
  }
}

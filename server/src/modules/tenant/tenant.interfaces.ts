import { Tenant, TenantAddress } from '@prisma/client';

export interface CreateTenantDto {
  name: string;
  code: string;
  contactName: string;
  contactPhone: string;
  settlementCycle?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

export interface CreateTenantAddressDto {
  tenantId: number; // BigInt in Prisma, simplified here
  type: 'BUSINESS' | 'RETURN' | 'INVOICE' | 'RECEIPT';
  province: string;
  city: string;
  district: string;
  street?: string;
  detail: string;
  contactName: string;
  contactPhone: string;
  isDefault?: boolean;
}

export interface ITenantService {
  /**
   * Find a suitable tenant for the order (e.g. based on location or category)
   */
  assignTenant(orderId: number): Promise<Tenant>;

  /**
   * Get the receipt address for a tenant to generate logistics order
   */
  getReceiptAddress(tenantId: number): Promise<TenantAddress>;

  /**
   * Check if tenant has sufficient balance (if pre-payment required)
   */
  checkBalance(tenantId: number, estimatedAmount: number): Promise<boolean>;
}

export interface ISettlementService {
  /**
   * Initialize a settlement record when order is dispatched
   */
  initSettlement(
    orderId: number,
    tenantId: number,
    estimatedExpressFee: number,
  ): Promise<void>;

  /**
   * Calculate final settlement amount based on actual weight and pricing rules
   */
  calculateSettlement(orderId: number): Promise<number>;

  /**
   * Execute settlement: Transfer funds, update balance, record transaction
   */
  executeSettlement(orderId: number): Promise<void>;
}

export class CreateTransactionDto {
  itemId: string;
  type: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT';
  quantity: number;
  unitPrice: number;
  referenceId?: string;
  notes?: string;
}
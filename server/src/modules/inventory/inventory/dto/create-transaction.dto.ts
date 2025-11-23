import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { TransactionType } from '../entities/inventory.entity';

export class CreateTransactionDto {
    @IsNotEmpty()
    itemId: bigint;

    @IsNotEmpty()
    @IsEnum(TransactionType)
    type: TransactionType;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @IsNotEmpty()
    @IsNumber()
    unitPrice: number;

    @IsOptional()
    @IsString()
    referenceId?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
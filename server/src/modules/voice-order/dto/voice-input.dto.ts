import { IsString, IsOptional, IsEnum, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum DialogStep {
  GREETING = 'GREETING',
  ITEM_TYPE = 'ITEM_TYPE',
  QUANTITY = 'QUANTITY',
  ADDRESS = 'ADDRESS',
  CONTACT = 'CONTACT',
  PICKUP_TIME = 'PICKUP_TIME',
  CONFIRMATION = 'CONFIRMATION',
  COMPLETED = 'COMPLETED',
}

export class AddressData {
  @IsString()
  province?: string;

  @IsString()
  city?: string;

  @IsString()
  district?: string;

  @IsString()
  detail?: string;
}

export class CollectedDataDto {
  @IsString()
  @IsOptional()
  itemType?: string;

  @IsNumber()
  @IsOptional()
  itemCategoryId?: number;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => AddressData)
  @IsOptional()
  address?: AddressData;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  pickupTime?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateVoiceOrderSessionDto {
  @IsString()
  @IsOptional()
  userId?: string;
}

export class VoiceInputDto {
  @IsString()
  sessionId: string;

  @IsString()
  @IsOptional()
  audioData?: string; // Base64 encoded audio

  @IsString()
  @IsOptional()
  audioFormat?: string; // 'mp3', 'amr', 'wav'

  @IsNumber()
  @IsOptional()
  duration?: number; // Duration in seconds

  @IsString()
  @IsOptional()
  recognizedText?: string; // Pre-recognized text (optional)
}

export class UpdateDialogStateDto {
  @IsEnum(DialogStep)
  nextStep: DialogStep;

  @IsObject()
  @ValidateNested()
  @Type(() => CollectedDataDto)
  @IsOptional()
  collectedData?: CollectedDataDto;
}

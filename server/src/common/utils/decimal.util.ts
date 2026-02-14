import { Prisma } from '@prisma/client';

export type DecimalLike = Prisma.Decimal | number | string | null | undefined;

export function toDecimal(value: DecimalLike): Prisma.Decimal {
  if (value === null || value === undefined) return new Prisma.Decimal(0);
  if (value instanceof Prisma.Decimal) return value;
  return new Prisma.Decimal(value);
}

export function toNumber(value: DecimalLike): number {
  if (value === null || value === undefined) return 0;
  if (value instanceof Prisma.Decimal) return value.toNumber();
  return Number(value);
}

import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

export class AccountNotFoundException extends NotFoundException {
  constructor(userId: number) {
    super(`Account not found for user ${userId}`);
  }
}

export class InsufficientBalanceException extends BadRequestException {
  constructor(available: number, required: number) {
    super(
      `Insufficient balance: available ${available}, required ${required}`,
    );
  }
}

export class InsufficientFrozenBalanceException extends BadRequestException {
  constructor(frozen: number, required: number) {
    super(
      `Insufficient frozen balance: frozen ${frozen}, required ${required}`,
    );
  }
}

export class OptimisticLockException extends ConflictException {
  constructor(userId: number) {
    super(
      `Concurrent update detected for account of user ${userId}. Please retry.`,
    );
  }
}

export class DuplicateOrderIncomeException extends ConflictException {
  constructor(orderId: string) {
    super(`Order ${orderId} has already been credited to account`);
  }
}

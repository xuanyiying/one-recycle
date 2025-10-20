export class Account {
  id!: bigint;
  userId!: bigint;
  availableBalance!: number;
  frozenBalance!: number;
  totalIncome!: number;
  totalWithdrawal!: number;
  version!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

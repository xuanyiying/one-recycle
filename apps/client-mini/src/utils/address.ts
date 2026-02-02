import { Address, OrderAddress } from '@/types';
/**
 * Type guard to check if an object is a full Address
 */
export const isFullAddress = (address: OrderAddress | Address): address is Address => {
  return 'mobile' in address && 'province' in address;
};

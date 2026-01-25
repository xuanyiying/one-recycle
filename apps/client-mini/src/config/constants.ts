/**
 * Application Constants
 */

import { AddressLabel } from '../types/order';

// Address Labels
export const ADDRESS_LABEL_OPTIONS = [
  { value: AddressLabel.HOME, label: '家' },
  { value: AddressLabel.WORK, label: '工作' },
  { value: AddressLabel.SCHOOL, label: '学校' },
  { value: AddressLabel.OTHER, label: '其他' },
];

// Validation Patterns
export const REGEX = {
  PHONE_CN: /^1[3-9]\d{9}$/,
  SMS_CODE: /^\d{6}$/,
  NICKNAME_INVALID_CHARS: /[<>'"&]/,
  NUMERIC_ONLY: /\D/g,
};

// Validation Limits
export const LIMITS = {
  NICKNAME_MIN: 2,
  NICKNAME_MAX: 20,
  PHONE_LENGTH: 11,
  SMS_CODE_LENGTH: 6,
  ADDRESS_DETAIL_MAX: 200,
  RECIPIENT_NAME_MAX: 50,
};

// UI Constants
export const UI = {
  TOAST_DURATION: 2000,
  ANIMATION_DELAY: 1500, // For mock delays
  RETRY_LIMIT: 3,
};

// Pricing / Weight Options (Moved from Pricing page)
export const WEIGHT_OPTIONS = {
  CLOTHING: [
    { label: '3~5kg', value: '3-5', price: '2.40-4.00' },
    { label: '5~10kg', value: '5-10', price: '4.74-7.90' },
    { label: '10~30kg', value: '10-30', price: '30-75' },
    { label: '30kg以上', value: '30+', price: '75+' }
  ],
  DIGITAL: [
    { label: '手机', value: 'phone', price: '50-500' },
    { label: '平板', value: 'tablet', price: '100-800' },
    { label: '笔记本', value: 'laptop', price: '200-2000' },
    { label: '其他数码', value: 'other', price: '20-300' }
  ],
  DEFAULT: [
    { label: '1kg以下', value: '0-1', price: '5-15' },
    { label: '1-5kg', value: '1-5', price: '15-50' },
    { label: '5-10kg', value: '5-10', price: '50-100' },
    { label: '10kg以上', value: '10+', price: '100+' }
  ]
};

export const PICKUP_TIME_OPTIONS = ['9-12点', '12-15点', '15-18点', '18-21点'];

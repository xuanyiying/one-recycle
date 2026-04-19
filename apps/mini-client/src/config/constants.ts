export const REGEX = {
  PHONE_CN: /^1[3-9]\d{9}$/,
  SMS_CODE: /^\d{6}$/,
  NICKNAME_INVALID_CHARS: /[<>'"&]/,
  NUMERIC_ONLY: /\D/g
}

export const LIMITS = {
  NICKNAME_MIN: 2,
  NICKNAME_MAX: 20,
  PHONE_LENGTH: 11,
  SMS_CODE_LENGTH: 6,
  ADDRESS_DETAIL_MAX: 200,
  RECIPIENT_NAME_MAX: 50
}

/**
 * 重量选项配置
 * 注意：价格数据已从后端API获取，此处仅保留重量范围配置
 * 价格计算请使用 services/pricing.ts 中的 estimateItemPrices 函数
 * 或从分类数据中的 priceInfo 和 pricingRule 字段获取
 */
export const WEIGHT_OPTIONS = {
  CLOTHING: [
    { label: '3~5kg', value: '3-5' },
    { label: '5~10kg', value: '5-10' },
    { label: '10~30kg', value: '10-30' },
    { label: '30kg以上', value: '30+' }
  ],
  DIGITAL: [
    { label: '手机', value: 'phone' },
    { label: '平板', value: 'tablet' },
    { label: '笔记本', value: 'laptop' },
    { label: '其他数码', value: 'other' }
  ],
  DEFAULT: [
    { label: '1kg以下', value: '0-1' },
    { label: '1-5kg', value: '1-5' },
    { label: '5-10kg', value: '5-10' },
    { label: '10kg以上', value: '10+' }
  ]
}

export const PICKUP_TIME_OPTIONS = ['9-12点', '12-15点', '15-18点', '18-21点']

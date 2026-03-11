export interface DialogFlowConfig {
  steps: DialogStepConfig[];
  maxRetries: number;
  enableSmartSkip: boolean;
  enableContextAwareness: boolean;
}

export interface DialogStepConfig {
  step: string;
  prompts: string[];
  requiredFields: string[];
  optionalFields?: string[];
  validationRules?: ValidationRule[];
  nextStep?: string;
  fallbackStep?: string;
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'pattern' | 'range' | 'custom';
  pattern?: string;
  min?: number;
  max?: number;
  validator?: string;
  errorMessage: string;
}

export const DEFAULT_DIALOG_FLOW_CONFIG: DialogFlowConfig = {
  steps: [
    {
      step: 'GREETING',
      prompts: [
        '您好！我是您的回收AI助手，请问您今天想回收什么物品呢？',
        '欢迎使用语音下单！告诉我您要回收什么吧~',
      ],
      requiredFields: [],
      nextStep: 'ITEM_TYPE',
    },
    {
      step: 'ITEM_TYPE',
      prompts: [
        '好的，请问您要回收什么物品呢？我们有旧衣服、旧书籍等。',
        '请告诉我物品类型，比如旧衣服、书籍等。',
      ],
      requiredFields: ['itemType'],
      nextStep: 'QUANTITY',
    },
    {
      step: 'QUANTITY',
      prompts: [
        '明白了，请问大概有多少呢？可以说"5 公斤"、"10 件"等。',
        '请告诉我数量，比如多少公斤或多少件。',
      ],
      requiredFields: ['quantity', 'unit'],
      nextStep: 'ADDRESS',
    },
    {
      step: 'ADDRESS',
      prompts: [
        '好的，请问您的取件地址是？请详细到门牌号哦。',
        '请告诉我完整的取件地址，包括省市区和详细地址。',
      ],
      requiredFields: ['province', 'city', 'district', 'detail'],
      nextStep: 'CONTACT',
    },
    {
      step: 'CONTACT',
      prompts: [
        '请问您的联系电话是？说"使用默认"可以用当前账号的手机号。',
        '请提供联系电话，或者说"使用默认"。',
      ],
      requiredFields: ['contactPhone'],
      nextStep: 'PICKUP_TIME',
    },
    {
      step: 'PICKUP_TIME',
      prompts: [
        '请问您希望什么时候上门取件？比如"明天上午"、"后天下午"等。',
        '请告诉我方便的取件时间。',
      ],
      requiredFields: ['pickupTime'],
      nextStep: 'CONFIRMATION',
    },
    {
      step: 'CONFIRMATION',
      prompts: [
        '让我跟您确认一下订单信息，确认无误后我将为您创建订单。',
      ],
      requiredFields: [],
      nextStep: 'COMPLETED',
    },
  ],
  maxRetries: 3,
  enableSmartSkip: true,
  enableContextAwareness: true,
};

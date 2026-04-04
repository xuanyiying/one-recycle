import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

/**
 * Base Response for Deppon APIs
 */
export class DepponResponse<T = any> {
  @IsString()
  resultCode: string;

  @IsString()
  resultMsg: string;

  @IsOptional()
  data?: T;

  @IsOptional()
  @IsString()
  traceId?: string;
}

/**
 * 1. Pre-check API - 预检查/运力查询
 */
export class DepponPrecheckDto {
  @IsNotEmpty()
  @IsString()
  customerCode: string; // 客户编码

  @IsNotEmpty()
  @IsString()
  pickupAddress: string; // 取件地址

  @IsOptional()
  @IsString()
  pickupProvince?: string; // 取件省份

  @IsOptional()
  @IsString()
  pickupCity?: string; // 取件城市

  @IsOptional()
  @IsString()
  pickupCounty?: string; // 取件区县

  @IsNotEmpty()
  @IsString()
  deliveryAddress: string; // 收件地址

  @IsOptional()
  @IsNumber()
  weight?: number; // 预估重量(kg)

  @IsOptional()
  @IsNumber()
  volume?: number; // 预估体积(m³)
}

export class DepponPrecheckResult {
  @IsString()
  pickupStartTime: string; // 最早取件时间

  @IsString()
  pickupEndTime: string; // 最晚取件时间

  @IsNumber()
  estimatedFreight: number; // 预估运费

  @IsString()
  promiseTime: string; // 承诺时效

  @IsOptional()
  @IsString()
  remark?: string; // 备注
}

/**
 * 2. Create Order API - 创建订单
 */
export class DepponCreateOrderDto {
  @IsNotEmpty()
  @IsString()
  customerCode: string; // 客户编码

  @IsNotEmpty()
  @IsString()
  orderId: string; // 业务订单号(唯一)

  @IsNotEmpty()
  @IsString()
  senderName: string; // 寄件人姓名

  @IsNotEmpty()
  @IsString()
  senderMobile: string; // 寄件人电话

  @IsNotEmpty()
  @IsString()
  senderAddress: string; // 寄件人详细地址

  @IsOptional()
  @IsString()
  senderProvince?: string; // 寄件省份

  @IsOptional()
  @IsString()
  senderCity?: string; // 寄件城市

  @IsOptional()
  @IsString()
  senderCounty?: string; // 寄件区县

  @IsNotEmpty()
  @IsString()
  receiverName: string; // 收件人姓名

  @IsNotEmpty()
  @IsString()
  receiverMobile: string; // 收件人电话

  @IsNotEmpty()
  @IsString()
  receiverAddress: string; // 收件人详细地址

  @IsOptional()
  @IsString()
  receiverProvince?: string; // 收件省份

  @IsOptional()
  @IsString()
  receiverCity?: string; // 收件城市

  @IsOptional()
  @IsString()
  receiverCounty?: string; // 收件区县

  @IsNotEmpty()
  @IsNumber()
  packageCount: number; // 包裹数量

  @IsNotEmpty()
  @IsNumber()
  weight: number; // 重量(kg)

  @IsOptional()
  @IsNumber()
  volume?: number; // 体积(m³)

  @IsOptional()
  @IsString()
  goodsName?: string; // 物品名称

  @IsOptional()
  @IsString()
  goodsType?: string; // 物品类型

  @IsOptional()
  @IsString()
  pickupTime?: string; // 预约取件时间

  @IsOptional()
  @IsString()
  remark?: string; // 备注

  @IsOptional()
  @IsString()
  serviceType?: string; // 服务类型

  @IsOptional()
  @IsNumber()
  declaredValue?: number; // 声明价值
}

export class DepponCreateOrderResult {
  @IsString()
  waybillCode: string; // 德邦运单号

  @IsString()
  orderId: string; // 业务订单号

  @IsOptional()
  @IsString()
  estimatedPickupTime?: string; // 预计取件时间

  @IsOptional()
  @IsString()
  estimatedDeliveryTime?: string; // 预计送达时间

  @IsOptional()
  @IsNumber()
  freight?: number; // 运费
}

/**
 * 3. Subscribe Trace API - 订阅物流轨迹
 */
export class DepponSubscribeTraceDto {
  @IsNotEmpty()
  @IsString()
  customerCode: string; // 客户编码

  @IsNotEmpty()
  @IsString()
  waybillCode: string; // 运单号

  @IsOptional()
  @IsString()
  callbackUrl?: string; // 回调地址
}

/**
 * 4. Query Trace API - 查询物流轨迹
 */
export class DepponQueryTraceDto {
  @IsNotEmpty()
  @IsString()
  customerCode: string; // 客户编码

  @IsNotEmpty()
  @IsString()
  waybillCode: string; // 运单号
}

export class DepponTraceItem {
  @IsString()
  time: string; // 时间

  @IsString()
  context: string; // 轨迹内容

  @IsOptional()
  @IsString()
  operator?: string; // 操作人

  @IsOptional()
  @IsString()
  location?: string; // 地点
}

export class DepponQueryTraceResult {
  @IsString()
  waybillCode: string; // 运单号

  @IsString()
  status: string; // 运单状态

  traces: DepponTraceItem[]; // 轨迹列表
}

/**
 * 5. Modify Order API - 修改订单
 */
export class DepponModifyOrderDto {
  @IsNotEmpty()
  @IsString()
  customerCode: string; // 客户编码

  @IsNotEmpty()
  @IsString()
  waybillCode: string; // 运单号

  @IsOptional()
  @IsString()
  receiverName?: string; // 收件人姓名

  @IsOptional()
  @IsString()
  receiverMobile?: string; // 收件人电话

  @IsOptional()
  @IsString()
  receiverAddress?: string; // 收件人地址

  @IsOptional()
  @IsString()
  pickupTime?: string; // 预约取件时间

  @IsOptional()
  @IsString()
  remark?: string; // 备注
}

/**
 * 6. Cancel Order API - 取消订单
 */
export class DepponCancelOrderDto {
  @IsNotEmpty()
  @IsString()
  customerCode: string; // 客户编码

  @IsNotEmpty()
  @IsString()
  waybillCode: string; // 运单号

  @IsNotEmpty()
  @IsString()
  cancelReason: string; // 取消原因

  @IsOptional()
  @IsString()
  operator?: string; // 操作人
}

/**
 * 7. Query Status API - 查询运单状态
 */
export class DepponQueryStatusDto {
  @IsNotEmpty()
  @IsString()
  customerCode: string; // 客户编码

  @IsNotEmpty()
  @IsString()
  waybillCode: string; // 运单号
}

export class DepponQueryStatusResult {
  @IsString()
  waybillCode: string; // 运单号

  @IsString()
  status: string; // 运单状态

  @IsOptional()
  @IsString()
  statusDesc?: string; // 状态描述

  @IsOptional()
  @IsString()
  pickupTime?: string; // 实际取件时间

  @IsOptional()
  @IsString()
  deliveryTime?: string; // 实际送达时间
}

/**
 * 8. Query Fee API - 查询运费
 */
export class DepponQueryFeeDto {
  @IsNotEmpty()
  @IsString()
  customerCode: string; // 客户编码

  @IsNotEmpty()
  @IsString()
  waybillCode: string; // 运单号
}

export class DepponQueryFeeResult {
  @IsString()
  waybillCode: string; // 运单号

  @IsNumber()
  totalFee: number; // 总费用

  @IsOptional()
  @IsNumber()
  freight?: number; // 运费

  @IsOptional()
  @IsNumber()
  insuranceFee?: number; // 保价费

  @IsOptional()
  @IsNumber()
  pickupFee?: number; // 取件费

  @IsOptional()
  @IsNumber()
  deliveryFee?: number; // 派送费

  @IsOptional()
  @IsNumber()
  otherFee?: number; // 其他费用
}

/**
 * 京东快递API接口定义
 * 基于京东物流开放平台API规范
 */

// 基础响应接口
export interface JdApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
  timestamp: number;
}

// 地址信息接口
export interface AddressInfo {
  name: string;           // 姓名
  phone: string;          // 电话
  province: string;       // 省份
  city: string;           // 城市
  district: string;       // 区县
  address: string;        // 详细地址
  postcode?: string;      // 邮编
}

// 商品信息接口
export interface GoodsInfo {
  name: string;           // 商品名称
  category: string;       // 商品类别
  weight: number;         // 重量(kg)
  volume?: number;        // 体积(cm³)
  quantity: number;       // 数量
  value?: number;         // 价值(元)
  description?: string;   // 描述
}

// 取件请求接口
export interface PickupRequest {
  orderNo: string;                    // 订单号
  customerCode: string;               // 客户编码
  sender: AddressInfo;                // 寄件人信息
  receiver: AddressInfo;              // 收件人信息
  goods: GoodsInfo[];                 // 商品信息
  serviceType: string;                // 服务类型
  payType: number;                    // 付费方式 1:寄付 2:到付
  expectPickupTime?: string;          // 期望取件时间
  remark?: string;                    // 备注
  insured?: boolean;                  // 是否保价
  insuredValue?: number;              // 保价金额
}

// 取件响应接口
export interface PickupResponse {
  waybillNo: string;                  // 运单号
  orderNo: string;                    // 订单号
  pickupCode: string;                 // 取件码
  estimatedPickupTime: string;        // 预计取件时间
  courierInfo?: {
    name: string;                     // 快递员姓名
    phone: string;                    // 快递员电话
  };
}

// 运单状态查询响应
export interface WaybillStatusResponse {
  waybillNo: string;                  // 运单号
  status: string;                     // 状态码
  statusDesc: string;                 // 状态描述
  updateTime: string;                 // 更新时间
  traces: WaybillTrace[];             // 轨迹信息
}

// 运单轨迹信息
export interface WaybillTrace {
  time: string;                       // 时间
  status: string;                     // 状态
  description: string;                // 描述
  location?: string;                  // 位置
  operator?: string;                  // 操作员
}

// 取件状态枚举
export enum PickupStatus {
  PENDING = 'PENDING',                // 待取件
  ASSIGNED = 'ASSIGNED',              // 已分配
  PICKED_UP = 'PICKED_UP',            // 已取件
  IN_TRANSIT = 'IN_TRANSIT',          // 运输中
  DELIVERED = 'DELIVERED',            // 已送达
  CANCELLED = 'CANCELLED',            // 已取消
  FAILED = 'FAILED'                   // 失败
}

// 服务类型枚举
export enum ServiceType {
  STANDARD = 'STANDARD',              // 标准快递
  EXPRESS = 'EXPRESS',                // 特快专递
  ECONOMY = 'ECONOMY',                // 经济快递
  SAME_DAY = 'SAME_DAY',              // 当日达
  NEXT_DAY = 'NEXT_DAY'               // 次日达
}

// API认证配置
export interface JdApiConfig {
  appKey: string;                     // 应用Key
  appSecret: string;                  // 应用密钥
  customerCode: string;               // 客户编码
  baseUrl: string;                    // API基础URL
  timeout: number;                    // 超时时间
}

// 错误响应接口
export interface JdApiError {
  code: string;
  message: string;
  details?: any;
}
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as crypto from 'crypto';
import { 
  JdApiResponse, 
  PickupRequest, 
  PickupResponse, 
  WaybillStatusResponse, 
  JdApiConfig,
  JdApiError,
  ServiceType} from './interfaces/jd-express.interface';
import { CreatePickupDto, CancelPickupDto } from './dto/pickup.dto';
import {
    JdExpressException,
    JdExpressTimeoutException,
    JdExpressAuthException,
    JdExpressRateLimitException,
    JdExpressValidationException,
    JdExpressServiceUnavailableException
} from '../common/exceptions/jd-express.exception';

@Injectable()
export class JdExpressService {
    private readonly logger = new Logger(JdExpressService.name);
    private readonly httpClient: AxiosInstance;
    private readonly config: JdApiConfig;

    constructor() {
        // 从环境变量加载配置
        this.config = {
            appKey: process.env.JD_APP_KEY || '',
            appSecret: process.env.JD_APP_SECRET || '',
            customerCode: process.env.JD_CUSTOMER_CODE || '',
            baseUrl: process.env.JD_API_BASE_URL || 'https://api.jdl.com',
            timeout: parseInt(process.env.JD_API_TIMEOUT || '30000')
        };

        // 验证配置
        this.validateConfig();

        // 初始化HTTP客户端
        this.httpClient = axios.create({
            baseURL: this.config.baseUrl,
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'OneRecycle-JD-Client/1.0'
            }
        });

        // 请求拦截器 - 添加签名和认证
        this.httpClient.interceptors.request.use(
            (config) => {
                const timestamp = Date.now().toString();
                const nonce = this.generateNonce();
                const signature = this.generateSignature(config.data, timestamp, nonce);

                config.headers['X-JD-APP-KEY'] = this.config.appKey;
                config.headers['X-JD-TIMESTAMP'] = timestamp;
                config.headers['X-JD-NONCE'] = nonce;
                config.headers['X-JD-SIGNATURE'] = signature;
                config.headers['X-JD-CUSTOMER-CODE'] = this.config.customerCode;

                this.logger.log(`发送京东API请求: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                this.logger.error('请求拦截器错误:', error);
                return Promise.reject(error);
            }
        );

        // 响应拦截器 - 处理响应和错误
        this.httpClient.interceptors.response.use(
            (response: AxiosResponse<JdApiResponse>) => {
                this.logger.log(`收到京东API响应: ${response.status} ${response.config.url}`);
                
                // 检查业务状态码
                if (!response.data.success) {
                    const errorCode = String(response.data.code || 'UNKNOWN_ERROR');
                    this.handleApiError(errorCode, response.data.message || '未知错误');
                }
                
                return response;
            },
            (error) => {
                this.logger.error(`京东API响应错误: ${error.response?.status} ${error.config?.url}`, error.message);
                this.handleHttpError(error);
            }
        );
    }

    /**
     * 创建取件订单
     * @param pickupData 取件数据
     */
    async createPickup(pickupData: CreatePickupDto): Promise<PickupResponse> {
        try {
            const requestData: PickupRequest = {
                orderNo: pickupData.orderNo,
                customerCode: this.config.customerCode,
                sender: pickupData.sender,
                receiver: pickupData.receiver,
                goods: pickupData.goods,
                serviceType: pickupData.serviceType,
                payType: pickupData.payType,
                expectPickupTime: pickupData.expectPickupTime,
                remark: pickupData.remark,
                insured: pickupData.insured,
                insuredValue: pickupData.insuredValue
            };

            const response = await this.httpClient.post<JdApiResponse<PickupResponse>>(
                '/api/pickup/create',
                requestData
            );

            this.logger.log(`取件订单创建成功: ${pickupData.orderNo} -> ${response.data.data?.waybillNo}`);
            return response.data.data!;
        } catch (error) {
            this.logger.error(`创建取件订单失败: ${pickupData.orderNo}`, error);
            throw error;
        }
    }

    /**
     * 通知京东快递员上门取件
     * @param order 订单信息
     */
    async notifyCourierForPickup(order: any): Promise<PickupResponse> {
        try {
            // 转换订单数据为京东API格式
            const pickupData: CreatePickupDto = this.transformOrderToPickupData(order);
            
            // 创建取件订单
            const result = await this.createPickup(pickupData);
            
            this.logger.log(`京东快递取件通知成功: 订单${order.orderNo}, 运单号${result.waybillNo}`);
            return result;
        } catch (error) {
            this.logger.error(`京东快递取件通知失败: ${order.orderNo}`, error);
            throw error;
        }
    }

    /**
     * 查询取件状态
     * @param orderNo 订单号
     */
    async getPickupStatus(orderNo: string): Promise<WaybillStatusResponse> {
        try {
            const response = await this.httpClient.get<JdApiResponse<WaybillStatusResponse>>(
                `/api/pickup/status/${orderNo}`
            );

            this.logger.log(`查询取件状态成功: ${orderNo}`);
            return response.data.data!;
        } catch (error) {
            this.logger.error(`查询取件状态失败: ${orderNo}`, error);
            throw error;
        }
    }

    /**
     * 取消取件订单
     * @param cancelData 取消数据
     */
    async cancelPickup(cancelData: CancelPickupDto): Promise<boolean> {
        try {
            const response = await this.httpClient.post<JdApiResponse<boolean>>(
                '/api/pickup/cancel',
                cancelData
            );

            this.logger.log(`取消取件订单成功: ${cancelData.orderNo}`);
            return response.data.data!;
        } catch (error) {
            this.logger.error(`取消取件订单失败: ${cancelData.orderNo}`, error);
            throw error;
        }
    }

    /**
     * 查询运单轨迹
     * @param waybillNo 运单号
     */
    async queryWaybillTrace(waybillNo: string): Promise<WaybillStatusResponse> {
        try {
            const response = await this.httpClient.get<JdApiResponse<WaybillStatusResponse>>(
                `/api/waybill/trace/${waybillNo}`
            );

            this.logger.log(`查询运单轨迹成功: ${waybillNo}`);
            return response.data.data!;
        } catch (error) {
            this.logger.error(`查询运单轨迹失败: ${waybillNo}`, error);
            throw error;
        }
    }

    /**
     * 验证配置
     */
    private validateConfig(): void {
        if (!this.config.appKey || !this.config.appSecret || !this.config.customerCode) {
            throw new Error('京东快递API配置不完整，请检查环境变量');
        }
    }

    /**
     * 生成随机字符串
     */
    private generateNonce(): string {
        return crypto.randomBytes(16).toString('hex');
    }

    /**
     * 生成API签名
     * @param data 请求数据
     * @param timestamp 时间戳
     * @param nonce 随机字符串
     */
    private generateSignature(data: any, timestamp: string, nonce: string): string {
        const dataStr = data ? JSON.stringify(data) : '';
        const signStr = `${this.config.appKey}${timestamp}${nonce}${dataStr}${this.config.appSecret}`;
        return crypto.createHash('sha256').update(signStr).digest('hex');
    }

    /**
     * 转换订单数据为京东API格式
     * @param order 订单数据
     */
    private transformOrderToPickupData(order: any): CreatePickupDto {
        return {
            orderNo: order.orderNo,
            sender: {
                name: order.user.name,
                phone: order.user.phone,
                province: order.address.province,
                city: order.address.city,
                district: order.address.district || order.address.area,
                address: order.address.detail,
                postcode: order.address.postcode
            },
            receiver: {
                name: '京东快递回收中心',
                phone: '400-606-5500',
                province: '北京市',
                city: '北京市',
                district: '朝阳区',
                address: '京东总部大厦',
                postcode: '100000'
            },
            goods: order.items.map(item => ({
                name: item.category.name,
                category: item.category.code,
                weight: item.estimatedWeight || 1,
                quantity: 1,
                value: item.estimatedValue || 0,
                description: item.description || '回收物品'
            })),
            serviceType: ServiceType.STANDARD,
            payType: 1, // 寄付
            expectPickupTime: order.expectPickupTime,
            remark: order.remark || '回收物品取件',
            insured: false,
            insuredValue: 0
        };
    }

    /**
     * 处理京东API业务错误
     */
    private handleApiError(code: string, message: string): never {
        this.logger.error(`京东API业务错误: ${code} - ${message}`);
        
        switch (code) {
            case 'AUTH_FAILED':
            case 'INVALID_SIGNATURE':
            case 'INVALID_APP_KEY':
                throw new JdExpressAuthException(message);
            
            case 'RATE_LIMIT_EXCEEDED':
                throw new JdExpressRateLimitException();
            
            case 'INVALID_PARAMETER':
            case 'MISSING_PARAMETER':
                throw new JdExpressValidationException('参数', '', message);
            
            case 'SERVICE_UNAVAILABLE':
            case 'SYSTEM_MAINTENANCE':
                throw new JdExpressServiceUnavailableException('京东快递API');
            
            default:
                throw new JdExpressException(message, code);
        }
    }

    /**
     * 处理HTTP错误
     */
    private handleHttpError(error: any): never {
        const status = error.response?.status;
        const config = error.config;
        
        // 超时错误
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            throw new JdExpressTimeoutException(
                `${config?.method?.toUpperCase()} ${config?.url}`,
                this.config.timeout
            );
        }
        
        // 网络错误
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            throw new JdExpressServiceUnavailableException('京东快递API服务器');
        }
        
        // HTTP状态码错误
        switch (status) {
            case 401:
                throw new JdExpressAuthException('认证失败');
            case 429:
                const retryAfter = error.response?.headers['retry-after'];
                throw new JdExpressRateLimitException(retryAfter ? parseInt(retryAfter) : undefined);
            case 500:
            case 502:
            case 503:
            case 504:
                throw new JdExpressServiceUnavailableException('京东快递API服务器');
            default:
                if (error.response?.data) {
                    const apiError: JdApiError = error.response.data;
                    throw new JdExpressException(apiError.message, apiError.code);
                }
                throw new JdExpressException('京东API调用失败', 'HTTP_ERROR', { status, message: error.message });
        }
    }
}
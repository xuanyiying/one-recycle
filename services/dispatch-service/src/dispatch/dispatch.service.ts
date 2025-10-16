import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { SnowflakeIdGenerator } from '@one-recycle/shared';
import { JdExpressService } from '../jd-express/jd-express.service';
import { PickupResponse, PickupStatus } from '../jd-express/interfaces/jd-express.interface';
import { CancelPickupDto } from '../jd-express/dto/pickup.dto';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// 订单状态枚举
export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    DISPATCHED = 'DISPATCHED',
    PICKED_UP = 'PICKED_UP',
    IN_TRANSIT = 'IN_TRANSIT',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    FAILED = 'FAILED'
}

// 调度任务接口
export interface DispatchTask {
    id: string;
    orderId: string;
    orderNo: string;
    courierId?: string;
    waybillNo?: string;
    pickupCode?: string;
    status: OrderStatus;
    jdPickupResponse?: PickupResponse;
    createdAt: Date;
    updatedAt: Date;
    scheduledPickupTime?: Date;
    actualPickupTime?: Date;
    failureReason?: string;
    retryCount: number;
    maxRetries: number;
}

@Injectable()
export class DispatchService {
    private readonly logger = new Logger(DispatchService.name);
    private readonly httpClient: AxiosInstance;
    private readonly orderServiceUrl: string;
    private readonly courierServiceUrl: string;
    private readonly maxRetries = 3;
    private readonly retryDelay = 5000; // 5秒
    private readonly idGenerator: SnowflakeIdGenerator;

    constructor(private readonly jdExpressService: JdExpressService) {
        // Initialize ID generator
        this.idGenerator = new SnowflakeIdGenerator({ workerId: 9, datacenterId: 1 });
        
        // Initialize HTTP client for order service communication
        this.orderServiceUrl = process.env.ORDER_SERVICE_URL || 'http://localhost:3001';
        this.courierServiceUrl = process.env.COURIER_SERVICE_URL || 'http://localhost:3002';
        
        this.httpClient = axios.create({
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor for logging
        this.httpClient.interceptors.request.use(
            (config) => {
                this.logger.log(`发送请求: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                this.logger.error('请求拦截器错误:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor for logging and error handling
        this.httpClient.interceptors.response.use(
            (response) => {
                this.logger.log(`收到响应: ${response.status} ${response.config.url}`);
                return response;
            },
            (error) => {
                this.logger.error(`响应错误: ${error.response?.status} ${error.config?.url}`, error.message);
                return Promise.reject(error);
            }
        );
    }

    /**
     * 处理新订单 - 自动触发京东快递取件
     * @param order 订单信息
     */
    async processNewOrder(order: any): Promise<DispatchTask> {
        this.logger.log(`开始处理新订单: ${order.orderNo}`);

        try {
            // 创建调度任务
            const dispatchTask: DispatchTask = {
                id: this.generateTaskId(),
                orderId: order.id,
                orderNo: order.orderNo,
                status: OrderStatus.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
                retryCount: 0,
                maxRetries: this.maxRetries
            };

            // 验证订单数据
            this.validateOrderData(order);

            // 调用京东快递API创建取件订单
            const jdPickupResponse = await this.jdExpressService.notifyCourierForPickup(order);

            // 更新调度任务状态
            dispatchTask.status = OrderStatus.DISPATCHED;
            dispatchTask.waybillNo = jdPickupResponse.waybillNo;
            dispatchTask.pickupCode = jdPickupResponse.pickupCode;
            dispatchTask.jdPickupResponse = jdPickupResponse;
            dispatchTask.scheduledPickupTime = new Date(jdPickupResponse.estimatedPickupTime);
            dispatchTask.updatedAt = new Date();

            // 更新订单状态
            await this.updateOrderStatus(order.id, OrderStatus.DISPATCHED, {
                waybillNo: jdPickupResponse.waybillNo,
                pickupCode: jdPickupResponse.pickupCode,
                estimatedPickupTime: jdPickupResponse.estimatedPickupTime
            });

            // 通知快递员服务
            if (jdPickupResponse.courierInfo) {
                await this.notifyCourierService(dispatchTask, jdPickupResponse.courierInfo);
            }

            this.logger.log(`订单处理成功: ${order.orderNo} -> 运单号: ${jdPickupResponse.waybillNo}`);
            return dispatchTask;

        } catch (error) {
            this.logger.error(`订单处理失败: ${order.orderNo}`, error);
            
            // 创建失败的调度任务
            const failedTask: DispatchTask = {
                id: this.generateTaskId(),
                orderId: order.id,
                orderNo: order.orderNo,
                status: OrderStatus.FAILED,
                createdAt: new Date(),
                updatedAt: new Date(),
                retryCount: 0,
                maxRetries: this.maxRetries,
                failureReason: error.message
            };

            // 更新订单状态为失败
            await this.updateOrderStatus(order.id, OrderStatus.FAILED, {
                failureReason: error.message
            });

            // 如果可以重试，则安排重试
            if (this.shouldRetry(error)) {
                await this.scheduleRetry(failedTask);
            }

            throw error;
        }
    }

    /**
     * 重试失败的调度任务
     * @param task 调度任务
     */
    async retryDispatchTask(task: DispatchTask): Promise<DispatchTask> {
        if (task.retryCount >= task.maxRetries) {
            this.logger.error(`调度任务重试次数已达上限: ${task.orderNo}`);
            task.status = OrderStatus.FAILED;
            task.failureReason = '重试次数已达上限';
            return task;
        }

        this.logger.log(`重试调度任务: ${task.orderNo}, 第${task.retryCount + 1}次重试`);

        try {
            // 获取最新的订单信息
            const order = await this.getOrderDetails(task.orderId);
            
            // 重新调用京东快递API
            const jdPickupResponse = await this.jdExpressService.notifyCourierForPickup(order);

            // 更新任务状态
            task.status = OrderStatus.DISPATCHED;
            task.waybillNo = jdPickupResponse.waybillNo;
            task.pickupCode = jdPickupResponse.pickupCode;
            task.jdPickupResponse = jdPickupResponse;
            task.scheduledPickupTime = new Date(jdPickupResponse.estimatedPickupTime);
            task.updatedAt = new Date();
            task.retryCount++;

            // 更新订单状态
            await this.updateOrderStatus(task.orderId, OrderStatus.DISPATCHED, {
                waybillNo: jdPickupResponse.waybillNo,
                pickupCode: jdPickupResponse.pickupCode,
                estimatedPickupTime: jdPickupResponse.estimatedPickupTime
            });

            this.logger.log(`调度任务重试成功: ${task.orderNo}`);
            return task;

        } catch (error) {
            this.logger.error(`调度任务重试失败: ${task.orderNo}`, error);
            
            task.retryCount++;
            task.failureReason = error.message;
            task.updatedAt = new Date();

            if (task.retryCount < task.maxRetries && this.shouldRetry(error)) {
                // 继续重试
                await this.scheduleRetry(task);
            } else {
                // 标记为最终失败
                task.status = OrderStatus.FAILED;
                await this.updateOrderStatus(task.orderId, OrderStatus.FAILED, {
                    failureReason: error.message
                });
            }

            throw error;
        }
    }

    async assignOrder(orderId: string, courierId: string): Promise<any> {
        this.logger.log(`分配订单给快递员: 订单${orderId} -> 快递员${courierId}`);

        try {
            // 获取订单详情
            const order = await this.getOrderDetails(orderId);
            
            // 更新订单的快递员分配
            await this.updateOrderStatus(orderId, OrderStatus.CONFIRMED, {
                courierId: courierId,
                assignedAt: new Date().toISOString()
            });

            // 通知快递员服务
            await this.notifyCourierService({
                id: this.generateTaskId(),
                orderId,
                orderNo: order.orderNo,
                courierId,
                status: OrderStatus.CONFIRMED,
                createdAt: new Date(),
                updatedAt: new Date(),
                retryCount: 0,
                maxRetries: this.maxRetries
            }, { courierId });

            this.logger.log(`订单分配成功: ${orderId} -> ${courierId}`);
            return { success: true, orderId, courierId };

        } catch (error) {
            this.logger.error(`订单分配失败: ${orderId}`, error);
            throw new HttpException(
                `订单分配失败: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * 生成任务ID
     */
    private generateTaskId(): string {
        return this.idGenerator.nextId();
    }

    /**
     * 验证订单数据
     * @param order 订单数据
     */
    private validateOrderData(order: any): void {
        if (!order) {
            throw new HttpException('订单数据不能为空', HttpStatus.BAD_REQUEST);
        }

        if (!order.id || !order.orderNo) {
            throw new HttpException('订单ID和订单号不能为空', HttpStatus.BAD_REQUEST);
        }

        if (!order.senderAddress || !order.receiverAddress) {
            throw new HttpException('发件人和收件人地址不能为空', HttpStatus.BAD_REQUEST);
        }

        if (!order.goods || !Array.isArray(order.goods) || order.goods.length === 0) {
            throw new HttpException('订单商品信息不能为空', HttpStatus.BAD_REQUEST);
        }

        // 验证地址信息完整性
        this.validateAddress(order.senderAddress, '发件人地址');
        this.validateAddress(order.receiverAddress, '收件人地址');
    }

    /**
     * 验证地址信息
     * @param address 地址信息
     * @param addressType 地址类型
     */
    private validateAddress(address: any, addressType: string): void {
        const requiredFields = ['name', 'phone', 'province', 'city', 'district', 'detail'];
        
        for (const field of requiredFields) {
            if (!address[field]) {
                throw new HttpException(
                    `${addressType}的${field}字段不能为空`,
                    HttpStatus.BAD_REQUEST
                );
            }
        }
    }

    /**
     * 更新订单状态
     * @param orderId 订单ID
     * @param status 订单状态
     * @param additionalData 附加数据
     */
    private async updateOrderStatus(
        orderId: string,
        status: OrderStatus,
        additionalData?: any
    ): Promise<void> {
        try {
            const updateData = {
                status,
                updatedAt: new Date().toISOString(),
                ...additionalData
            };

            await this.httpClient.put(`${this.orderServiceUrl}/orders/${orderId}/status`, updateData);
            this.logger.log(`订单状态更新成功: ${orderId} -> ${status}`);

        } catch (error) {
            this.logger.error(`订单状态更新失败: ${orderId}`, error);
            throw new HttpException(
                `订单状态更新失败: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * 获取订单详情
     * @param orderId 订单ID
     */
    private async getOrderDetails(orderId: string): Promise<any> {
        try {
            const response = await this.httpClient.get(`${this.orderServiceUrl}/orders/${orderId}`);
            return response.data;

        } catch (error) {
            this.logger.error(`获取订单详情失败: ${orderId}`, error);
            throw new HttpException(
                `获取订单详情失败: ${error.message}`,
                HttpStatus.NOT_FOUND
            );
        }
    }

    /**
     * 通知快递员服务
     * @param task 调度任务
     * @param courierInfo 快递员信息
     */
    private async notifyCourierService(task: DispatchTask, courierInfo: any): Promise<void> {
        try {
            const notificationData = {
                taskId: task.id,
                orderId: task.orderId,
                orderNo: task.orderNo,
                courierId: task.courierId || courierInfo.courierId,
                waybillNo: task.waybillNo,
                pickupCode: task.pickupCode,
                scheduledPickupTime: task.scheduledPickupTime,
                courierInfo,
                notificationType: 'PICKUP_ASSIGNMENT',
                createdAt: new Date().toISOString()
            };

            await this.httpClient.post(
                `${this.courierServiceUrl}/notifications/pickup-assignment`,
                notificationData
            );

            this.logger.log(`快递员通知发送成功: 任务${task.id} -> 快递员${courierInfo.courierId}`);

        } catch (error) {
            this.logger.error(`快递员通知发送失败: 任务${task.id}`, error);
            // 通知失败不应该阻止主流程，只记录错误
        }
    }

    /**
     * 判断是否应该重试
     * @param error 错误信息
     */
    private shouldRetry(error: any): boolean {
        // 网络错误、超时错误、服务器5xx错误可以重试
        if (error.code === 'ECONNRESET' || 
            error.code === 'ETIMEDOUT' || 
            error.code === 'ENOTFOUND') {
            return true;
        }

        if (error.response && error.response.status >= 500) {
            return true;
        }

        // 京东API特定的可重试错误
        if (error.message && (
            error.message.includes('系统繁忙') ||
            error.message.includes('网络异常') ||
            error.message.includes('服务暂不可用')
        )) {
            return true;
        }

        return false;
    }

    /**
     * 安排重试任务
     * @param task 调度任务
     */
    private async scheduleRetry(task: DispatchTask): Promise<void> {
        const retryDelay = this.retryDelay * Math.pow(2, task.retryCount); // 指数退避
        
        this.logger.log(`安排重试任务: ${task.orderNo}, 延迟${retryDelay}ms`);

        setTimeout(async () => {
            try {
                await this.retryDispatchTask(task);
            } catch (error) {
                this.logger.error(`重试任务执行失败: ${task.orderNo}`, error);
            }
        }, retryDelay);
    }

    /**
     * 查询运单状态
     * @param waybillNo 运单号
     */
    async queryWaybillStatus(waybillNo: string): Promise<any> {
        try {
            return await this.jdExpressService.queryWaybillTrace(waybillNo);
        } catch (error) {
            this.logger.error(`查询运单状态失败: ${waybillNo}`, error);
            throw new HttpException(
                `查询运单状态失败: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * 取消取件订单
     * @param waybillNo 运单号
     * @param reason 取消原因
     */
    async cancelPickupOrder(waybillNo: string, reason: string): Promise<any> {
        try {
            const result = await this.jdExpressService.cancelPickup({ orderNo: waybillNo, reason });
            
            // 更新相关订单状态
            // 这里需要根据运单号查找对应的订单ID
            // await this.updateOrderStatusByWaybill(waybillNo, OrderStatus.CANCELLED, { cancelReason: reason });
            
            return result;
        } catch (error) {
            this.logger.error(`取消取件订单失败: ${waybillNo}`, error);
            throw new HttpException(
                `取消取件订单失败: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getAllAssignments(): Promise<any[]> {
        this.logger.log('获取所有派单信息');
        try {
            // 这里应该从数据库或缓存中获取所有调度任务
            // 暂时返回模拟数据
            return [{ 
                id: 'assign-123', 
                orderId: 'order-123', 
                courierId: 'courier-123', 
                status: 'assigned' 
            }];
        } catch (error) {
            this.logger.error('获取派单信息失败', error);
            throw new HttpException(
                '获取派单信息失败',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getAssignment(id: string): Promise<any> {
        this.logger.log(`获取派单详情: ${id}`);
        try {
            // 这里应该从数据库中获取具体的调度任务
            // 暂时返回模拟数据
            return { 
                id, 
                orderId: 'order-123', 
                courierId: 'courier-123', 
                status: 'assigned' 
            };
        } catch (error) {
            this.logger.error(`获取派单详情失败: ${id}`, error);
            throw new HttpException(
                '获取派单详情失败',
                HttpStatus.NOT_FOUND
            );
        }
    }

    async updateAssignmentStatus(id: string, status: string): Promise<any> {
        this.logger.log(`更新派单状态: ${id} -> ${status}`);
        try {
            // 这里应该更新数据库中的调度任务状态
            // 暂时返回模拟数据
            return { id, status };
        } catch (error) {
            this.logger.error(`更新派单状态失败: ${id}`, error);
            throw new HttpException(
                '更新派单状态失败',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async acceptAssignment(id: string): Promise<any> {
        this.logger.log(`快递员接受派单: ${id}`);
        try {
            // 更新派单状态为已接受
            const result = await this.updateAssignmentStatus(id, 'accepted');
            
            // 通知相关系统
            // await this.notifyOrderService(id, 'accepted');
            
            return result;
        } catch (error) {
            this.logger.error(`接受派单失败: ${id}`, error);
            throw new HttpException(
                '接受派单失败',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async rejectAssignment(id: string): Promise<any> {
        this.logger.log(`快递员拒绝派单: ${id}`);
        try {
            // 更新派单状态为已拒绝
            const result = await this.updateAssignmentStatus(id, 'rejected');
            
            // 重新分配给其他快递员
            // await this.reassignToOtherCourier(id);
            
            return result;
        } catch (error) {
            this.logger.error(`拒绝派单失败: ${id}`, error);
            throw new HttpException(
                '拒绝派单失败',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
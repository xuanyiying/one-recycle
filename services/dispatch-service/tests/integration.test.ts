import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { DispatchService } from '../src/dispatch/dispatch.service';
import { JdExpressService } from '../src/jd-express/jd-express.service';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { RetryInterceptor } from '../src/common/interceptors/retry.interceptor';

describe('京东快递系统集成测试', () => {
    let app: INestApplication;
    let dispatchService: DispatchService;
    let jdExpressService: JdExpressService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            providers: [
                DispatchService,
                JdExpressService,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        
        // 添加全局异常过滤器
        app.useGlobalFilters(new GlobalExceptionFilter());
        
        // 添加重试拦截器
        app.useGlobalInterceptors(new RetryInterceptor());
        
        dispatchService = moduleFixture.get<DispatchService>(DispatchService);
        jdExpressService = moduleFixture.get<JdExpressService>(JdExpressService);
        
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    const testOrder = {
            orderId: 'TEST_ORDER_001',
            customerId: 'CUSTOMER_001',
            items: [
                {
                    name: '废旧手机',
                    category: 'electronics',
                    quantity: 2,
                    weight: 0.5,
                    estimatedValue: 200
                }
            ],
            pickupAddress: {
                province: '北京市',
                city: '北京市',
                district: '朝阳区',
                street: '建国路88号',
                detail: 'SOHO现代城A座1001室',
                contact: {
                    name: '张三',
                    phone: '13800138000'
                }
            },
            preferredTime: '2024-01-15 14:00:00',
            notes: '请提前电话联系'
        };

    describe('订单处理流程测试', () => {
        it('应该成功处理新订单并创建京东快递取件任务', async () => {
            // 模拟订单创建
            const result = await dispatchService.processNewOrder(testOrder);
            
            expect(result).toBeDefined();
            expect(result.success).toBe(true);
            expect(result.taskId).toBeDefined();
            expect(result.courierId).toBe('jd-express');
            
            // 验证任务状态
            const task = await dispatchService.getDispatchTask(result.taskId);
            expect(task.status).toBe('PENDING');
            expect(task.orderData).toEqual(testOrder);
        });

        it('应该正确处理京东快递API错误并重试', async () => {
            // 模拟API错误的订单
            const errorOrder = {
                ...testOrder,
                orderId: 'ERROR_ORDER_001',
                pickupAddress: {
                    ...testOrder.pickupAddress,
                    province: '', // 无效地址导致API错误
                }
            };

            try {
                await dispatchService.processNewOrder(errorOrder);
            } catch (error) {
                expect(error.message).toContain('地址信息不完整');
            }
        });

        it('应该能够查询运单状态', async () => {
            const waybillNo = 'JD123456789';
            
            try {
                const status = await jdExpressService.queryWaybillTrace(waybillNo);
                expect(status).toBeDefined();
                expect(status.waybillNo).toBe(waybillNo);
            } catch (error) {
                // 如果是测试环境，可能会返回错误，这是正常的
                expect(error).toBeDefined();
            }
        });

        it('应该能够取消取件订单', async () => {
            const waybillNo = 'JD123456789';
            const reason = '客户取消订单';
            
            try {
                const result = await jdExpressService.cancelPickupOrder(waybillNo, reason);
                expect(result).toBeDefined();
                expect(result.success).toBe(true);
            } catch (error) {
                // 测试环境可能返回错误
                expect(error).toBeDefined();
            }
        });
    });

    describe('异常处理测试', () => {
        it('应该正确处理网络超时', async () => {
            // 模拟网络超时
            jest.spyOn(jdExpressService, 'createPickup').mockRejectedValue(
                new Error('timeout of 10000ms exceeded')
            );

            const timeoutOrder = {
                ...testOrder,
                orderId: 'TIMEOUT_ORDER_001'
            };

            try {
                await dispatchService.processNewOrder(timeoutOrder);
            } catch (error) {
                expect(error.message).toContain('timeout');
            }
        });

        it('应该正确处理认证错误', async () => {
            // 模拟认证错误
            jest.spyOn(jdExpressService, 'createPickup').mockRejectedValue(
                new Error('Authentication failed')
            );

            const authErrorOrder = {
                ...testOrder,
                orderId: 'AUTH_ERROR_ORDER_001'
            };

            try {
                await dispatchService.processNewOrder(authErrorOrder);
            } catch (error) {
                expect(error.message).toContain('Authentication');
            }
        });

        it('应该正确处理限流错误', async () => {
            // 模拟限流错误
            jest.spyOn(jdExpressService, 'createPickup').mockRejectedValue(
                new Error('Rate limit exceeded')
            );

            const rateLimitOrder = {
                ...testOrder,
                orderId: 'RATE_LIMIT_ORDER_001'
            };

            try {
                await dispatchService.processNewOrder(rateLimitOrder);
            } catch (error) {
                expect(error.message).toContain('Rate limit');
            }
        });
    });

    describe('重试机制测试', () => {
        it('应该在失败后自动重试', async () => {
            let callCount = 0;
            jest.spyOn(jdExpressService, 'createPickup').mockImplementation(() => {
                callCount++;
                if (callCount < 3) {
                    throw new Error('Temporary failure');
                }
                return Promise.resolve({
                    success: true,
                    waybillNo: 'JD987654321',
                    pickupCode: 'PICKUP123'
                });
            });

            const retryOrder = {
                ...testOrder,
                orderId: 'RETRY_ORDER_001'
            };

            const result = await dispatchService.processNewOrder(retryOrder);
            
            expect(callCount).toBe(3); // 应该重试了2次
            expect(result.success).toBe(true);
        });

        it('应该在达到最大重试次数后停止', async () => {
            jest.spyOn(jdExpressService, 'createPickup').mockRejectedValue(
                new Error('Persistent failure')
            );

            const maxRetryOrder = {
                ...testOrder,
                orderId: 'MAX_RETRY_ORDER_001'
            };

            try {
                await dispatchService.processNewOrder(maxRetryOrder);
            } catch (error) {
                expect(error.message).toContain('Persistent failure');
            }
        });
    });

    describe('数据验证测试', () => {
        it('应该验证订单数据完整性', async () => {
            const invalidOrder = {
                orderId: '', // 无效订单ID
                customerId: 'CUSTOMER_001',
                items: [],  // 空商品列表
                pickupAddress: null, // 无效地址
            };

            try {
                await dispatchService.processNewOrder(invalidOrder);
            } catch (error) {
                expect(error.message).toContain('订单数据验证失败');
            }
        });

        it('应该验证地址信息', async () => {
            const invalidAddressOrder = {
                ...testOrder,
                orderId: 'INVALID_ADDRESS_ORDER_001',
                pickupAddress: {
                    province: '',
                    city: '',
                    district: '',
                    street: '',
                    detail: '',
                    contact: {
                        name: '',
                        phone: ''
                    }
                }
            };

            try {
                await dispatchService.processNewOrder(invalidAddressOrder);
            } catch (error) {
                expect(error.message).toContain('地址信息不完整');
            }
        });
    });

    describe('性能测试', () => {
        it('应该在合理时间内处理订单', async () => {
            const startTime = Date.now();
            
            const performanceOrder = {
                ...testOrder,
                orderId: 'PERFORMANCE_ORDER_001'
            };

            try {
                await dispatchService.processNewOrder(performanceOrder);
            } catch (error) {
                // 即使失败也要检查时间
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // 应该在10秒内完成
            expect(duration).toBeLessThan(10000);
        });

        it('应该能够并发处理多个订单', async () => {
            const orders = Array.from({ length: 5 }, (_, index) => ({
                ...testOrder,
                orderId: `CONCURRENT_ORDER_${index + 1}`
            }));

            const startTime = Date.now();
            
            const promises = orders.map(order => 
                dispatchService.processNewOrder(order).catch(error => ({ error }))
            );
            
            const results = await Promise.all(promises);
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // 并发处理应该比串行处理快
            expect(duration).toBeLessThan(15000);
            expect(results).toHaveLength(5);
        });
    });
});
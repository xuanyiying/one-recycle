import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DispatchClientService {
    private readonly dispatchServiceUrl: string;

    constructor(private readonly httpService: HttpService) {
        // 从环境变量获取派发服务地址，如果没有则使用默认值
        this.dispatchServiceUrl = process.env.DISPATCH_SERVICE_URL || 'http://localhost:3007';
    }

    async assignOrder(data: { orderId: string; courierId: string }): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.dispatchServiceUrl}/api/dispatch/assign`, data)
            );
            return response.data;
        } catch (error) {
            console.error('Failed to assign order to dispatch service:', error);
            throw error;
        }
    }

    async notifyJdExpressForPickup(orderId: string): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.dispatchServiceUrl}/api/jd-express/notify-pickup`, {
                    orderId,
                    courierId: 'jd-express'
                })
            );
            return response.data;
        } catch (error) {
            console.error('Failed to notify JD Express:', error);
            throw error;
        }
    }
}
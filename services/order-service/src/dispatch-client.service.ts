import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Observable } from 'rxjs';

interface DispatchService {
    assignOrder(data: { orderId: string; courierId: string }): Observable<any>;
}

@Injectable()
export class DispatchClientService implements OnModuleInit {
    @Client({
        transport: Transport.GRPC,
        options: {
            package: 'dispatch',
            protoPath: join(__dirname, '../proto/dispatch.proto'),
            url: 'dispatch-service:50056', // 派发服务地址
        },
    })
    private readonly client: ClientGrpc;

    private dispatchService: DispatchService;

    onModuleInit() {
        this.dispatchService = this.client.getService<DispatchService>('DispatchService');
    }

    async notifyJdExpressForPickup(orderId: string): Promise<any> {
        try {
            const result = await this.dispatchService.assignOrder({
                orderId,
                courierId: 'jd-express'
            }).toPromise();
            return result;
        } catch (error) {
            console.error('Failed to notify JD Express:', error);
            throw error;
        }
    }
}
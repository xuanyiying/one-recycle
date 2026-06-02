import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices/enums';
import { join } from 'path';
import { IDispatchService } from '../interfaces/dispatch-service.interface';

@Injectable()
export class DispatchServiceGrpcClient implements IDispatchService {
  private readonly logger = new Logger(DispatchServiceGrpcClient.name);
  private readonly client: any;
  private dispatchService: any;

  constructor(private readonly configService: ConfigService) {
    const url =
      this.configService.get<string>('DISPATCH_SERVICE_GRPC_URL') ||
      '127.0.0.1:50051';

    this.client = ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        package: 'dispatch',
        protoPath: join(__dirname, '../../../proto/dispatch.proto'),
        url,
      },
    });

    this.dispatchService = this.client.getService('DispatchService');
    this.logger.log(`gRPC client connected to dispatch service at ${url}`);
  }

  async cancelDispatch(orderId: string, reason: string): Promise<boolean> {
    this.logger.debug(`[gRPC] Cancelling dispatch for order ${orderId}`);

    try {
      const assignments = await new Promise<any>((resolve, reject) => {
        this.dispatchService.listAssignments(
          { page: 1, limit: 100 },
          (err: Error | null, res: any) => {
            if (err) reject(err);
            else resolve(res);
          },
        );
      });

      const orderAssignments = (assignments.items || []).filter(
        (a: any) => String(a.orderId) === orderId,
      );

      for (const assignment of orderAssignments) {
        await new Promise<void>((resolve, reject) => {
          this.dispatchService.updateAssignmentStatus(
            {
              id: assignment.id,
              status: 'CANCELLED',
            },
            (err: Error | null) => {
              if (err) reject(err);
              else resolve();
            },
          );
        });
      }

      this.logger.log(
        `[gRPC] Dispatch cancelled for order ${orderId}, affected ${orderAssignments.length} assignments`,
      );
      return orderAssignments.length > 0;
    } catch (error) {
      this.logger.error(
        `[gRPC] Failed to cancel dispatch for order ${orderId}:`,
        error,
      );
      throw error;
    }
  }
}

import { DispatchService } from '@/modules/dispatch/dispatch.service';
import { Injectable, Logger } from '@nestjs/common';
import { IDispatchService } from '../interfaces/dispatch-service.interface';

@Injectable()
export class LocalDispatchServiceAdapter implements IDispatchService {
  private readonly logger = new Logger(LocalDispatchServiceAdapter.name);

  constructor(private readonly dispatchService: DispatchService) {}

  async cancelDispatch(orderId: string, _reason: string): Promise<boolean> {
    this.logger.debug(`Cancelling dispatch for order ${orderId} locally`);

    try {
      const result = await this.dispatchService.cancelDispatch(orderId);

      this.logger.log(
        `Dispatch cancelled for order ${orderId}, updated ${result.count} assignments`,
      );
      return result.cancelled;
    } catch (error) {
      this.logger.error(
        `Failed to cancel dispatch for order ${orderId}`,
        error,
      );
      throw error;
    }
  }
}

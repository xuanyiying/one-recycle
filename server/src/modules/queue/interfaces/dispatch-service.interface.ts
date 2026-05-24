export interface IDispatchService {
  cancelDispatch(orderId: string, reason: string): Promise<boolean>;
}

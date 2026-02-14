import React, { useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Order, OrderStatus, UpdateOrderRequest } from '@/services/orderService';
import { orderStatusLabels } from '@/lib/orderStateMachine';
import { useForm } from 'react-hook-form';

interface OrderModalProps {
  visible: boolean;
  onOk: (id: number, values: UpdateOrderRequest) => void;
  onCancel: () => void;
  order: Order | null;
  loading?: boolean;
}

const OrderModal: React.FC<OrderModalProps> = ({
  visible,
  onOk,
  onCancel,
  order,
  loading,
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateOrderRequest>({
    defaultValues: {
      status: OrderStatus.PENDING,
      remark: '',
      expectPickupTime: '',
      expectDeliveryTime: '',
      actualPickupTime: '',
      actualDeliveryTime: '',
      settlementAmount: undefined,
      payAmount: undefined,
    }
  });

  useEffect(() => {
    if (visible && order) {
      reset({
        status: order.status,
        remark: order.remark || '',
        expectPickupTime: formatDateTimeInput(order.expectPickupTime),
        expectDeliveryTime: formatDateTimeInput(order.expectDeliveryTime),
        actualPickupTime: formatDateTimeInput(order.actualPickupTime),
        actualDeliveryTime: formatDateTimeInput(order.actualDeliveryTime),
        settlementAmount: order.settlementAmount,
        payAmount: order.payAmount,
      });
    }
  }, [visible, order, reset]);

  const onSubmit = (values: UpdateOrderRequest) => {
    if (order) {
      onOk(order.id, values);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(price);
  };

  const formatDateTimeInput = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 16);
  };

  const formatDisplayTime = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const getFullAddress = (address?: Order['address']) => {
    if (!address) return '-';
    return [
      address.province,
      address.city,
      address.district,
      address.town,
      address.street,
      address.detail,
    ]
      .filter(Boolean)
      .join('');
  };

  return (
    <Modal
      title={order ? `编辑订单: ${order.orderNo}` : '订单详情'}
      open={visible}
      onOpenChange={(open) => !open && onCancel()}
      width={700}
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={loading}>
            保存
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {order && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">订单概览</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>订单号：{order.orderNo}</div>
              <div>状态：{orderStatusLabels[order.status] || order.status}</div>
              <div>订单类型：{order.orderType || '-'}</div>
              <div>渠道：{order.channel || '-'}</div>
              <div>来源：{order.source || '-'}</div>
              <div>用户ID：{order.userId}</div>
              <div>预约上门时间：{formatDisplayTime(order.expectPickupTime)}</div>
              <div>实际上门时间：{formatDisplayTime(order.actualPickupTime)}</div>
              <div>创建时间：{formatDisplayTime(order.createdAt)}</div>
              <div>更新时间：{formatDisplayTime(order.updatedAt)}</div>
              <div>完成时间：{formatDisplayTime(order.completedAt)}</div>
            </div>
          </div>
        )}

        {order && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">客户信息</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>姓名：{order.address?.name || '-'}</div>
              <div>电话：{order.address?.mobile || '-'}</div>
              <div className="col-span-2">地址：{getFullAddress(order.address)}</div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">状态与时间</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">状态</label>
              <Select {...register('status', { required: '请选择状态' })}>
                {Object.values(OrderStatus).map((s) => (
                  <option key={s} value={s}>{orderStatusLabels[s] || s}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">期望上门时间</label>
              <Input type="datetime-local" {...register('expectPickupTime')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">实际上门时间</label>
              <Input type="datetime-local" {...register('actualPickupTime')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">期望送达时间</label>
              <Input type="datetime-local" {...register('expectDeliveryTime')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">实际送达时间</label>
              <Input type="datetime-local" {...register('actualDeliveryTime')} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">备注</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('remark')}
            />
          </div>
        </div>

        {order && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">金额信息</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm">预估金额：{formatPrice(order.estimatedAmount || 0)}</div>
              <div className="text-sm">优惠金额：{formatPrice(order.discountAmount || 0)}</div>
              <div className="space-y-2">
                <label className="text-sm font-medium">结算金额</label>
                <Input type="number" step="0.01" {...register('settlementAmount', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">支付金额</label>
                <Input type="number" step="0.01" {...register('payAmount', { valueAsNumber: true })} />
              </div>
            </div>
          </div>
        )}

        {order?.items && order.items.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">订单明细</h4>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">分类</th>
                    <th className="px-4 py-2 text-right font-medium">数量</th>
                    <th className="px-4 py-2 text-right font-medium">预估重量</th>
                    <th className="px-4 py-2 text-right font-medium">实际重量</th>
                    <th className="px-4 py-2 text-right font-medium">单价</th>
                    <th className="px-4 py-2 text-right font-medium">小计</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2">{item.categoryName || `分类#${item.categoryId}`}</td>
                      <td className="px-4 py-2 text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">{item.estimatedWeight ?? '-'}</td>
                      <td className="px-4 py-2 text-right">{item.actualWeight ?? '-'}</td>
                      <td className="px-4 py-2 text-right">{formatPrice(item.unitPrice || 0)}</td>
                      <td className="px-4 py-2 text-right">{formatPrice(item.amount || 0)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-medium">
                    <td colSpan={5} className="px-4 py-2 text-right">合计</td>
                    <td className="px-4 py-2 text-right">{formatPrice(order.estimatedAmount || 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {order?.logisticsOrders && order.logisticsOrders.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">物流信息</h4>
            <div className="space-y-3">
              {order.logisticsOrders.map((logistics) => (
                <div key={logistics.id} className="rounded-md border p-4 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>物流单号：{logistics.logisticsNo || '-'}</div>
                    <div>物流公司：{logistics.logisticsCompany || '-'}</div>
                    <div>状态：{logistics.status || '-'}</div>
                    <div>运费：{logistics.deliveryFee ? formatPrice(logistics.deliveryFee) : '-'}</div>
                    <div>寄件人：{logistics.senderName || '-'}</div>
                    <div>寄件电话：{logistics.senderPhone || '-'}</div>
                    <div className="col-span-2">寄件地址：{logistics.senderAddress || '-'}</div>
                    <div>收件人：{logistics.receiverName || '-'}</div>
                    <div>收件电话：{logistics.receiverPhone || '-'}</div>
                    <div className="col-span-2">收件地址：{logistics.receiverAddress || '-'}</div>
                    <div>预计取件：{formatDisplayTime(logistics.estimatedPickupTime)}</div>
                    <div>实际取件：{formatDisplayTime(logistics.actualPickupTime)}</div>
                    <div>预计送达：{formatDisplayTime(logistics.estimatedDeliveryTime)}</div>
                    <div>实际送达：{formatDisplayTime(logistics.actualDeliveryTime)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {order?.timeline && order.timeline.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">状态流转</h4>
            <div className="space-y-2 text-sm">
              {order.timeline.map((item) => (
                <div key={item.id} className="flex justify-between rounded-md border px-3 py-2">
                  <div className="flex flex-col">
                    <span>{item.message || orderStatusLabels[item.status as OrderStatus] || item.status}</span>
                    <span className="text-xs text-muted-foreground">{item.operator || '系统'}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDisplayTime(item.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default OrderModal;

import React, { useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Order, OrderStatus, UpdateOrderRequest } from '@/services/orderService';
import { useForm } from 'react-hook-form';

interface OrderModalProps {
  visible: boolean;
  onOk: (id: string, values: UpdateOrderRequest) => void;
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
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UpdateOrderRequest>({
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      status: OrderStatus.PENDING,
      notes: '',
      scheduledDate: '',
    }
  });

  useEffect(() => {
    if (visible && order) {
      reset({
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress,
        status: order.status,
        notes: order.notes || '',
        scheduledDate: order.scheduledDate ? new Date(order.scheduledDate).toISOString().split('T')[0] : '',
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

  return (
    <Modal
      title={order ? `编辑订单: ${order.orderNumber}` : '订单详情'}
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
        {/* Customer Info */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">客户信息</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">客户姓名</label>
              <Input 
                {...register('customerName', { required: '请输入客户姓名' })} 
                className={errors.customerName ? 'border-red-500' : ''}
              />
              {errors.customerName && <span className="text-xs text-red-500">{errors.customerName.message}</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">联系电话</label>
              <Input 
                {...register('customerPhone', { required: '请输入联系电话' })} 
                className={errors.customerPhone ? 'border-red-500' : ''}
              />
              {errors.customerPhone && <span className="text-xs text-red-500">{errors.customerPhone.message}</span>}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">取货地址</label>
            <Input 
              {...register('customerAddress', { required: '请输入取货地址' })} 
              className={errors.customerAddress ? 'border-red-500' : ''}
            />
            {errors.customerAddress && <span className="text-xs text-red-500">{errors.customerAddress.message}</span>}
          </div>
        </div>

        {/* Order Status & Schedule */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">订单状态</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">状态</label>
              <Select {...register('status', { required: '请选择状态' })}>
                {Object.values(OrderStatus).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">预约日期</label>
              <Input 
                type="date"
                {...register('scheduledDate')} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">备注</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('notes')}
            />
          </div>
        </div>

        {/* Order Items (Read Only for now) */}
        {order && order.items && order.items.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">订单商品</h4>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">商品名称</th>
                    <th className="px-4 py-2 text-right font-medium">单价</th>
                    <th className="px-4 py-2 text-right font-medium">数量</th>
                    <th className="px-4 py-2 text-right font-medium">小计</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2">{item.categoryName}</td>
                      <td className="px-4 py-2 text-right">{formatPrice(item.unitPrice)}</td>
                      <td className="px-4 py-2 text-right">{item.quantity} {item.unit}</td>
                      <td className="px-4 py-2 text-right">{formatPrice(item.totalPrice)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-medium">
                    <td colSpan={3} className="px-4 py-2 text-right">总计</td>
                    <td className="px-4 py-2 text-right">{formatPrice(order.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default OrderModal;

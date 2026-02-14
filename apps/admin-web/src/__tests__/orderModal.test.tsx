import React from 'react';
import * as rtl from '@testing-library/react';
import OrderModal from '@/app/(dashboard)/orders/components/OrderModal';
import { OrderStatus } from '@/services/orderService';

const { render, screen } = rtl as any;

const mockOrder = {
  id: 1,
  orderNo: 'ORD20240101001',
  userId: 100,
  addressId: 1,
  orderType: 'RECYCLE',
  status: OrderStatus.PENDING_PICKUP,
  priority: 1,
  expectPickupTime: '2024-01-15T10:00:00.000Z',
  actualPickupTime: '2024-01-15T10:30:00.000Z',
  expectDeliveryTime: '2024-01-16T14:00:00.000Z',
  actualDeliveryTime: null,
  estimatedAmount: 150.00,
  settlementAmount: 0,
  payAmount: 0,
  channel: 'APP',
  remark: 'Test order',
  source: 'MOBILE',
  createdAt: '2024-01-10T08:00:00.000Z',
  updatedAt: '2024-01-10T08:00:00.000Z',
  address: {
    id: 1,
    userId: 100,
    name: '张三',
    mobile: '13800138000',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    town: '',
    street: '科技园路',
    zipCode: '518000',
    detail: 'A栋101室',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  items: [],
  assignments: [],
  logisticsOrders: [],
  timeline: [],
};

describe('OrderModal', () => {
  it('displays scheduled pickup time in order overview', async () => {
    const onOk = jest.fn();
    const onCancel = jest.fn();

    render(
      <OrderModal
        visible={true}
        onOk={onOk}
        onCancel={onCancel}
        order={mockOrder}
        loading={false}
      />
    );

    const pickupTimeLabels = screen.getAllByText(/预约上门时间|实际上门时间/);
    expect(pickupTimeLabels.length).toBeGreaterThanOrEqual(2);
  });

  it('formats pickup time correctly', async () => {
    const onOk = jest.fn();
    const onCancel = jest.fn();

    render(
      <OrderModal
        visible={true}
        onOk={onOk}
        onCancel={onCancel}
        order={mockOrder}
        loading={false}
      />
    );

    const overviewSection = screen.getByText('订单概览').parentElement;
    expect(overviewSection).toHaveTextContent('预约上门时间');
    expect(overviewSection).toHaveTextContent('实际上门时间');
  });

  it('displays dash when pickup time is not set', async () => {
    const onOk = jest.fn();
    const onCancel = jest.fn();

    const orderWithoutPickupTime = {
      ...mockOrder,
      expectPickupTime: null,
      actualPickupTime: null,
    };

    render(
      <OrderModal
        visible={true}
        onOk={onOk}
        onCancel={onCancel}
        order={orderWithoutPickupTime}
        loading={false}
      />
    );

    const overviewSection = screen.getByText('订单概览').parentElement;
    const timeLabels = overviewSection?.querySelectorAll('div');

    timeLabels?.forEach((label: Element) => {
      if (label.textContent?.includes('预约上门时间') || label.textContent?.includes('实际上门时间')) {
        expect(label.textContent).toContain('-');
      }
    });
  });

  it('displays order status correctly', async () => {
    const onOk = jest.fn();
    const onCancel = jest.fn();

    render(
      <OrderModal
        visible={true}
        onOk={onOk}
        onCancel={onCancel}
        order={mockOrder}
        loading={false}
      />
    );

    expect(screen.getByText('待取件')).toBeInTheDocument();
  });

  it('displays customer information', async () => {
    const onOk = jest.fn();
    const onCancel = jest.fn();

    render(
      <OrderModal
        visible={true}
        onOk={onOk}
        onCancel={onCancel}
        order={mockOrder}
        loading={false}
      />
    );

    expect(screen.getByText('客户信息')).toBeInTheDocument();
    expect(screen.getByText(/张三/)).toBeInTheDocument();
    expect(screen.getByText(/13800138000/)).toBeInTheDocument();
  });

  it('renders edit form with pickup time inputs', async () => {
    const onOk = jest.fn();
    const onCancel = jest.fn();

    render(
      <OrderModal
        visible={true}
        onOk={onOk}
        onCancel={onCancel}
        order={mockOrder}
        loading={false}
      />
    );

    const allLabels = screen.getAllByText(/上门时间|送达时间/);
    expect(allLabels.length).toBeGreaterThan(0);
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onOk = jest.fn();
    const onCancel = jest.fn();

    render(
      <OrderModal
        visible={true}
        onOk={onOk}
        onCancel={onCancel}
        order={mockOrder}
        loading={false}
      />
    );

    const cancelButton = screen.getByText('取消');
    cancelButton.click();

    expect(onCancel).toHaveBeenCalled();
  });
});

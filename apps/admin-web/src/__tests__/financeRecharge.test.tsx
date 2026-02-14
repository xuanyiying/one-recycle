import React from 'react';
import * as rtl from '@testing-library/react';
import RechargePage from '@/app/(dashboard)/finance/recharge/page';
import { Toaster } from '@/components/ui/toast';

const { render, screen, fireEvent, waitFor } = rtl as any;

jest.mock('@/services/financeService', () => ({
  financeService: {
    getRechargePlans: jest.fn().mockResolvedValue([
      { id: 'plan-1', name: '基础', amount: 100, bonus: 10, description: '基础套餐' },
      { id: 'plan-2', name: '标准', amount: 500, bonus: 80, tag: '热门', description: '标准套餐' },
      { id: 'plan-3', name: '高级', amount: 1000, bonus: 200, description: '高级套餐' },
    ]),
    getWallet: jest.fn().mockResolvedValue({
      balance: 1000,
      frozenAmount: 100,
      totalRecharge: 2000,
      totalPayout: 900
    }),
    getTransactions: jest.fn().mockResolvedValue({
      data: [],
      total: 0
    }),
    createRechargeOrder: jest.fn().mockResolvedValue({
      orderNo: 'REC-123',
      payUrl: 'https://pay.example.com'
    })
  },
}));

describe('RechargePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders recharge page with title', async () => {
    render(
      <Toaster>
        <RechargePage />
      </Toaster>
    );

    expect(screen.getByText('账户充值')).toBeInTheDocument();
  });

  it('renders recharge plans section', async () => {
    render(
      <Toaster>
        <RechargePage />
      </Toaster>
    );

    expect(screen.getByText('充值套餐')).toBeInTheDocument();
  });

  it('displays tag for promoted plans', async () => {
    render(
      <Toaster>
        <RechargePage />
      </Toaster>
    );

    await waitFor(() => {
      expect(screen.getByText('热门')).toBeInTheDocument();
    });
  });

  it('switches payment methods', async () => {
    render(
      <Toaster>
        <RechargePage />
      </Toaster>
    );

    await waitFor(() => {
      expect(screen.getByText('充值套餐')).toBeInTheDocument();
    });

    const paymentButtons = screen.getAllByText(/支付宝|微信转账/);
    expect(paymentButtons.length).toBeGreaterThan(0);
  });

  it('allows custom amount input', async () => {
    render(
      <Toaster>
        <RechargePage />
      </Toaster>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('输入金额')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('输入金额');
    fireEvent.change(input, { target: { value: '250' } });

    expect(input).toHaveValue(250);
  });

  it('requires voucher before submitting recharge', async () => {
    render(
      <Toaster>
        <RechargePage />
      </Toaster>
    );

    await waitFor(() => {
      expect(screen.getByText('立即充值')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('立即充值');
    fireEvent.click(submitButton);

    expect(await screen.findByText('请选择充值套餐或输入金额')).toBeInTheDocument();
  });

  it('renders compact layout with proper grid', async () => {
    render(
      <Toaster>
        <RechargePage />
      </Toaster>
    );

    await waitFor(() => {
      const grid = document.querySelector('.grid-cols-3');
      expect(grid).toBeInTheDocument();
    });
  });
});

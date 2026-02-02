import React from 'react';
import * as rtl from '@testing-library/react';
import RechargePage from '@/app/(dashboard)/finance/page';
import { Toaster } from '@/components/ui/toast';

const { render, screen, fireEvent, waitFor } = rtl as any;

jest.mock('@/services/financeService', () => ({
  financeService: {
    getRechargePlans: jest.fn().mockResolvedValue([
      { id: 'plan-1', name: '基础', amount: 100, bonus: 10, description: '基础套餐' },
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
  it('requires voucher before submitting recharge', async () => {
    render(
      <Toaster>
        <RechargePage />
      </Toaster>
    );

    // Open the modal first
    fireEvent.click(await screen.findByRole('button', { name: /账户充值/i }));

    await waitFor(() => {
      expect(screen.getByText('基础套餐')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('请输入充值金额'), { target: { value: '200' } });
    fireEvent.click(screen.getByText('确定充值'));

    expect(await screen.findByText('请上传转账截图')).toBeInTheDocument();
  });
});

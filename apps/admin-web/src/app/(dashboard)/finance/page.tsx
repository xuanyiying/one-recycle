'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Statistic } from '@/components/ui/statistic';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { financeService, PlatformWallet, PlatformTransaction, RechargePlan } from '@/services/financeService';
import { useForm } from 'react-hook-form';
import { UploadCloud } from 'lucide-react';
import Image from 'next/image';

interface RechargeFormValues {
  amount: number;
  paymentMethod: 'ALIPAY' | 'WECHAT';
}

export default function FinanceDashboard() {
  const [wallet, setWallet] = useState<PlatformWallet | null>(null);
  const [transactions, setTransactions] = useState<PlatformTransaction[]>([]);
  const [plans, setPlans] = useState<RechargePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [voucher, setVoucher] = useState<string | null>(null);
  const [voucherName, setVoucherName] = useState('');

  const { register, handleSubmit, setValue, watch, reset } = useForm<RechargeFormValues>({
    defaultValues: {
      amount: 100,
      paymentMethod: 'ALIPAY',
    }
  });

  const currentAmount = watch('amount');

  const loadData = async () => {
    setLoading(true);
    try {
      const [walletData, txData, plansData] = await Promise.all([
        financeService.getWallet(),
        financeService.getTransactions({ limit: 10 }),
        financeService.getRechargePlans()
      ]);
      setWallet(walletData);
      setTransactions(txData.data);
      setPlans(plansData);
    } catch (error) {
      toast.error('加载财务数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecharge = async (values: RechargeFormValues) => {
    if (!voucher) {
      toast.error('请上传转账截图');
      return;
    }
    try {
      const res = await financeService.createRechargeOrder(Number(values.amount), values.paymentMethod);
      toast.success(`订单创建成功: ${res.orderNo}`);
      // In real scenario, redirect to payment gateway
      window.open(res.payUrl, '_blank');
      setRechargeModalVisible(false);
      reset();
      setVoucher(null);
      setVoucherName('');
    } catch (error) {
      toast.error('创建充值订单失败');
    }
  };

  const handleVoucherFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('仅支持图片格式');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setVoucher(reader.result as string);
      setVoucherName(file.name);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">资金管理</h1>
        <Button onClick={() => setRechargeModalVisible(true)}>账户充值</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <Statistic
              title="可用余额"
              value={wallet?.balance || 0}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#16a34a' }} // green-600
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Statistic
              title="冻结金额"
              value={wallet?.frozenAmount || 0}
              precision={2}
              prefix="¥"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Statistic
              title="累计充值"
              value={wallet?.totalRecharge || 0}
              precision={2}
              prefix="¥"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Statistic
              title="累计支出"
              value={wallet?.totalPayout || 0}
              precision={2}
              prefix="¥"
            />
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>时间</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>变动后余额</TableHead>
              <TableHead>描述</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{new Date(record.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  {(() => {
                    const colors: Record<string, 'default' | 'destructive' | 'secondary'> = { RECHARGE: 'default', PAYOUT: 'destructive', REFUND: 'secondary' }; // mapping to Badge variants or classes
                    const labels: Record<string, string> = { RECHARGE: '充值', PAYOUT: '支出', REFUND: '退款' };
                    const variant = colors[record.type] === 'default' ? 'default' : colors[record.type] === 'destructive' ? 'destructive' : 'secondary';
                    const className = record.type === 'RECHARGE' ? 'bg-green-100 text-green-800 hover:bg-green-100' : '';

                    return (
                      <Badge variant={variant} className={className}>
                        {labels[record.type] || record.type}
                      </Badge>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  <span className={record.type === 'RECHARGE' ? 'text-green-600' : 'text-red-600'}>
                    {record.type === 'RECHARGE' ? '+' : '-'}{record.amount}
                  </span>
                </TableCell>
                <TableCell>{record.balanceAfter}</TableCell>
                <TableCell>{record.description}</TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                  暂无交易记录
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        open={rechargeModalVisible}
        onOpenChange={setRechargeModalVisible}
        title="账户充值"
        footer={
          <>
            <Button variant="outline" onClick={() => setRechargeModalVisible(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit(handleRecharge)}>
              确定充值
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(handleRecharge)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">充值金额</label>
            {plans.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`cursor-pointer rounded-md border p-3 text-center transition-all hover:border-primary ${Number(currentAmount) === plan.amount
                      ? 'border-primary bg-primary/5 ring-1 ring-primary text-primary'
                      : 'border-gray-200'
                      }`}
                    onClick={() => setValue('amount', plan.amount)}
                  >
                    <div className="font-bold text-lg">¥{plan.amount}</div>
                    {plan.description && (
                      <div className="text-[10px] text-muted-foreground truncate">{plan.description}</div>
                    )}
                    {plan.bonus > 0 && (
                      <div className="text-xs text-green-600 font-medium">送 ¥{plan.bonus}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Input
              type="number"
              {...register('amount', { required: true, min: 0.01 })}
              placeholder="请输入充值金额"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">支付方式</label>
            <Select {...register('paymentMethod')}>
              <option value="ALIPAY">支付宝</option>
              <option value="WECHAT">微信支付</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">转账截图</label>
            <div className="flex items-center justify-between rounded-lg border border-dashed px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UploadCloud className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium">上传转账凭证</div>
                  <div className="text-xs text-muted-foreground">支持 JPG/PNG，必填</div>
                </div>
              </div>
              <label className="cursor-pointer rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                {voucherName || '选择文件'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleVoucherFiles(event.target.files)}
                />
              </label>
            </div>
            {voucher && (
              <div className="flex items-center gap-3">
                <Image
                  src={voucher}
                  alt="转账截图"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setVoucher(null);
                    setVoucherName('');
                  }}
                >
                  重新上传
                </Button>
              </div>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}

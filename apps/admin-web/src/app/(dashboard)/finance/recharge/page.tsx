'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { financeService, RechargePlan, RechargeRecord } from '@/services/financeService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { CreditCard, Wallet, CheckCircle, Clock, XCircle, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';

type RechargeRecordWithVoucher = RechargeRecord & { voucher?: string };

export default function RechargePage() {
  const [plans, setPlans] = useState<RechargePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<RechargeRecordWithVoucher[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'ALIPAY' | 'WECHAT'>('ALIPAY');
  const [voucher, setVoucher] = useState<string | null>(null);
  const [voucherName, setVoucherName] = useState('');
  const [voucherDragging, setVoucherDragging] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const plansData = await financeService.getRechargePlans();
    setPlans(plansData);
    setRecords([
      { id: '1', orderNo: 'RC20230101001', amount: 500, bonus: 50, status: 'SUCCESS', paymentMethod: 'ALIPAY', createdAt: '2023-01-01 12:00' },
      { id: '2', orderNo: 'RC20230102002', amount: 100, bonus: 0, status: 'PENDING', paymentMethod: 'WECHAT', createdAt: '2023-01-02 14:30' },
    ]);
  };

  const readFileAsDataUrl = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsDataURL(file);
    });
  };

  const handleVoucherFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('仅支持图片格式');
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setVoucher(dataUrl);
    setVoucherName(file.name);
  };

  const selectedAmount = useMemo(() => {
    if (selectedPlan) {
      const plan = plans.find((item) => item.id === selectedPlan);
      return plan?.amount ?? 0;
    }
    return Number(customAmount || 0);
  }, [selectedPlan, plans, customAmount]);

  const handleRecharge = async () => {
    if (!selectedPlan && !customAmount) {
      toast.error('请选择充值套餐或输入金额');
      return;
    }
    if (!voucher) {
      toast.error('请上传转账截图');
      return;
    }

    try {
      setLoading(true);
      const amount = selectedAmount;
      await new Promise(resolve => setTimeout(resolve, 1500));
      const orderNo = `RC${Date.now()}`;
      setRecords((prev) => [
        {
          id: orderNo,
          orderNo,
          amount,
          bonus: selectedPlan ? plans.find((item) => item.id === selectedPlan)?.bonus ?? 0 : 0,
          status: 'PENDING',
          paymentMethod,
          createdAt: new Date().toLocaleString(),
          voucher,
        },
        ...prev,
      ]);
      toast.success('充值订单创建成功，等待财务确认');
      setSelectedPlan(null);
      setCustomAmount('');
      setVoucher(null);
      setVoucherName('');
    } catch (error) {
      toast.error('创建充值订单失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">账户充值</h2>
        <p className="text-muted-foreground mt-2">选择充值方案或自定义金额，实时到账</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>充值套餐</CardTitle>
              <CardDescription>选择推荐套餐，享受更多优惠</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {plans.map((plan) => (
                  <button
                    type="button"
                    key={plan.id}
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      setCustomAmount('');
                    }}
                    className={cn(
                      "group relative flex flex-col items-center justify-center rounded-lg px-3 py-3 transition-all duration-200 focus:outline-none",
                      selectedPlan === plan.id
                        ? "border-2 border-primary bg-primary/10 text-primary"
                        : "border border-border bg-card hover:border-primary/50 hover:bg-primary/5"
                    )}
                  >
                    {plan.tag && (
                      <span className={cn(
                        "absolute -right-1 -top-2 rounded-full px-2 py-0.5 text-[10px] font-bold",
                        selectedPlan === plan.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-destructive text-destructive-foreground"
                      )}>
                        {plan.tag}
                      </span>
                    )}
                    <span className={cn(
                      "text-lg font-bold tracking-tight",
                      selectedPlan === plan.id ? "text-primary" : "text-foreground"
                    )}>
                      ¥{plan.amount}
                    </span>
                    {plan.bonus > 0 && (
                      <span className={cn(
                        "text-xs font-medium mt-0.5",
                        selectedPlan === plan.id ? "text-primary/80" : "text-success"
                      )}>
                        +¥{plan.bonus}
                      </span>
                    )}
                    {selectedPlan === plan.id && (
                      <div className="absolute bottom-1 right-1">
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-5">
                <label className="text-xs font-medium text-secondary-600 mb-1.5 block">自定义金额</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">¥</span>
                  <Input
                    type="number"
                    placeholder="输入金额"
                    className="pl-7 h-9 text-sm"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedPlan(null);
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <label className="text-xs font-medium text-muted-foreground">支付方式</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-all duration-200',
                      paymentMethod === 'ALIPAY'
                        ? 'border-2 border-primary bg-primary/10 text-primary'
                        : 'border border-border bg-card hover:border-primary/50 hover:bg-primary/5'
                    )}
                    onClick={() => setPaymentMethod('ALIPAY')}
                  >
                    <CreditCard className={cn(
                      "h-4 w-4",
                      paymentMethod === 'ALIPAY' ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div>
                      <div className="text-xs font-semibold">支付宝</div>
                      <div className="text-[10px] text-muted-foreground">实时到账</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-all duration-200',
                      paymentMethod === 'WECHAT'
                        ? 'border-2 border-primary bg-primary/10 text-primary'
                        : 'border border-border bg-card hover:border-primary/50 hover:bg-primary/5'
                    )}
                    onClick={() => setPaymentMethod('WECHAT')}
                  >
                    <Wallet className={cn(
                      "h-4 w-4",
                      paymentMethod === 'WECHAT' ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div>
                      <div className="text-xs font-semibold">微信转账</div>
                      <div className="text-[10px] text-muted-foreground">财务核验</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <label className="text-xs font-medium text-secondary-600">转账截图</label>
                <div
                  className={cn(
                    'flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-3 py-4 text-center transition-all',
                    voucherDragging ? 'border-primary-500 bg-primary-50' : 'border-secondary-200 hover:border-primary-300'
                  )}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setVoucherDragging(true);
                  }}
                  onDragLeave={() => setVoucherDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setVoucherDragging(false);
                    handleVoucherFiles(event.dataTransfer.files);
                  }}
                >
                  {voucher ? (
                    <div className="flex w-full items-center gap-3">
                      <Image src={voucher} alt="转账截图" className="h-14 w-14 rounded-md object-cover" />
                      <div className="flex flex-1 flex-col items-start gap-1">
                        <div className="text-xs font-medium text-secondary-700 truncate max-w-[120px]">{voucherName}</div>
                        <div className="text-[10px] text-secondary-400">已上传</div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-[10px] px-2"
                          onClick={() => {
                            setVoucher(null);
                            setVoucherName('');
                          }}
                        >
                          重新上传
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center rounded-full bg-primary-50 p-2 text-primary-600">
                        <UploadCloud className="h-4 w-4" />
                      </div>
                      <div className="text-xs font-medium text-secondary-600">拖拽或点击上传</div>
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-[10px] font-medium text-secondary-600 hover:bg-secondary-50">
                        <ImageIcon className="h-3 w-3" />
                        选择截图
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => handleVoucherFiles(event.target.files)}
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <Button
                  className="w-full h-10 text-sm font-semibold"
                  onClick={handleRecharge}
                  disabled={loading}
                >
                  {loading ? '处理中...' : '立即充值'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>转账信息</CardTitle>
              <CardDescription>按当前选定渠道完成转账后上传凭证</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-secondary-100 bg-secondary-50 px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-secondary-700">收款账户</div>
                  <div className="text-xs text-muted-foreground">One Recycle 运营账户</div>
                </div>
                <Badge variant="secondary">对公</Badge>
              </div>
              <div className="grid gap-3 text-sm text-secondary-600">
                <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <span>转账金额</span>
                  <span className="font-semibold text-foreground">¥{selectedAmount || '--'}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <span>充值方式</span>
                  <span className="font-semibold text-foreground">{paymentMethod === 'ALIPAY' ? '支付宝' : '微信转账'}</span>
                </div>
              </div>
              <div className="rounded-lg border border-dashed px-4 py-3 text-xs text-muted-foreground">
                充值订单提交后将进入财务审核，确认到账后自动入账。
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>充值记录</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单号</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>凭证</TableHead>
                    <TableHead>时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium text-xs">{record.orderNo}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>¥{record.amount}</span>
                          {(record.bonus ?? 0) > 0 && <span className="text-xs text-success-600">+¥{record.bonus}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.status === 'SUCCESS' && <Badge className="bg-success hover:bg-success-600"><CheckCircle className="w-3 h-3 mr-1" />成功</Badge>}
                        {record.status === 'PENDING' && <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />待付</Badge>}
                        {record.status === 'FAILED' && <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />失败</Badge>}
                      </TableCell>
                      <TableCell>
                        {record.voucher ? (
                          <Image src={record.voucher} alt="凭证" className="h-8 w-8 rounded object-cover" />
                        ) : (
                          <span className="text-xs text-secondary-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{record.createdAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

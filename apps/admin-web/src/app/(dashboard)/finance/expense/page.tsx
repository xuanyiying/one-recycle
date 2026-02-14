'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import {
  expenseService,
  ExpenseRecord,
  ExpenseStats,
  ExpenseQueryParams,
  ExpenseStatus,
} from '@/services/expenseService';
import {
  Search,
  RotateCw,
  Download,
  TrendingDown,
  Package,
  Truck,
  CalendarRange,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

type ExpenseType = 'all' | 'recycle_payment' | 'express_fee';

export default function ExpensePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const type = searchParams.get('type') || 'all';
  const status = searchParams.get('status') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const search = searchParams.get('search') || '';

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [data, setData] = useState<{ items: ExpenseRecord[]; total: number } | null>(null);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 500);
  const [startDateInput, setStartDateInput] = useState(startDate);
  const [endDateInput, setEndDateInput] = useState(endDate);

  const updateUrl = useCallback(
    (newParams: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 'all') {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    setStartDateInput(startDate);
    setEndDateInput(endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    if (debouncedSearch !== search) {
      updateUrl({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, search, updateUrl]);

  useEffect(() => {
    if (startDateInput !== startDate) {
      updateUrl({ startDate: startDateInput, page: 1 });
    }
  }, [startDateInput, startDate, updateUrl]);

  useEffect(() => {
    if (endDateInput !== endDate) {
      updateUrl({ endDate: endDateInput, page: 1 });
    }
  }, [endDateInput, endDate, updateUrl]);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params: ExpenseQueryParams = {
        page,
        limit,
        type: type !== 'all' ? (type as 'recycle_payment' | 'express_fee') : undefined,
        status: status ? (status as ExpenseStatus) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        orderNo: search || undefined,
      };
      const response = await expenseService.getExpenses(params);
      setData(response);
    } catch (error) {
      console.error(error);
      toast.error('获取支出列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, limit, type, status, startDate, endDate, search]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await expenseService.getExpenseStats({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setStats(response);
    } catch (error) {
      console.error(error);
    } finally {
      setStatsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, [fetchExpenses, fetchStats]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrl({ type: e.target.value, page: 1 });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrl({ status: e.target.value, page: 1 });
  };

  const handleExport = async () => {
    try {
      const blob = await expenseService.exportExpenses({
        type: type !== 'all' ? (type as 'recycle_payment' | 'express_fee') : undefined,
        status: status ? (status as ExpenseStatus) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('导出成功');
    } catch (error) {
      console.error(error);
      toast.error('导出失败');
    }
  };

  const getStatusBadge = (status: ExpenseStatus) => {
    switch (status) {
      case ExpenseStatus.COMPLETED:
        return <Badge variant="success">已完成</Badge>;
      case ExpenseStatus.PENDING:
        return <Badge variant="warning">待处理</Badge>;
      case ExpenseStatus.FAILED:
        return <Badge variant="destructive">失败</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'recycle_payment':
        return <Badge variant="info">回收支付</Badge>;
      case 'express_fee':
        return <Badge variant="secondary">快递费用</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">支出管理</h1>
          <p className="text-sm text-muted-foreground">
            管理回收物品支付和快递费用支出
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          导出数据
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-2" />
                <Skeleton className="h-3 w-[120px]" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总支出</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {formatAmount(stats?.totalExpense || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  本月: {formatAmount(stats?.monthExpense || 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">回收支付</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatAmount(stats?.recyclePaymentTotal || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  向用户支付回收物品费用
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">快递费用</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatAmount(stats?.expressFeeTotal || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  物流快递支出
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">今日支出</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatAmount(stats?.todayExpense || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  待处理: {stats?.pendingCount || 0} 笔
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {stats?.trendData && stats.trendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              支出趋势
            </CardTitle>
            <CardDescription>近30天支出数据趋势</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => value.slice(5)}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip
                    formatter={(value) => formatAmount(Number(value))}
                    labelFormatter={(label) => `日期: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="recyclePayment"
                    name="回收支付"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="expressFee"
                    name="快递费用"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>分类支出统计</CardTitle>
            <CardDescription>按物品分类的支出分布</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryBreakdown.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoryName" style={{ fontSize: '12px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip formatter={(value) => formatAmount(Number(value))} />
                  <Bar dataKey="amount" name="支出金额" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索订单号..."
                  className="pl-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Select value={type} onChange={handleTypeChange} className="w-full lg:w-[140px]">
                <option value="all">全部类型</option>
                <option value="recycle_payment">回收支付</option>
                <option value="express_fee">快递费用</option>
              </Select>
              <Select value={status} onChange={handleStatusChange} className="w-full lg:w-[140px]">
                <option value="">全部状态</option>
                <option value="COMPLETED">已完成</option>
                <option value="PENDING">待处理</option>
                <option value="FAILED">失败</option>
              </Select>
              <div className="relative w-full lg:w-[160px]">
                <CalendarRange className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-9"
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                />
              </div>
              <div className="relative w-full lg:w-[160px]">
                <CalendarRange className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-9"
                  value={endDateInput}
                  onChange={(e) => setEndDateInput(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  fetchExpenses();
                  fetchStats();
                }}
                title="刷新"
              >
                <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>订单号</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>收款方/快递公司</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>描述</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[60px] rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[60px] rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[140px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data?.items?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    暂无支出数据
                  </TableCell>
                </TableRow>
              ) : (
                data?.items?.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {expense.orderNo || '-'}
                    </TableCell>
                    <TableCell>{getTypeBadge(expense.type)}</TableCell>
                    <TableCell className="text-destructive font-medium">
                      {formatAmount(expense.amount)}
                    </TableCell>
                    <TableCell>
                      {expense.type === 'recycle_payment' ? (
                        <div className="flex flex-col">
                          <span>{expense.userName || `用户#${expense.userId}`}</span>
                          {expense.userPhone && (
                            <span className="text-xs text-muted-foreground">
                              {expense.userPhone}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span>{expense.expressCompany || '-'}</span>
                          {expense.expressNo && (
                            <span className="text-xs text-muted-foreground">
                              {expense.expressNo}
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(expense.status)}</TableCell>
                    <TableCell>{formatDate(expense.createdAt)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {expense.description || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {data && (
            <div className="border-t px-4 py-4">
              <Pagination
                total={data.total}
                pageSize={limit}
                current={page}
                onChange={(p) => updateUrl({ page: p })}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

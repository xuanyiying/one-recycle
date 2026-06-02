'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils/cn';
import { dashboardApi, DashboardStats, InventoryAlert, RecentOrder } from '@/services/dashboardApi';
import { InventoryService } from '@/services/inventoryService';
import {
  AlertTriangle,
  BarChart3,
  Clock,
  DollarSign,
  Eye,
  LineChart,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

interface TrendData {
  date: string;
  orders: number;
  revenue: number;
  users: number;
}

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalUsers: 0,
    activeUsers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    orderGrowth: 0,
    revenueGrowth: 0,
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [trendPeriod, setTrendPeriod] = useState<'7d' | '30d'>('7d');
  const [error, setError] = useState<string | null>(null);
  const [trendError, setTrendError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const initialLoadDone = useRef(false);

  const fetchTrendData = useCallback(async (period: '7d' | '30d'): Promise<TrendData[]> => {
    const days = period === '7d' ? 7 : 30;
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await InventoryService.getInventoryValueTrend(days);
        if (Array.isArray(response) && response.length > 0) {
          return response.map((item: any) => ({
            date: item.date,
            orders: item.orderCount || 0,
            revenue: item.totalValue || 0,
            users: 0,
          }));
        }
        return [];
      } catch (error) {
        lastError = error as Error;
        const isLastAttempt = attempt === maxRetries;
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);

        console.error(
          `Failed to fetch trend data (attempt ${attempt}/${maxRetries}):`,
          error,
        );

        if (isLastAttempt) {
          const errorMessage =
            lastError?.message || '未知网络错误';
          setTrendError(
            `趋势数据加载失败 (${errorMessage})，请检查网络连接后重试`,
          );
          throw lastError;
        } else {
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }

    return [];
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.refreshDashboardData();
      setStats(data.stats);
      setRecentOrders(data.recentOrders);
      setInventoryAlerts(data.inventoryAlerts);
      try {
        setTrendError(null);
        const trend = await fetchTrendData(trendPeriod);
        setTrendData(trend);
      } catch (trendErr) {
        setTrendData([]);
      }
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setError(error.message || '加载数据失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  }, [fetchTrendData, trendPeriod]);

  const handleRetryTrend = useCallback(async () => {
    setRetrying(true);
    setTrendError(null);
    try {
      const trend = await fetchTrendData(trendPeriod);
      setTrendData(trend);
    } catch (err) {
      // 错误已在 fetchTrendData 中处理
    } finally {
      setRetrying(false);
    }
  }, [fetchTrendData, trendPeriod]);

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (initialLoadDone.current && !loading) {
      const updateTrendData = async () => {
        setTrendError(null);
        try {
          const trend = await fetchTrendData(trendPeriod);
          setTrendData(trend);
        } catch (err) {
          setTrendData([]);
        }
      };
      updateTrendData();
    }
  }, [trendPeriod, fetchTrendData, loading]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">待处理</Badge>;
      case 'PENDING_PICKUP':
      case 'PENDING_RECEIPT':
      case 'PENDING_INBOUND':
      case 'PENDING_SETTLEMENT':
        return <Badge className="bg-info hover:bg-info-600">待处理</Badge>;
      case 'PICKED_UP':
      case 'IN_TRANSIT':
      case 'INSPECTING':
        return <Badge className="bg-primary hover:bg-primary/90">处理中</Badge>;
      case 'INSPECTED':
      case 'INBOUNDED':
      case 'COMPLETED':
        return <Badge className="bg-success hover:bg-success-600">已完成</Badge>;
      case 'INSPECTION_EXCEPTION':
        return <Badge className="bg-destructive hover:bg-destructive/90">异常</Badge>;
      case 'MANUAL_PROCESSING':
        return <Badge variant="outline">人工处理</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">已取消</Badge>;
      case 'REFUNDED':
        return <Badge variant="destructive">已退款</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return `¥${value.toLocaleString()}`;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-medium">数据加载失败</h3>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={loadDashboardData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          重试
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">仪表板</h2>
        <Button onClick={loadDashboardData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          刷新数据
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
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
                <CardTitle className="text-sm font-medium">总订单数</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  {stats.orderGrowth >= 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-success" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
                  )}
                  <span className={stats.orderGrowth >= 0 ? 'text-success' : 'text-destructive'}>
                    {stats.orderGrowth >= 0 ? '+' : ''}{stats.orderGrowth}%
                  </span>
                  <span className="ml-1">较上月</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总收入</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  {stats.revenueGrowth >= 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-success" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
                  )}
                  <span className={stats.revenueGrowth >= 0 ? 'text-success' : 'text-destructive'}>
                    {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}%
                  </span>
                  <span className="ml-1">较上月</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  总用户: {stats.totalUsers}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">待处理订单</CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  需要立即处理
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <LineChart className="mr-2 h-5 w-5" />
              订单趋势
            </CardTitle>
            <div className="flex space-x-1">
              <Button
                variant={trendPeriod === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTrendPeriod('7d')}
              >
                近7天
              </Button>
              <Button
                variant={trendPeriod === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTrendPeriod('30d')}
              >
                近30天
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : trendError ? (
              <div
                className="h-[300px] flex flex-col items-center justify-center text-center p-6 border border-destructive/20 rounded-lg bg-destructive/5"
                role="alert"
                aria-live="polite"
              >
                <AlertTriangle className="h-12 w-12 text-destructive mb-3" />
                <p className="text-sm font-medium text-destructive mb-2">
                  趋势数据加载失败
                </p>
                <p className="text-xs text-muted-foreground mb-4 max-w-md">
                  {trendError}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryTrend}
                  disabled={retrying}
                  className="gap-2"
                >
                  <RefreshCw
                    className={cn(
                      'h-4 w-4',
                      retrying && 'animate-spin',
                    )}
                  />
                  {retrying ? '重试中...' : '重新加载'}
                </Button>
              </div>
            ) : trendData.length === 0 ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 border border-muted rounded-lg">
                <LineChart className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">
                  暂无趋势数据
                </p>
                <p className="text-xs text-muted-foreground">
                  {trendPeriod === '7d' ? '近7天' : '近30天'}暂无订单记录
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                    name="订单数"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              收入趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value) => typeof value === 'number' ? [`¥${value.toLocaleString()}`, '收入'] : ['', '']}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    name="收入"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>最近订单</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">订单号</TableHead>
                  <TableHead>客户</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[60px] rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-[60px] ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNo}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">¥{Number(order.amount ?? 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => window.location.href = `/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      暂无订单数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>库存预警</CardTitle>
          </CardHeader>
          <CardContent>
            {inventoryAlerts.length > 0 ? (
              <div className="space-y-4">
                {inventoryAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center space-x-3">
                      <div className={cn("flex h-9 w-9 items-center justify-center rounded-full",
                        alert.status === 'out' ? "bg-error/10 text-error" : "bg-warning/10 text-warning"
                      )}>
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{alert.categoryName}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          当前: {alert.currentStock} / 最低: {alert.minStock}
                        </p>
                      </div>
                    </div>
                    <Badge variant={alert.status === 'out' ? 'destructive' : 'secondary'} className={alert.status === 'out' ? '' : 'bg-warning text-white hover:bg-warning/90'}>
                      {alert.status === 'out' ? '缺货' : '不足'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <RefreshCw className="h-8 w-8 mb-2 opacity-20" />
                <p>库存状况良好</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;

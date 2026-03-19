'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { toast } from '@/components/ui/toast';
import { ArrowLeft, User, Coins, ShoppingCart, Users, Calendar } from 'lucide-react';
import {
  customerUserService,
  CustomerUserDetail,
  PointsRecord,
  CustomerOrder,
} from '@/services/customerUserService';

type TabType = 'orders' | 'points';

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerUserDetail | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('orders');

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [pointsRecords, setPointsRecords] = useState<PointsRecord[]>([]);
  const [pointsTotal, setPointsTotal] = useState(0);
  const [pointsPage, setPointsPage] = useState(1);
  const [pointsLoading, setPointsLoading] = useState(false);

  const fetchCustomer = useCallback(async () => {
    try {
      setLoading(true);
      const data = await customerUserService.getCustomerById(customerId);
      setCustomer(data);
    } catch (error) {
      console.error(error);
      toast.error('获取用户详情失败');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const fetchOrders = useCallback(async (page: number = 1) => {
    try {
      setOrdersLoading(true);
      const data = await customerUserService.getOrders(customerId, { page, limit: 10 });
      setOrders(data.items);
      setOrdersTotal(data.total);
      setOrdersPage(page);
    } catch (error) {
      console.error(error);
      toast.error('获取订单列表失败');
    } finally {
      setOrdersLoading(false);
    }
  }, [customerId]);

  const fetchPointsRecords = useCallback(async (page: number = 1) => {
    try {
      setPointsLoading(true);
      const data = await customerUserService.getPointsRecords(customerId, { page, limit: 10 });
      setPointsRecords(data.items);
      setPointsTotal(data.total);
      setPointsPage(page);
    } catch (error) {
      console.error(error);
      toast.error('获取积分记录失败');
    } finally {
      setPointsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomer();
    fetchOrders(1);
    fetchPointsRecords(1);
  }, [fetchCustomer, fetchOrders, fetchPointsRecords]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      SUSPENDED: 'bg-red-100 text-red-800',
      DELETED: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      ACTIVE: '正常',
      SUSPENDED: '禁用',
      DELETED: '已删除',
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getOrderStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: '待处理', className: 'bg-yellow-100 text-yellow-800' },
      PENDING_PICKUP: { label: '待取件', className: 'bg-blue-100 text-blue-800' },
      PICKED_UP: { label: '已取件', className: 'bg-indigo-100 text-indigo-800' },
      IN_TRANSIT: { label: '运输中', className: 'bg-purple-100 text-purple-800' },
      PENDING_RECEIPT: { label: '待收货', className: 'bg-cyan-100 text-cyan-800' },
      INSPECTING: { label: '验货中', className: 'bg-orange-100 text-orange-800' },
      INSPECTED: { label: '已验货', className: 'bg-teal-100 text-teal-800' },
      PENDING_INBOUND: { label: '待入库', className: 'bg-lime-100 text-lime-800' },
      INBOUNDED: { label: '已入库', className: 'bg-emerald-100 text-emerald-800' },
      PENDING_SETTLEMENT: { label: '待结算', className: 'bg-amber-100 text-amber-800' },
      COMPLETED: { label: '已完成', className: 'bg-green-100 text-green-800' },
      CANCELLED: { label: '已取消', className: 'bg-gray-100 text-gray-800' },
      REFUNDED: { label: '已退款', className: 'bg-red-100 text-red-800' },
    };
    const info = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${info.className}`}>
        {info.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-[200px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-[80px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[100px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <p className="text-muted-foreground">用户不存在</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          返回
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">用户详情</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">用户信息</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={customer.avatarUrl || undefined} />
                <AvatarFallback>
                  {customer.nickname?.charAt(0) || customer.mobile?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{customer.nickname || '-'}</p>
                <p className="text-sm text-muted-foreground">{customer.mobile || '-'}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              {getStatusBadge(customer.status)}
              {customer.realName && <span className="text-sm text-muted-foreground">姓名: {customer.realName}</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">积分</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.points}</div>
            <p className="text-xs text-muted-foreground">可用积分</p>
            <p className="text-sm mt-1">余额: ¥{customer.balance.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">订单统计</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.orderStats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">总订单数</p>
            <p className="text-sm mt-1">
              已完成: {customer.orderStats?.completedOrders || 0} | 金额: ¥{(customer.orderStats?.totalAmount || 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">邀请关系</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {customer.inviteStats ? (
              <>
                <div className="text-2xl font-bold">{customer.inviteStats.invitedCount}</div>
                <p className="text-xs text-muted-foreground">已邀请用户数</p>
                <p className="text-sm mt-1">
                  邀请奖励: {customer.inviteStats.totalRewardPoints}积分 | 订单返佣: {customer.inviteStats.totalOrderRewards}积分
                </p>
              </>
            ) : customer.inviterInfo ? (
              <div>
                <p className="text-sm">邀请人</p>
                <p className="font-medium">{customer.inviterInfo.nickname || customer.inviterInfo.mobile}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">无邀请关系</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex space-x-4 border-b">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              订单记录
            </button>
            <button
              onClick={() => setActiveTab('points')}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === 'points'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              积分记录
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {activeTab === 'orders' ? (
            <div>
              <div className="border-b px-4 py-3 bg-muted/50">
                <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground">
                  <div>订单号</div>
                  <div>状态</div>
                  <div>结算金额</div>
                  <div>商品数量</div>
                  <div>创建时间</div>
                  <div>完成时间</div>
                </div>
              </div>
              {ordersLoading ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="grid grid-cols-6 gap-4">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-5 w-[60px]" />
                      <Skeleton className="h-4 w-[80px]" />
                      <Skeleton className="h-4 w-[40px]" />
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  暂无订单记录
                </div>
              ) : (
                <div>
                  {orders.map((order) => (
                    <div key={order.id} className="grid grid-cols-6 gap-4 px-4 py-3 border-b hover:bg-muted/50">
                      <div className="font-mono text-sm">{order.orderNo}</div>
                      <div>{getOrderStatusBadge(order.status)}</div>
                      <div>¥{order.settlementAmount.toFixed(2)}</div>
                      <div>{order.itemCount}</div>
                      <div className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="text-sm">{order.completedAt ? new Date(order.completedAt).toLocaleDateString() : '-'}</div>
                    </div>
                  ))}
                  <div className="p-4">
                    <Pagination
                      total={ordersTotal}
                      pageSize={10}
                      current={ordersPage}
                      onChange={(p) => fetchOrders(p)}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="border-b px-4 py-3 bg-muted/50">
                <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground">
                  <div>类型</div>
                  <div>积分变动</div>
                  <div>变动后余额</div>
                  <div>来源</div>
                  <div>描述</div>
                  <div>时间</div>
                </div>
              </div>
              {pointsLoading ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="grid grid-cols-6 gap-4">
                      <Skeleton className="h-4 w-[60px]" />
                      <Skeleton className="h-4 w-[80px]" />
                      <Skeleton className="h-4 w-[60px]" />
                      <Skeleton className="h-4 w-[60px]" />
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  ))}
                </div>
              ) : pointsRecords.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  暂无积分记录
                </div>
              ) : (
                <div>
                  {pointsRecords.map((record) => (
                    <div key={record.id} className="grid grid-cols-6 gap-4 px-4 py-3 border-b hover:bg-muted/50 items-center">
                      <div className="text-sm">{record.type}</div>
                      <div className={record.points >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {record.points >= 0 ? '+' : ''}{record.points}
                      </div>
                      <div>{record.balanceAfter}</div>
                      <div className="text-sm">{record.sourceType || '-'}</div>
                      <div className="text-sm truncate" title={record.description}>{record.description}</div>
                      <div className="text-sm">{new Date(record.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                  <div className="p-4">
                    <Pagination
                      total={pointsTotal}
                      pageSize={10}
                      current={pointsPage}
                      onChange={(p) => fetchPointsRecords(p)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Statistic } from '@/components/ui/statistic';
import { Table } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { pointsStatsApi, pointsOrderApi, PointsOrder } from '@/services/pointsService';

export default function PointsOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<PointsOrder[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, ordersData] = await Promise.all([
          pointsStatsApi.getStats(),
          pointsOrderApi.getOrders({ limit: 10 }),
        ]);
        setStats(statsData);
        setRecentOrders(ordersData.data || []);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总商品数</p>
              <Statistic value={stats?.totalProducts || 0} />
              <p className="text-xs text-gray-400 mt-2">
                上架商品：{stats?.activeProducts || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总订单数</p>
              <Statistic value={stats?.totalOrders || 0} />
              <p className="text-xs text-gray-400 mt-2">
                待发货：{stats?.pendingOrders || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">今日订单</p>
              <Statistic value={stats?.todayOrders || 0} />
              <p className="text-xs text-gray-400 mt-2">
                今日发放积分：{stats?.todayPointsIssued || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">热门商品</p>
              <Statistic value={stats?.topProducts?.length || 0} suffix="个" />
              <p className="text-xs text-gray-400 mt-2">
                按兑换量排名
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 最近订单 */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">最近订单</h2>
          <Table>
            <thead>
              <tr>
                <th>订单号</th>
                <th>商品名称</th>
                <th>用户</th>
                <th>积分</th>
                <th>数量</th>
                <th>状态</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id.toString()}>
                  <td className="font-medium">{order.orderNo}</td>
                  <td>{order.productName}</td>
                  <td>{order.user?.nickname || '-'}</td>
                  <td>{order.points}</td>
                  <td>{order.quantity}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'PENDING' && '待处理'}
                      {order.status === 'SHIPPED' && '已发货'}
                      {order.status === 'COMPLETED' && '已完成'}
                      {order.status === 'CANCELLED' && '已取消'}
                    </span>
                  </td>
                  <td className="text-gray-500">
                    {new Date(order.createdAt).toLocaleString('zh-CN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* 热门商品 */}
      {stats?.topProducts && stats.topProducts.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">热门商品 TOP 5</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {stats.topProducts.map((product, index) => (
                <div key={product.id.toString()} className="text-center">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                    {product.coverImage ? (
                      <img
                        src={product.coverImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        无图片
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">
                    兑换 {product.soldCount} 次
                  </p>
                  <p className="text-xs text-red-500 font-medium">
                    {product.points} 积分
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

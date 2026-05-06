'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { pointsOrderApi, PointsOrder } from '@/services/pointsService';
import ShipOrderModal from './components/ShipOrderModal';

export default function PointsOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<PointsOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [status, setStatus] = useState<'ALL' | 'PENDING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [shipModalOpen, setShipModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<PointsOrder | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (status !== 'ALL') params.status = status;

      const response = await pointsOrderApi.getOrders(params);
      setOrders(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleShip = (order: PointsOrder) => {
    setCurrentOrder(order);
    setShipModalOpen(true);
  };

  const handleSubmitShip = async (data: { logisticsNo: string; logisticsCompany: string }) => {
    if (!currentOrder) return;

    try {
      await pointsOrderApi.shipOrder(Number(currentOrder.id), data);
      setShipModalOpen(false);
      await fetchOrders();
      alert('发货成功');
    } catch (error) {
      console.error('Failed to ship:', error);
      alert('发货失败，请重试');
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '待处理';
      case 'SHIPPED': return '已发货';
      case 'COMPLETED': return '已完成';
      case 'CANCELLED': return '已取消';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SHIPPED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 头部操作栏 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">订单管理</h2>
        </div>

        {/* 筛选器 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="ALL">全部状态</option>
            <option value="PENDING">待处理</option>
            <option value="SHIPPED">已发货</option>
            <option value="COMPLETED">已完成</option>
            <option value="CANCELLED">已取消</option>
          </Select>
        </div>
      </Card>

      {/* 订单列表 */}
      <Card>
        <Table>
          <thead>
            <tr>
              <th>订单号</th>
              <th>商品名称</th>
              <th>用户</th>
              <th>积分</th>
              <th>数量</th>
              <th>状态</th>
              <th>物流信息</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-8">
                  <Skeleton className="h-8 w-full" />
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500">
                  暂无订单
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id.toString()}>
                  <td className="font-medium">{order.orderNo}</td>
                  <td>{order.productName}</td>
                  <td>
                    <div>
                      <p className="font-medium">{order.user?.nickname || '-'}</p>
                      <p className="text-xs text-gray-500">{order.user?.mobile || ''}</p>
                    </div>
                  </td>
                  <td className="text-red-500 font-medium">{order.points}</td>
                  <td>{order.quantity}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusClass(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td>
                    {order.logisticsNo ? (
                      <div className="text-xs">
                        <p>{order.logisticsCompany}</p>
                        <p className="text-gray-500">{order.logisticsNo}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="text-gray-500 text-sm">
                    {new Date(order.createdAt).toLocaleString('zh-CN')}
                  </td>
                  <td>
                    {order.status === 'PENDING' && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleShip(order)}
                      >
                        发货
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* 分页 */}
        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-gray-500">
            共 {total} 条，第 {page} 页 / 共 {Math.ceil(total / limit)} 页
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      </Card>

      {/* 发货弹窗 */}
      <ShipOrderModal
        open={shipModalOpen}
        onOpenChange={setShipModalOpen}
        onSubmit={handleSubmitShip}
      />
    </div>
  );
}

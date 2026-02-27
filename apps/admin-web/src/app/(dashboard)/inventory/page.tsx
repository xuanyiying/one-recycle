'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import {
  InventoryService,
  InventoryItem,
  InventoryStats,
  InventoryStatus,
  InventoryAlert,
  InventoryAdjustment,
  InventoryAdjustmentRequest,
} from '@/services/inventoryService';
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Download,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Edit,
  History,
  Box,
  DollarSign,
  BarChart3,
} from 'lucide-react';

const InventoryStatusConfig = {
  [InventoryStatus.AVAILABLE]: { label: '正常', color: 'bg-green-100 text-green-800' },
  [InventoryStatus.LOW_STOCK]: { label: '库存不足', color: 'bg-yellow-100 text-yellow-800' },
  [InventoryStatus.OUT_OF_STOCK]: { label: '缺货', color: 'bg-red-100 text-red-800' },
  [InventoryStatus.RESERVED]: { label: '已预留', color: 'bg-blue-100 text-blue-800' },
};

export default function InventoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || '';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [searchInput, setSearchInput] = useState(search);

  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustForm, setAdjustForm] = useState<InventoryAdjustmentRequest>({
    type: 'IN',
    quantity: 0,
    reason: '',
  });

  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await InventoryService.getInventoryStats();
      setStats(response);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await InventoryService.getInventoryAlerts();
      setAlerts(response);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await InventoryService.getInventoryItems({
        page,
        pageSize,
        categoryName: search || undefined,
        status: statusFilter ? (statusFilter as InventoryStatus) : undefined,
      });
      setItems(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error(error);
      toast.error('获取库存列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => {
    fetchStats();
    fetchAlerts();
  }, [fetchStats, fetchAlerts]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const updateUrl = (newParams: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleExport = async () => {
    try {
      const blob = await InventoryService.exportInventory({
        categoryName: search || undefined,
        status: statusFilter ? (statusFilter as InventoryStatus) : undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('导出成功');
    } catch (error) {
      console.error(error);
      toast.error('导出失败');
    }
  };

  const handleAdjust = (item: InventoryItem) => {
    setAdjustingItem(item);
    setAdjustForm({ type: 'IN', quantity: 0, reason: '' });
    setAdjustModalVisible(true);
  };

  const handleAdjustSubmit = async () => {
    if (!adjustingItem) return;
    if (adjustForm.quantity === 0) {
      toast.error('请输入调整数量');
      return;
    }
    if (!adjustForm.reason.trim()) {
      toast.error('请输入调整原因');
      return;
    }
    try {
      setAdjustLoading(true);
      await InventoryService.adjustInventory(adjustingItem.id, adjustForm);
      toast.success('库存调整成功');
      setAdjustModalVisible(false);
      fetchItems();
      fetchStats();
      fetchAlerts();
    } catch (error) {
      console.error(error);
      toast.error('库存调整失败');
    } finally {
      setAdjustLoading(false);
    }
  };

  const handleViewHistory = async (item: InventoryItem) => {
    setHistoryItem(item);
    setHistoryModalVisible(true);
    try {
      setHistoryLoading(true);
      const response = await InventoryService.getInventoryAdjustments(item.id);
      setAdjustments(response);
    } catch (error) {
      console.error(error);
      toast.error('获取调整记录失败');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleMarkAlertRead = async (alertId: string) => {
    try {
      await InventoryService.markAlertAsRead(alertId);
      fetchAlerts();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">库存管理</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">库存品类</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                分类数: {stats.categoriesCount ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">库存总值</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{(stats.totalValue ?? 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                平均价: ¥{(stats.averagePrice ?? 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">库存不足</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStockItems ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                缺货: {stats.outOfStockItems ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">可用库存</CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.availableItems ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                预留: {stats.reservedItems ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {alerts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center text-yellow-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              库存预警 ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-2 bg-white rounded border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${alert.alertType === 'OUT_OF_STOCK' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{alert.categoryName}</p>
                      <p className="text-xs text-muted-foreground">
                        当前: {alert.currentQuantity} / 阈值: {alert.threshold}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={alert.alertType === 'OUT_OF_STOCK' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                      {alert.alertType === 'OUT_OF_STOCK' ? '缺货' : alert.alertType === 'LOW_STOCK' ? '库存不足' : '超储'}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleMarkAlertRead(alert.id)}>
                      忽略
                    </Button>
                  </div>
                </div>
              ))}
              {alerts.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  还有 {alerts.length - 5} 条预警...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索分类名称..."
                  className="pl-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateUrl({ search: searchInput, page: 1 });
                    }
                  }}
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => updateUrl({ status: e.target.value, page: 1 })}
                className="w-[130px]"
              >
                <option value="">所有状态</option>
                {Object.entries(InventoryStatusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={() => { fetchItems(); fetchStats(); fetchAlerts(); }} title="刷新">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">分类名称</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">数量</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">单位</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">当前价格</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">阈值范围</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">状态</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">库位</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">更新时间</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-4"><Skeleton className="h-4 w-[120px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[60px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[40px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[80px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[100px]" /></td>
                      <td className="p-4"><Skeleton className="h-5 w-[60px] rounded-full" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[80px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[120px]" /></td>
                      <td className="p-4"><Skeleton className="h-8 w-[100px] ml-auto" /></td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="h-24 text-center text-muted-foreground">
                      暂无库存数据
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const statusConfig = InventoryStatusConfig[item.status] || { label: item.status, color: 'bg-gray-100 text-gray-800' };
                    const isLowStock = item.quantity <= item.minThreshold;
                    const isOverStock = item.maxThreshold > 0 && item.quantity >= item.maxThreshold;
                    const currentPrice = item.currentPrice ?? 0;
                    return (
                      <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{item.categoryName}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className={isLowStock ? 'text-red-600 font-medium' : ''}>{item.quantity}</span>
                            {isLowStock && <TrendingDown className="h-4 w-4 text-red-500" />}
                            {isOverStock && <TrendingUp className="h-4 w-4 text-yellow-500" />}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{item.unit}</td>
                        <td className="p-4">¥{currentPrice.toFixed(2)}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {item.minThreshold} - {item.maxThreshold || '∞'}
                        </td>
                        <td className="p-4">
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm">{item.location || '-'}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(item.updatedAt).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => handleAdjust(item)} title="调整库存">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleViewHistory(item)} title="调整记录">
                              <History className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {total > 0 && (
            <div className="border-t px-4 py-4">
              <Pagination
                total={total}
                pageSize={pageSize}
                current={page}
                onChange={(p: number) => updateUrl({ page: p })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={adjustModalVisible}
        onOpenChange={(open) => !open && setAdjustModalVisible(false)}
        title="库存调整"
        width={450}
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setAdjustModalVisible(false)}>取消</Button>
            <Button onClick={handleAdjustSubmit} disabled={adjustLoading}>
              {adjustLoading ? '处理中...' : '确认调整'}
            </Button>
          </div>
        }
      >
        {adjustingItem && (
          <div className="space-y-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">{adjustingItem.categoryName}</span>
                <span className="text-muted-foreground">当前数量: {adjustingItem.quantity} {adjustingItem.unit}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">调整类型</label>
              <Select
                value={adjustForm.type}
                onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value as 'IN' | 'OUT' | 'ADJUSTMENT' })}
              >
                <option value="IN">入库</option>
                <option value="OUT">出库</option>
                <option value="ADJUSTMENT">盘点调整</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">数量 *</label>
              <Input
                type="number"
                value={adjustForm.quantity}
                onChange={(e) => setAdjustForm({ ...adjustForm, quantity: Number(e.target.value) })}
                placeholder="请输入调整数量"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {adjustForm.type === 'IN' && '正数表示入库数量'}
                {adjustForm.type === 'OUT' && '正数表示出库数量'}
                {adjustForm.type === 'ADJUSTMENT' && '正数表示增加，负数表示减少'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">调整原因 *</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                placeholder="请输入调整原因"
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={historyModalVisible}
        onOpenChange={(open) => !open && setHistoryModalVisible(false)}
        title="调整记录"
        width={700}
        footer={
          <Button onClick={() => setHistoryModalVisible(false)}>关闭</Button>
        }
      >
        {historyItem && (
          <div className="space-y-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <span className="font-medium">{historyItem.categoryName}</span>
              <span className="text-muted-foreground ml-4">当前数量: {historyItem.quantity} {historyItem.unit}</span>
            </div>
            {historyLoading ? (
              <div className="text-center py-8 text-muted-foreground">加载中...</div>
            ) : adjustments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">暂无调整记录</div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {adjustments.map((adj) => (
                  <div key={adj.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${adj.type === 'IN' ? 'bg-green-100 text-green-600' :
                        adj.type === 'OUT' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                        {adj.type === 'IN' ? <TrendingUp className="h-4 w-4" /> :
                          adj.type === 'OUT' ? <TrendingDown className="h-4 w-4" /> :
                            <Minus className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {adj.type === 'IN' ? '入库' : adj.type === 'OUT' ? '出库' : '盘点调整'}
                          <span className={adj.type === 'IN' ? 'text-green-600 ml-2' : adj.type === 'OUT' ? 'text-red-600 ml-2' : 'text-blue-600 ml-2'}>
                            {adj.type === 'OUT' ? '-' : '+'}{adj.quantity}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">{adj.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{adj.operatorName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(adj.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

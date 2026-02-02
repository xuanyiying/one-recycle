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
import {
  orderService,
  OrderListResponse,
  OrderStatus,
  OrderQueryParams,
  Order,
  UpdateOrderRequest,
} from '@/services/orderService';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  RotateCw,
  Eye,
  Trash2,
  SlidersHorizontal,
  Columns,
  List,
  ScanLine,
  Truck,
  PackageCheck,
  CalendarRange,
  User,
  Camera,
} from 'lucide-react';
import OrderModal from './components/OrderModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils/cn';
import { orderStatusLabels, orderStatusSequence } from '@/lib/orderStateMachine';
import NextImage from 'next/image';

type PanelKey = 'list' | 'inspection' | 'receiving' | 'inbound';

export default function OrdersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const userFilterFromUrl = searchParams.get('user') || '';

  const [activePanel, setActivePanel] = useState<PanelKey>('list');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OrderListResponse | null>(null);
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 500);
  const [density, setDensity] = useState<'default' | 'compact'>('default');
  const [startDateInput, setStartDateInput] = useState(startDate);
  const [endDateInput, setEndDateInput] = useState(endDate);
  const [userInput, setUserInput] = useState(userFilterFromUrl);
  const debouncedUser = useDebounce(userInput, 500);
  const [inspectionImages, setInspectionImages] = useState<string[]>([]);
  const [inspectionResult, setInspectionResult] = useState<'PASS' | 'EXCEPTION'>('PASS');
  const [inspectionReasons, setInspectionReasons] = useState<string[]>([]);
  const [inspectionNote, setInspectionNote] = useState('');
  const [inspectionOrder, setInspectionOrder] = useState('');
  const [receivingOrder, setReceivingOrder] = useState('');
  const [receivingPerson, setReceivingPerson] = useState('');
  const [receivingTime, setReceivingTime] = useState('');
  const [receivingProof, setReceivingProof] = useState<string | null>(null);
  const [inboundNo, setInboundNo] = useState('');
  const [inboundItems, setInboundItems] = useState([
    { id: 'row-1', sku: '', quantity: '', location: '' },
  ]);

  const [visibleColumns, setVisibleColumns] = useState({
    orderNumber: true,
    customerInfo: true,
    amount: true,
    status: true,
    createdAt: true,
    actions: true,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const updateUrl = useCallback(
    (newParams: any) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newParams.page) params.set('page', newParams.page.toString());
      if (newParams.limit) params.set('limit', newParams.limit.toString());

      if (newParams.search !== undefined) {
        if (newParams.search) params.set('search', newParams.search);
        else params.delete('search');
      }

      if (newParams.status !== undefined) {
        if (newParams.status) params.set('status', newParams.status);
        else params.delete('status');
      }

      if (newParams.startDate !== undefined) {
        if (newParams.startDate) params.set('startDate', newParams.startDate);
        else params.delete('startDate');
      }

      if (newParams.endDate !== undefined) {
        if (newParams.endDate) params.set('endDate', newParams.endDate);
        else params.delete('endDate');
      }

      if (newParams.user !== undefined) {
        if (newParams.user) params.set('user', newParams.user);
        else params.delete('user');
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    setUserInput(userFilterFromUrl);
  }, [userFilterFromUrl]);

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
    if (debouncedUser !== userFilterFromUrl) {
      updateUrl({ user: debouncedUser, page: 1 });
    }
  }, [debouncedUser, userFilterFromUrl, updateUrl]);

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

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const isOrderNumber = /^\d+$/.test(search) || search.startsWith('ORD');
      const customerFromSearch = !isOrderNumber && search ? search : undefined;
      const params: OrderQueryParams = {
        page,
        pageSize: limit,
        orderNumber: isOrderNumber ? search : undefined,
        customerName: userFilterFromUrl || customerFromSearch,
        status: (status as OrderStatus) || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
      const response = await orderService.getOrders(params);
      setData(response);
    } catch (error) {
      console.error(error);
      toast.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, startDate, endDate, userFilterFromUrl]);

  useEffect(() => {
    if (activePanel === 'list') {
      fetchOrders();
    }
  }, [fetchOrders, activePanel]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrl({ status: e.target.value as OrderStatus, page: 1 });
  };

  const getStatusBadgeVariant = (value: OrderStatus) => {
    switch (value) {
      case OrderStatus.PENDING:
      case OrderStatus.PICKUP_PENDING:
      case OrderStatus.INSPECTING:
      case OrderStatus.SETTLEMENT_PENDING:
        return 'warning';
      case OrderStatus.ASSIGNED:
      case OrderStatus.RECEIVING_PENDING:
      case OrderStatus.INBOUND_PENDING:
        return 'info';
      case OrderStatus.PICKED_UP:
      case OrderStatus.IN_TRANSIT:
        return 'default';
      case OrderStatus.INSPECTION_EXCEPTION:
        return 'destructive';
      case OrderStatus.MANUAL_REVIEW:
      case OrderStatus.CANCELLED:
        return 'secondary';
      case OrderStatus.INSPECTED:
      case OrderStatus.INBOUND_COMPLETED:
      case OrderStatus.COMPLETED:
        return 'success';
      case OrderStatus.REFUNDED:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该订单吗？此操作不可恢复。')) return;

    try {
      await orderService.deleteOrder(id);
      toast.success('删除成功');
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error('删除失败');
    }
  };

  const handleModalOk = async (id: string, values: UpdateOrderRequest) => {
    try {
      setModalLoading(true);
      await orderService.updateOrder(id, values);
      toast.success('更新成功');
      setModalVisible(false);
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error('更新失败');
    } finally {
      setModalLoading(false);
    }
  };

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      img.onload = () => {
        const maxSize = 1280;
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas不可用'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#000';
        ctx.fillRect(canvas.width - 160, canvas.height - 44, 150, 34);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.font = '16px sans-serif';
        ctx.fillText('ONE RECYCLE', canvas.width - 150, canvas.height - 20);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
        resolve(dataUrl);
      };
      img.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleInspectionFiles = async (files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - inspectionImages.length;
    if (remaining <= 0) return;
    const selected = Array.from(files).slice(0, remaining);
    try {
      const compressed = await Promise.all(selected.map((file) => compressImage(file)));
      setInspectionImages((prev) => [...prev, ...compressed]);
    } catch (error) {
      toast.error('图片处理失败');
    }
  };

  const handleReceivingProof = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const image = await compressImage(files[0]);
      setReceivingProof(image);
    } catch (error) {
      toast.error('签收图片处理失败');
    }
  };

  const removeInspectionImage = (index: number) => {
    setInspectionImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleInspectionReason = (reason: string) => {
    setInspectionReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const addInboundRow = () => {
    setInboundItems((prev) => [
      ...prev,
      { id: `row-${Date.now()}`, sku: '', quantity: '', location: '' },
    ]);
  };

  const removeInboundRow = (id: string) => {
    setInboundItems((prev) => prev.filter((row) => row.id !== id));
  };

  const updateInboundRow = (id: string, key: 'sku' | 'quantity' | 'location', value: string) => {
    setInboundItems((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const submitInspection = () => {
    if (!inspectionOrder) {
      toast.error('请录入订单号');
      return;
    }
    if (inspectionImages.length === 0) {
      toast.error('请上传验货图片');
      return;
    }
    toast.success('验货结果已提交');
  };

  const submitReceiving = () => {
    if (!receivingOrder || !receivingPerson || !receivingTime) {
      toast.error('请完整填写收货信息');
      return;
    }
    if (!receivingProof) {
      toast.error('请上传签收图片');
      return;
    }
    toast.success('收货信息已提交');
  };

  const submitInbound = () => {
    if (!inboundNo) {
      toast.error('请生成入库单号');
      return;
    }
    toast.success('入库单已提交');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">订单管理</h1>
          <p className="text-sm text-muted-foreground">覆盖接单、验货、收货、入库与结算全流程</p>
        </div>
        <div className="inline-flex items-center rounded-xl border bg-background p-1">
          <Button
            variant={activePanel === 'list' ? 'default' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => setActivePanel('list')}
          >
            <List className="h-4 w-4" />
            订单列表
          </Button>
          <Button
            variant={activePanel === 'inspection' ? 'default' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => setActivePanel('inspection')}
          >
            <ScanLine className="h-4 w-4" />
            验货中心
          </Button>
          <Button
            variant={activePanel === 'receiving' ? 'default' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => setActivePanel('receiving')}
          >
            <Truck className="h-4 w-4" />
            收货确认
          </Button>
          <Button
            variant={activePanel === 'inbound' ? 'default' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => setActivePanel('inbound')}
          >
            <PackageCheck className="h-4 w-4" />
            入库操作
          </Button>
        </div>
      </div>

      {activePanel === 'list' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>状态流转</CardTitle>
              <CardDescription>订单状态机完整闭环，支持异常分支与人工处理</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                {orderStatusSequence.map((step) => (
                  <div
                    key={step}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                      status === step
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted bg-muted/30 text-muted-foreground'
                    )}
                  >
                    {orderStatusLabels[step]}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索订单号/客户姓名..."
                      className="pl-9"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                  <Select value={status} onChange={handleStatusChange} className="w-full lg:w-[160px]">
                    <option value="">所有状态</option>
                    {Object.values(OrderStatus).map((s) => (
                      <option key={s} value={s}>
                        {orderStatusLabels[s] || s}
                      </option>
                    ))}
                  </Select>
                  <div className="relative w-full lg:w-[180px]">
                    <CalendarRange className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      className="pl-9"
                      value={startDateInput}
                      onChange={(e) => setStartDateInput(e.target.value)}
                    />
                  </div>
                  <div className="relative w-full lg:w-[180px]">
                    <CalendarRange className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      className="pl-9"
                      value={endDateInput}
                      onChange={(e) => setEndDateInput(e.target.value)}
                    />
                  </div>
                  <div className="relative w-full lg:w-[200px]">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="用户姓名/手机号"
                      className="pl-9"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <DropdownMenu
                    trigger={
                      <Button variant="outline" size="sm" className="hidden h-8 lg:flex">
                        <Columns className="mr-2 h-4 w-4" />
                        列展示
                      </Button>
                    }
                    align="end"
                  >
                    <DropdownMenuLabel>切换列</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.orderNumber}
                      onCheckedChange={() => toggleColumn('orderNumber')}
                    >
                      订单号
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.customerInfo}
                      onCheckedChange={() => toggleColumn('customerInfo')}
                    >
                      客户信息
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.amount}
                      onCheckedChange={() => toggleColumn('amount')}
                    >
                      金额
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.status}
                      onCheckedChange={() => toggleColumn('status')}
                    >
                      状态
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.createdAt}
                      onCheckedChange={() => toggleColumn('createdAt')}
                    >
                      创建时间
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.actions}
                      onCheckedChange={() => toggleColumn('actions')}
                    >
                      操作
                    </DropdownMenuCheckboxItem>
                  </DropdownMenu>

                  <DropdownMenu
                    trigger={
                      <Button variant="outline" size="sm" className="hidden h-8 lg:flex">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        视图
                      </Button>
                    }
                    align="end"
                  >
                    <DropdownMenuItem onClick={() => setDensity('default')}>
                      默认密度
                      {density === 'default' && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDensity('compact')}>
                      紧凑模式
                      {density === 'compact' && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                  </DropdownMenu>

                  <Button variant="outline" size="icon" onClick={() => fetchOrders()} title="刷新">
                    <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    {visibleColumns.orderNumber && <TableHead>订单号</TableHead>}
                    {visibleColumns.customerInfo && <TableHead>客户信息</TableHead>}
                    {visibleColumns.amount && <TableHead>金额</TableHead>}
                    {visibleColumns.status && <TableHead>状态</TableHead>}
                    {visibleColumns.createdAt && <TableHead>创建时间</TableHead>}
                    {visibleColumns.actions && <TableHead className="text-right">操作</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index} className={density === 'compact' ? 'h-10' : 'h-16'}>
                        {visibleColumns.orderNumber && (
                          <TableCell>
                            <Skeleton className="h-4 w-[120px]" />
                          </TableCell>
                        )}
                        {visibleColumns.customerInfo && (
                          <TableCell>
                            <Skeleton className="h-10 w-[150px]" />
                          </TableCell>
                        )}
                        {visibleColumns.amount && (
                          <TableCell>
                            <Skeleton className="h-4 w-[80px]" />
                          </TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell>
                            <Skeleton className="h-5 w-[60px] rounded-full" />
                          </TableCell>
                        )}
                        {visibleColumns.createdAt && (
                          <TableCell>
                            <Skeleton className="h-4 w-[140px]" />
                          </TableCell>
                        )}
                        {visibleColumns.actions && (
                          <TableCell className="text-right">
                            <Skeleton className="ml-auto h-8 w-[100px]" />
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : data?.orders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={Object.values(visibleColumns).filter(Boolean).length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        暂无订单数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.orders.map((order) => (
                      <TableRow key={order.id} className={density === 'compact' ? 'py-1' : ''}>
                        {visibleColumns.orderNumber && (
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        )}
                        {visibleColumns.customerInfo && (
                          <TableCell>
                            <div className="flex flex-col text-sm">
                              <span>{order.customerName}</span>
                              <span className="text-muted-foreground text-xs">{order.customerPhone}</span>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.amount && <TableCell>¥{order.totalAmount}</TableCell>}
                        {visibleColumns.status && (
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              {orderStatusLabels[order.status] || order.status}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.createdAt && (
                          <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                        )}
                        {visibleColumns.actions && (
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="查看/编辑"
                                onClick={() => handleEdit(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="删除"
                                onClick={() => handleDelete(order.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
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
                    current={data.page}
                    onChange={(p) => updateUrl({ page: p })}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activePanel === 'inspection' && (
        <Card>
          <CardHeader>
            <CardTitle>验货流程</CardTitle>
            <CardDescription>扫码录入订单号，完成图片上传与验货结果登记</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-medium">订单号</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="扫码或手动输入订单号"
                    value={inspectionOrder}
                    onChange={(e) => setInspectionOrder(e.target.value)}
                  />
                  <Button variant="outline" className="gap-2">
                    <ScanLine className="h-4 w-4" />
                    扫码
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium">验货结果</label>
                <div className="flex gap-2">
                  <Button
                    variant={inspectionResult === 'PASS' ? 'default' : 'outline'}
                    onClick={() => setInspectionResult('PASS')}
                  >
                    合格
                  </Button>
                  <Button
                    variant={inspectionResult === 'EXCEPTION' ? 'destructive' : 'outline'}
                    onClick={() => setInspectionResult('EXCEPTION')}
                  >
                    异常
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">验货图片（最多5张）</label>
              <div className="flex flex-wrap gap-3">
                {inspectionImages.map((img, index) => (
                  <div key={`${img}-${index}`} className="relative">
                    <NextImage
                      src={img}
                      alt="验货图片"
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      className="absolute -right-2 -top-2 rounded-full bg-destructive px-2 text-xs text-white"
                      onClick={() => removeInspectionImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {inspectionImages.length < 5 && (
                  <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
                    <Camera className="h-5 w-5" />
                    上传
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleInspectionFiles(e.target.files)}
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">图片自动压缩并打水印，单次最多5张</p>
            </div>

            {inspectionResult === 'EXCEPTION' && (
              <div className="space-y-3">
                <label className="text-sm font-medium">异常原因</label>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {['材质不符', '成色不达标', '重量异常', '缺失配件', '包装破损', '其他'].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm',
                        inspectionReasons.includes(reason)
                          ? 'border-destructive bg-destructive/10 text-destructive'
                          : 'border-muted text-muted-foreground'
                      )}
                      onClick={() => toggleInspectionReason(reason)}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <Input
                  placeholder="补充说明"
                  value={inspectionNote}
                  onChange={(e) => setInspectionNote(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={submitInspection}>提交验货</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activePanel === 'receiving' && (
        <Card>
          <CardHeader>
            <CardTitle>确认收货</CardTitle>
            <CardDescription>对接物流签收信息，支持手动补录</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">订单号</label>
                <Input
                  placeholder="输入订单号"
                  value={receivingOrder}
                  onChange={(e) => setReceivingOrder(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">收货人</label>
                <Input
                  placeholder="收货人姓名"
                  value={receivingPerson}
                  onChange={(e) => setReceivingPerson(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">收货时间</label>
                <Input
                  type="datetime-local"
                  value={receivingTime}
                  onChange={(e) => setReceivingTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">签收图片</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleReceivingProof(e.target.files)}
                />
              </div>
            </div>
            {receivingProof && (
              <NextImage
                src={receivingProof}
                alt="签收图片"
                width={128}
                height={128}
                className="h-32 w-32 rounded-lg object-cover"
              />
            )}
            <div className="flex justify-end">
              <Button onClick={submitReceiving}>提交收货确认</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activePanel === 'inbound' && (
        <Card>
          <CardHeader>
            <CardTitle>入库操作</CardTitle>
            <CardDescription>支持 PDA 扫码录入 SKU、数量与库位</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <Input
                placeholder="入库单号"
                value={inboundNo}
                onChange={(e) => setInboundNo(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={() => setInboundNo(`INB${Date.now()}`)}
              >
                生成入库单号
              </Button>
            </div>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>库位</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inboundItems.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Input
                          value={row.sku}
                          onChange={(e) => updateInboundRow(row.id, 'sku', e.target.value)}
                          placeholder="扫码或手动录入"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={row.quantity}
                          onChange={(e) => updateInboundRow(row.id, 'quantity', e.target.value)}
                          placeholder="数量"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.location}
                          onChange={(e) => updateInboundRow(row.id, 'location', e.target.value)}
                          placeholder="库位"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeInboundRow(row.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={addInboundRow}>新增行</Button>
              <Button onClick={submitInbound}>提交入库</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <OrderModal
        visible={modalVisible}
        order={editingOrder}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
        loading={modalLoading}
      />
    </div>
  );
}

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog, useConfirm } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils/cn';
import {
  CreateLogisticsProviderRequest,
  EXPRESS_COMPANIES,
  LogisticsProvider,
  logisticsService,
  UpdateLogisticsProviderRequest,
} from '@/services/logisticsService';
import {
  CheckCircle,
  Edit,
  Eye,
  EyeOff,
  Key,
  Link,
  Plus,
  RotateCw,
  Search,
  Trash2,
  Truck,
  XCircle,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface ProviderFormData {
  name: string;
  code: string;
  apiUrl: string;
  tenantId: string;
  appId: string;
  appSecret: string;
  isActive: boolean;
}

export default function LogisticsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<LogisticsProvider[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProvider, setEditingProvider] = useState<LogisticsProvider | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  const { confirm: showConfirm, dialogProps } = useConfirm();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProviderFormData>({
    defaultValues: {
      name: '',
      code: '',
      apiUrl: '',
      tenantId: '',
      appId: '',
      appSecret: '',
      isActive: true,
    },
  });

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await logisticsService.getProviders();
      setProviders(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error('获取快递公司列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (modalVisible && editingProvider) {
      reset({
        name: editingProvider.name,
        code: editingProvider.code,
        apiUrl: editingProvider.apiUrl || '',
        tenantId: editingProvider.tenantId || '',
        appId: editingProvider.appId || '',
        appSecret: '',
        isActive: editingProvider.isActive,
      });
    } else if (modalVisible) {
      reset({
        name: '',
        code: '',
        apiUrl: '',
        tenantId: '',
        appId: '',
        appSecret: '',
        isActive: true,
      });
    }
  }, [modalVisible, editingProvider, reset]);

  const handleCreate = () => {
    setEditingProvider(null);
    setModalVisible(true);
  };

  const handleEdit = (provider: LogisticsProvider) => {
    setEditingProvider(provider);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm('确定要删除这个快递公司配置吗？', {
      title: '确认操作',
      type: 'danger',
      confirmText: '确定',
    });
    if (!confirmed) return;
    try {
      await logisticsService.deleteProvider(id);
      fetchProviders();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (provider: LogisticsProvider) => {
    try {
      await logisticsService.toggleProviderStatus(provider.id, !provider.isActive);
      fetchProviders();
    } catch (error) {
      console.error(error);
    }
  };

  const handleTestConnection = async (id: number) => {
    try {
      setTestingId(id);
      const result = await logisticsService.testConnection(id);
      if (result.success) {
        toast.success('连接测试成功');
      } else {
        toast.error(result.message || '连接测试失败');
      }
    } catch (error) {
      toast.error('连接测试失败');
    } finally {
      setTestingId(null);
    }
  };

  const onSubmit = async (data: ProviderFormData) => {
    try {
      setModalLoading(true);
      if (editingProvider) {
        const updateData: UpdateLogisticsProviderRequest = {
          name: data.name,
          apiUrl: data.apiUrl || undefined,
          tenantId: data.tenantId || undefined,
          appId: data.appId || undefined,
          appSecret: data.appSecret || undefined,
          isActive: data.isActive,
        };
        await logisticsService.updateProvider(editingProvider.id, updateData);
      } else {
        const createData: CreateLogisticsProviderRequest = {
          name: data.name,
          code: data.code,
          apiUrl: data.apiUrl || undefined,
          tenantId: data.tenantId || undefined,
          appId: data.appId || undefined,
          appSecret: data.appSecret || undefined,
          isActive: data.isActive,
        };
        await logisticsService.createProvider(createData);
      }
      setModalVisible(false);
      fetchProviders();
    } catch (error) {
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      provider.code.toLowerCase().includes(searchInput.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && provider.isActive) ||
      (statusFilter === 'inactive' && !provider.isActive);
    return matchesSearch && matchesStatus;
  });

  const getExpressCompanyName = (code: string) => {
    return EXPRESS_COMPANIES.find((c) => c.code === code)?.name || code;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">快递接入管理</h1>
          <p className="text-sm text-muted-foreground">
            配置快递公司API接入，支持顺丰、京东等主流快递
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          添加快递公司
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已接入快递</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{providers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              已配置 {providers.filter((p) => p.isActive).length} 个启用
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">启用状态</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {providers.filter((p) => p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              正常运行的快递服务
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已禁用</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {providers.filter((p) => !p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              暂停使用的快递服务
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索快递公司..."
                  className="pl-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-[140px]"
              >
                <option value="all">全部状态</option>
                <option value="active">已启用</option>
                <option value="inactive">已禁用</option>
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={fetchProviders} title="刷新">
              <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>快递公司</TableHead>
                <TableHead>编码</TableHead>
                <TableHead>API地址</TableHead>
                <TableHead>App ID</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[60px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[60px] rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[140px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-[120px] ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredProviders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    暂无快递公司配置
                  </TableCell>
                </TableRow>
              ) : (
                filteredProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{provider.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[200px]">
                          {provider.apiUrl || '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Key className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{provider.appId || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={provider.isActive ? 'success' : 'secondary'}>
                        {provider.isActive ? '已启用' : '已禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(provider.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="测试连接"
                          onClick={() => handleTestConnection(provider.id)}
                          disabled={testingId === provider.id}
                        >
                          <Zap
                            className={cn(
                              'h-4 w-4',
                              testingId === provider.id && 'animate-pulse'
                            )}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title={provider.isActive ? '禁用' : '启用'}
                          onClick={() => handleToggleStatus(provider)}
                        >
                          {provider.isActive ? (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-success" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="编辑"
                          onClick={() => handleEdit(provider)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="删除"
                          onClick={() => handleDelete(provider.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        title={editingProvider ? '编辑快递公司' : '添加快递公司'}
        open={modalVisible}
        onOpenChange={(open) => !open && setModalVisible(false)}
        width={600}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalVisible(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={modalLoading}>
              {modalLoading ? '保存中...' : '保存'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">快递公司</label>
              <Select
                {...register('code', { required: '请选择快递公司' })}
                disabled={!!editingProvider}
                value={watch('code')}
                onChange={(e) => {
                  setValue('code', e.target.value);
                  const company = EXPRESS_COMPANIES.find((c) => c.code === e.target.value);
                  if (company) {
                    setValue('name', company.name);
                  }
                }}
              >
                <option value="">请选择快递公司</option>
                {EXPRESS_COMPANIES.map((company) => (
                  <option key={company.code} value={company.code}>
                    {company.name}
                  </option>
                ))}
              </Select>
              {errors.code && (
                <span className="text-xs text-destructive">{errors.code.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">公司名称</label>
              <Input
                {...register('name', { required: '请输入公司名称' })}
                placeholder="快递公司名称"
              />
              {errors.name && (
                <span className="text-xs text-destructive">{errors.name.message}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">API地址</label>
            <Input
              {...register('apiUrl')}
              placeholder="https://api.example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tenant ID</label>
              <Input
                {...register('tenantId')}
                placeholder="租户ID（如需要）"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">App ID</label>
              <Input
                {...register('appId')}
                placeholder="应用ID"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">App Secret</label>
            <div className="relative">
              <Input
                type={showSecret ? 'text' : 'password'}
                {...register('appSecret')}
                placeholder={editingProvider ? '留空表示不修改' : '应用密钥'}
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              启用此快递公司
            </label>
          </div>
        </form>
      </Modal>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

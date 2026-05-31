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
  CreatePaymentConfigRequest,
  PAYMENT_PROVIDERS,
  paymentConfigService,
  PaymentProviderConfig,
  UpdatePaymentConfigRequest,
} from '@/services/paymentConfigService';
import {
  CheckCircle,
  CreditCard,
  Edit,
  Eye,
  EyeOff,
  Key,
  Plus,
  RotateCw,
  Search,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface PaymentConfigFormData {
  code: string;
  name: string;
  provider: string;
  apiUrl: string;
  appId: string;
  appSecret: string;
  merchantId: string;
  privateKey: string;
  publicKey: string;
  certPath: string;
  keyPath: string;
  callbackUrl: string;
  isActive: boolean;
}

const PROVIDER_BADGE_MAP: Record<string, { label: string; variant: 'success' | 'default' | 'destructive' }> = {
  WECHAT: { label: '微信支付', variant: 'success' },
  ALIPAY: { label: '支付宝', variant: 'default' },
  UNIONPAY: { label: '银联支付', variant: 'destructive' },
};

export default function PaymentConfigSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<PaymentProviderConfig[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PaymentProviderConfig | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showPublicKey, setShowPublicKey] = useState(false);

  const { confirm: showConfirm, dialogProps } = useConfirm();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentConfigFormData>({
    defaultValues: {
      code: '',
      name: '',
      provider: '',
      apiUrl: '',
      appId: '',
      appSecret: '',
      merchantId: '',
      privateKey: '',
      publicKey: '',
      certPath: '',
      keyPath: '',
      callbackUrl: '',
      isActive: true,
    },
  });

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await paymentConfigService.getConfigs();
      setConfigs(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error('获取支付渠道列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  useEffect(() => {
    if (modalVisible && editingConfig) {
      reset({
        code: editingConfig.code,
        name: editingConfig.name,
        provider: editingConfig.provider,
        apiUrl: editingConfig.apiUrl || '',
        appId: editingConfig.appId || '',
        appSecret: '',
        merchantId: editingConfig.merchantId || '',
        privateKey: '',
        publicKey: '',
        certPath: editingConfig.certPath || '',
        keyPath: editingConfig.keyPath || '',
        callbackUrl: editingConfig.callbackUrl || '',
        isActive: editingConfig.isActive,
      });
    } else if (modalVisible) {
      reset({
        code: '',
        name: '',
        provider: '',
        apiUrl: '',
        appId: '',
        appSecret: '',
        merchantId: '',
        privateKey: '',
        publicKey: '',
        certPath: '',
        keyPath: '',
        callbackUrl: '',
        isActive: true,
      });
    }
  }, [modalVisible, editingConfig, reset]);

  const handleCreate = () => {
    setEditingConfig(null);
    setShowSecret(false);
    setShowPrivateKey(false);
    setShowPublicKey(false);
    setModalVisible(true);
  };

  const handleEdit = (config: PaymentProviderConfig) => {
    setEditingConfig(config);
    setShowSecret(false);
    setShowPrivateKey(false);
    setShowPublicKey(false);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm('确定要删除这个支付渠道配置吗？', {
      title: '确认操作',
      type: 'danger',
      confirmText: '确定',
    });
    if (!confirmed) return;
    try {
      await paymentConfigService.deleteConfig(id);
      fetchConfigs();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (config: PaymentProviderConfig) => {
    try {
      await paymentConfigService.toggleStatus(config.id, !config.isActive);
      fetchConfigs();
    } catch (error) {
      console.error(error);
    }
  };

  const handleTestConnection = async (id: number) => {
    try {
      setTestingId(id);
      const result = await paymentConfigService.testConnection(id);
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

  const onSubmit = async (data: PaymentConfigFormData) => {
    try {
      setModalLoading(true);
      if (editingConfig) {
        const updateData: UpdatePaymentConfigRequest = {
          name: data.name,
          provider: data.provider || undefined,
          apiUrl: data.apiUrl || undefined,
          appId: data.appId || undefined,
          appSecret: data.appSecret || undefined,
          merchantId: data.merchantId || undefined,
          privateKey: data.privateKey || undefined,
          publicKey: data.publicKey || undefined,
          certPath: data.certPath || undefined,
          keyPath: data.keyPath || undefined,
          callbackUrl: data.callbackUrl || undefined,
          isActive: data.isActive,
        };
        await paymentConfigService.updateConfig(editingConfig.id, updateData);
      } else {
        const createData: CreatePaymentConfigRequest = {
          name: data.name,
          code: data.code,
          provider: data.provider,
          apiUrl: data.apiUrl || undefined,
          appId: data.appId || undefined,
          appSecret: data.appSecret || undefined,
          merchantId: data.merchantId || undefined,
          privateKey: data.privateKey || undefined,
          publicKey: data.publicKey || undefined,
          certPath: data.certPath || undefined,
          keyPath: data.keyPath || undefined,
          callbackUrl: data.callbackUrl || undefined,
          isActive: data.isActive,
        };
        await paymentConfigService.createConfig(createData);
      }
      setModalVisible(false);
      fetchConfigs();
    } catch (error) {
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredConfigs = configs.filter((config) => {
    const matchesSearch =
      config.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      config.code.toLowerCase().includes(searchInput.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && config.isActive) ||
      (statusFilter === 'inactive' && !config.isActive);
    const matchesProvider =
      providerFilter === 'all' || config.provider === providerFilter;
    return matchesSearch && matchesStatus && matchesProvider;
  });

  const getProviderBadge = (provider: string) => {
    return PROVIDER_BADGE_MAP[provider] || { label: provider, variant: 'secondary' as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">支付渠道管理</h1>
          <p className="text-sm text-muted-foreground">
            配置微信支付、支付宝等支付渠道，支持动态启用/禁用
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          添加支付渠道
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已配置渠道</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{configs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              已配置 {configs.filter((c) => c.isActive).length} 个启用
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已启用</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {configs.filter((c) => c.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              正常运行的支付渠道
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
              {configs.filter((c) => !c.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              暂停使用的支付渠道
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
                  placeholder="搜索支付渠道..."
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
              <Select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="w-[140px]"
              >
                <option value="all">全部渠道</option>
                {PAYMENT_PROVIDERS.map((p) => (
                  <option key={p.code} value={p.provider}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={fetchConfigs} title="刷新">
              <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>渠道名称</TableHead>
                <TableHead>渠道编码</TableHead>
                <TableHead>支付类型</TableHead>
                <TableHead>App ID</TableHead>
                <TableHead>商户号</TableHead>
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
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[70px] rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
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
                      <Skeleton className="h-8 w-[160px] ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredConfigs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    暂无支付渠道配置
                  </TableCell>
                </TableRow>
              ) : (
                filteredConfigs.map((config) => {
                  const badge = getProviderBadge(config.provider);
                  return (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">{config.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{config.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Key className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{config.appId || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{config.merchantId || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.isActive ? 'success' : 'secondary'}>
                          {config.isActive ? '已启用' : '已禁用'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(config.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="测试连接"
                            onClick={() => handleTestConnection(config.id)}
                            disabled={testingId === config.id}
                          >
                            <Zap
                              className={cn(
                                'h-4 w-4',
                                testingId === config.id && 'animate-pulse'
                              )}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title={config.isActive ? '禁用' : '启用'}
                            onClick={() => handleToggleStatus(config)}
                          >
                            {config.isActive ? (
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
                            onClick={() => handleEdit(config)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="删除"
                            onClick={() => handleDelete(config.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        title={editingConfig ? '编辑支付渠道' : '添加支付渠道'}
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
              <label className="text-sm font-medium">支付渠道</label>
              <Select
                {...register('code', { required: '请选择支付渠道' })}
                disabled={!!editingConfig}
                value={watch('code')}
                onChange={(e) => {
                  setValue('code', e.target.value);
                  const provider = PAYMENT_PROVIDERS.find((p) => p.code === e.target.value);
                  if (provider) {
                    setValue('name', provider.name);
                    setValue('provider', provider.provider);
                  }
                }}
              >
                <option value="">请选择支付渠道</option>
                {PAYMENT_PROVIDERS.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </Select>
              {errors.code && (
                <span className="text-xs text-destructive">{errors.code.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">渠道名称</label>
              <Input
                {...register('name', { required: '请输入渠道名称' })}
                placeholder="支付渠道名称"
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
              <label className="text-sm font-medium">App ID</label>
              <Input
                {...register('appId')}
                placeholder="应用ID"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">App Secret</label>
              <div className="relative">
                <Input
                  type={showSecret ? 'text' : 'password'}
                  {...register('appSecret')}
                  placeholder={editingConfig ? '留空表示不修改' : '应用密钥'}
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">商户号</label>
            <Input
              {...register('merchantId')}
              placeholder="商户号"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">应用私钥</label>
              <div className="relative">
                <textarea
                  {...register('privateKey')}
                  rows={3}
                  placeholder={editingConfig ? '留空表示不修改' : '应用私钥'}
                  className={cn(
                    'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                    'placeholder:text-muted-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    'resize-none',
                    showPrivateKey ? '' : 'font-mono tracking-widest'
                  )}
                  style={showPrivateKey ? undefined : { WebkitTextSecurity: 'disc' } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="absolute right-3 top-2 text-muted-foreground hover:text-foreground"
                >
                  {showPrivateKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">应用公钥</label>
              <div className="relative">
                <textarea
                  {...register('publicKey')}
                  rows={3}
                  placeholder={editingConfig ? '留空表示不修改' : '应用公钥'}
                  className={cn(
                    'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                    'placeholder:text-muted-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    'resize-none',
                    showPublicKey ? '' : 'font-mono tracking-widest'
                  )}
                  style={showPublicKey ? undefined : { WebkitTextSecurity: 'disc' } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => setShowPublicKey(!showPublicKey)}
                  className="absolute right-3 top-2 text-muted-foreground hover:text-foreground"
                >
                  {showPublicKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">证书路径</label>
              <Input
                {...register('certPath')}
                placeholder="证书文件路径"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">密钥路径</label>
              <Input
                {...register('keyPath')}
                placeholder="密钥文件路径"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">回调地址</label>
            <Input
              {...register('callbackUrl')}
              placeholder="https://your-domain.com/callback"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              启用此支付渠道
            </label>
          </div>
        </form>
      </Modal>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

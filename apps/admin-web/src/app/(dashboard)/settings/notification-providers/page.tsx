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
  CreateNotificationProviderConfigRequest,
  NOTIFICATION_TYPES,
  NotificationProviderConfig,
  notificationProviderConfigService,
  UpdateNotificationProviderConfigRequest,
} from '@/services/notificationProviderConfigService';
import {
  Bell,
  CheckCircle,
  Edit,
  Eye,
  EyeOff,
  Globe,
  Key,
  Mail,
  MessageSquare,
  Plus,
  RotateCw,
  Search,
  Smartphone,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface ProviderFormData {
  name: string;
  type: string;
  provider: string;
  apiKey: string;
  apiSecret: string;
  endpoint: string;
  isActive: boolean;
}

const TYPE_BADGE_MAP: Record<string, { variant: 'default' | 'success' | 'secondary' | 'outline' | 'destructive'; className: string }> = {
  SMS: { variant: 'outline', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
  EMAIL: { variant: 'outline', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
  PUSH: { variant: 'outline', className: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
  WEBHOOK: { variant: 'outline', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
};

const TYPE_LABEL_MAP: Record<string, string> = {
  SMS: '短信',
  EMAIL: '邮件',
  PUSH: '推送',
  WEBHOOK: 'Webhook',
};

function maskApiKey(key?: string): string {
  if (!key) return '-';
  if (key.length <= 8) return '****';
  return key.slice(0, 4) + '****' + key.slice(-4);
}

export default function NotificationProvidersSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<NotificationProviderConfig[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<NotificationProviderConfig | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);

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
      type: '',
      provider: '',
      apiKey: '',
      apiSecret: '',
      endpoint: '',
      isActive: true,
    },
  });

  const watchType = watch('type');

  const availableProviders = NOTIFICATION_TYPES.find((t) => t.value === watchType)?.providers || [];

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await notificationProviderConfigService.getConfigs();
      setConfigs(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error('获取通知服务商列表失败');
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
        name: editingConfig.name,
        type: editingConfig.type,
        provider: editingConfig.provider,
        apiKey: '',
        apiSecret: '',
        endpoint: editingConfig.endpoint || '',
        isActive: editingConfig.isActive,
      });
    } else if (modalVisible) {
      reset({
        name: '',
        type: '',
        provider: '',
        apiKey: '',
        apiSecret: '',
        endpoint: '',
        isActive: true,
      });
    }
  }, [modalVisible, editingConfig, reset]);

  useEffect(() => {
    if (watchType) {
      const currentProvider = watch('provider');
      const providers = NOTIFICATION_TYPES.find((t) => t.value === watchType)?.providers || [];
      if (currentProvider && !providers.find((p) => p.value === currentProvider)) {
        setValue('provider', '');
        setValue('name', '');
      }
    }
  }, [watchType, setValue, watch]);

  const handleCreate = () => {
    setEditingConfig(null);
    setModalVisible(true);
  };

  const handleEdit = (config: NotificationProviderConfig) => {
    setEditingConfig(config);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm('确定要删除这个通知服务商配置吗？', {
      title: '确认操作',
      type: 'danger',
      confirmText: '确定',
    });
    if (!confirmed) return;
    try {
      await notificationProviderConfigService.deleteConfig(id);
      fetchConfigs();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (config: NotificationProviderConfig) => {
    try {
      await notificationProviderConfigService.toggleStatus(config.id, !config.isActive);
      fetchConfigs();
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (data: ProviderFormData) => {
    try {
      setModalLoading(true);
      if (editingConfig) {
        const updateData: UpdateNotificationProviderConfigRequest = {
          name: data.name,
          type: data.type,
          provider: data.provider,
          apiKey: data.apiKey || undefined,
          apiSecret: data.apiSecret || undefined,
          endpoint: data.endpoint || undefined,
          isActive: data.isActive,
        };
        await notificationProviderConfigService.updateConfig(editingConfig.id, updateData);
      } else {
        const createData: CreateNotificationProviderConfigRequest = {
          name: data.name,
          type: data.type,
          provider: data.provider,
          apiKey: data.apiKey || undefined,
          apiSecret: data.apiSecret || undefined,
          endpoint: data.endpoint || undefined,
          isActive: data.isActive,
        };
        await notificationProviderConfigService.createConfig(createData);
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
      config.provider.toLowerCase().includes(searchInput.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && config.isActive) ||
      (statusFilter === 'inactive' && !config.isActive);
    const matchesType =
      typeFilter === 'all' || config.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const smsCount = configs.filter((c) => c.type === 'SMS').length;
  const emailCount = configs.filter((c) => c.type === 'EMAIL').length;
  const pushCount = configs.filter((c) => c.type === 'PUSH').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">通知服务商管理</h1>
          <p className="text-sm text-muted-foreground">
            配置短信、邮件、推送等通知渠道，支持动态启用/禁用
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          添加通知服务商
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已配置服务商</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">短信渠道</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{smsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              SMS 通知渠道
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">邮件渠道</CardTitle>
            <Mail className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{emailCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              EMAIL 通知渠道
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">推送渠道</CardTitle>
            <Smartphone className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{pushCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              PUSH 通知渠道
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
                  placeholder="搜索服务商名称..."
                  className="pl-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="w-[140px]"
              >
                <option value="all">全部状态</option>
                <option value="active">已启用</option>
                <option value="inactive">已禁用</option>
              </Select>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-[140px]"
              >
                <option value="all">全部类型</option>
                {NOTIFICATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={fetchConfigs} title="刷新">
              <RotateCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>服务商名称</TableHead>
                <TableHead>通知类型</TableHead>
                <TableHead>服务商</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>端点地址</TableHead>
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
                      <Skeleton className="h-5 w-[60px] rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
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
              ) : filteredConfigs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    暂无通知服务商配置
                  </TableCell>
                </TableRow>
              ) : (
                filteredConfigs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="font-medium">{config.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={TYPE_BADGE_MAP[config.type]?.variant || 'outline'}
                        className={TYPE_BADGE_MAP[config.type]?.className}
                      >
                        {TYPE_LABEL_MAP[config.type] || config.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{config.provider}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Key className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{maskApiKey(config.apiKey)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[200px]">
                          {config.endpoint || '-'}
                        </span>
                      </div>
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        title={editingConfig ? '编辑通知服务商' : '添加通知服务商'}
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
              <label className="text-sm font-medium">通知类型</label>
              <Select
                value={watchType}
                disabled={!!editingConfig}
                onChange={(e) => {
                  setValue('type', e.target.value);
                  setValue('provider', '');
                  setValue('name', '');
                }}
              >
                <option value="">请选择通知类型</option>
                {NOTIFICATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
              {errors.type && (
                <span className="text-xs text-destructive">{errors.type.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">服务商</label>
              <Select
                {...register('provider', { required: '请选择服务商' })}
                disabled={!!editingConfig || !watchType}
                value={watch('provider')}
                onChange={(e) => {
                  setValue('provider', e.target.value);
                  const selectedProvider = availableProviders.find(
                    (p) => p.value === e.target.value
                  );
                  if (selectedProvider) {
                    setValue('name', selectedProvider.label);
                  }
                }}
              >
                <option value="">请选择服务商</option>
                {availableProviders.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
              {errors.provider && (
                <span className="text-xs text-destructive">{errors.provider.message}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">服务商名称</label>
            <Input
              {...register('name', { required: '请输入服务商名称' })}
              placeholder="通知服务商名称"
            />
            {errors.name && (
              <span className="text-xs text-destructive">{errors.name.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <div className="relative">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  {...register('apiKey')}
                  placeholder={editingConfig ? '留空表示不修改' : 'API Key'}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">API Secret</label>
              <div className="relative">
                <Input
                  type={showApiSecret ? 'text' : 'password'}
                  {...register('apiSecret')}
                  placeholder={editingConfig ? '留空表示不修改' : 'API Secret'}
                />
                <button
                  type="button"
                  onClick={() => setShowApiSecret(!showApiSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiSecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">API 端点</label>
            <Input
              {...register('endpoint')}
              placeholder="https://api.example.com"
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
              启用此通知服务商
            </label>
          </div>
        </form>
      </Modal>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

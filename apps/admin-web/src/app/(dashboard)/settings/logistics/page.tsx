'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { logisticsService, LogisticsProvider } from '@/services/logisticsService';
import { useForm } from 'react-hook-form';

interface LogisticsFormValues {
  name: string;
  code: string;
  apiUrl: string;
  apiKey: string;
  isActive: boolean;
}

export default function LogisticsSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LogisticsProvider[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<LogisticsFormValues>({
    defaultValues: {
      name: '',
      code: '',
      apiUrl: '',
      apiKey: '',
      isActive: true,
    }
  });

  const isActive = watch('isActive');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await logisticsService.getProviders();
      setData(res);
    } catch (error) {
      toast.error('加载物流服务商失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    reset({
      name: '',
      code: '',
      apiUrl: '',
      apiKey: '',
      isActive: true,
    });
    setModalVisible(true);
  };

  const handleEdit = (record: LogisticsProvider) => {
    setEditingId(record.id);
    reset({
      name: record.name,
      code: record.code,
      apiUrl: record.apiUrl,
      apiKey: record.apiKey || '', // Handle null
      isActive: record.isActive,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除该物流服务商吗？')) {
      try {
        await logisticsService.deleteProvider(id);
        toast.success('删除成功');
        loadData();
      } catch (error) {
        toast.error('删除失败');
      }
    }
  };

  const onSubmit = async (values: LogisticsFormValues) => {
    try {
      if (editingId) {
        await logisticsService.updateProvider(editingId, values);
        toast.success('更新成功');
      } else {
        await logisticsService.createProvider(values);
        toast.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      toast.error('保存失败');
    }
  };

  const handleStatusChange = async (checked: boolean, record: LogisticsProvider) => {
    try {
      await logisticsService.updateProvider(record.id, { isActive: checked });
      toast.success('状态更新成功');
      loadData();
    } catch (error) {
      toast.error('状态更新失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">物流设置</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> 添加服务商
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>名称</TableHead>
              <TableHead>编码</TableHead>
              <TableHead>API地址</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.id}</TableCell>
                <TableCell className="font-medium">{record.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {record.code}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={record.apiUrl}>
                  {record.apiUrl}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={record.isActive}
                    onCheckedChange={(checked) => handleStatusChange(checked, record)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(record)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(record.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        open={modalVisible}
        onOpenChange={setModalVisible}
        title={editingId ? '编辑物流服务商' : '添加物流服务商'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalVisible(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit(onSubmit)}>
              确定
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">名称</label>
            <Input {...register('name', { required: true })} placeholder="请输入服务商名称" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">编码</label>
            <Input {...register('code', { required: true })} placeholder="例如: SF, YTO" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">API地址</label>
            <Input {...register('apiUrl', { required: true })} placeholder="https://api.example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">API Key</label>
            <Input {...register('apiKey')} placeholder="API密钥 (选填)" />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">启用状态</label>
              <div className="text-xs text-gray-500">是否启用该物流服务商</div>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

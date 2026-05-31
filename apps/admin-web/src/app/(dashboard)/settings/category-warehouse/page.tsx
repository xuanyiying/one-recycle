'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/toast';
import { ConfirmDialog, useConfirm } from '@/components/ui/confirm-dialog';
import {
  categoryWarehouseService,
  CategoryWarehouseConfig,
  CreateCategoryWarehouseRequest,
} from '@/services/categoryWarehouseService';
import { categoryService, Category } from '@/services/categoryService';
import { warehouseService, Warehouse as WarehouseType } from '@/services/warehouseService';
import {
  Warehouse as WarehouseIcon,
  Plus,
  Trash2,
  Edit,
  MapPin,
  Package,
  RefreshCw,
} from 'lucide-react';

export default function CategoryWarehousePage() {
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<CategoryWarehouseConfig[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<CategoryWarehouseConfig | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { confirm: showConfirm, dialogProps } = useConfirm();

  const [formData, setFormData] = useState<CreateCategoryWarehouseRequest>({
    categoryId: 0,
    warehouseId: 0,
    isActive: true,
  });

  // 获取配置列表
  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoryWarehouseService.getConfigs();
      setConfigs(response);
    } catch (error) {
      console.error(error);
      toast.error('获取配置列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.getCategoryTree();
      // 扁平化分类树，只获取一级分类
      const flattenCategories = (cats: Category[]): Category[] => {
        const result: Category[] = [];
        cats.forEach((cat) => {
          result.push(cat);
          if (cat.children && cat.children.length > 0) {
            result.push(...flattenCategories(cat.children));
          }
        });
        return result;
      };
      setCategories(flattenCategories(response));
    } catch (error) {
      console.error(error);
      toast.error('获取分类列表失败');
    }
  }, []);

  // 获取仓库列表
  const fetchWarehouses = useCallback(async () => {
    try {
      const response = await warehouseService.getWarehouses();
      setWarehouses(response);
    } catch (error) {
      console.error(error);
      toast.error('获取仓库列表失败');
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
    fetchCategories();
    fetchWarehouses();
  }, [fetchConfigs, fetchCategories, fetchWarehouses]);

  // 打开创建弹窗
  const handleCreate = () => {
    setEditingConfig(null);
    setFormData({
      categoryId: 0,
      warehouseId: 0,
      isActive: true,
    });
    setModalVisible(true);
  };

  // 打开编辑弹窗
  const handleEdit = (config: CategoryWarehouseConfig) => {
    setEditingConfig(config);
    setFormData({
      categoryId: config.categoryId,
      warehouseId: config.warehouseId,
      isActive: config.isActive,
    });
    setModalVisible(true);
  };

  // 删除配置
  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm('确定要删除该配置吗？', {
      title: '确认操作',
      type: 'danger',
      confirmText: '确定',
    });
    if (!confirmed) return;
    try {
      await categoryWarehouseService.deleteConfig(id);
      toast.success('删除成功');
      fetchConfigs();
    } catch (error) {
      console.error(error);
      toast.error('删除失败');
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!formData.categoryId || !formData.warehouseId) {
      toast.error('请选择分类和仓库');
      return;
    }

    try {
      setSubmitLoading(true);
      if (editingConfig) {
        await categoryWarehouseService.updateConfig(editingConfig.id, {
          warehouseId: formData.warehouseId,
          isActive: formData.isActive,
        });
        toast.success('更新成功');
      } else {
        await categoryWarehouseService.createConfig(formData);
        toast.success('创建成功');
      }
      setModalVisible(false);
      fetchConfigs();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || '操作失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 获取未配置的分类
  const getUnconfiguredCategories = () => {
    const configuredCategoryIds = configs.map((c) => c.categoryId);
    return categories.filter((c) => !configuredCategoryIds.includes(c.id));
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">分类仓库配置</h1>
          <p className="text-gray-500 mt-1">配置不同商品分类对应的目标仓库</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchConfigs}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </Button>
          <Button
            onClick={handleCreate}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新建配置
          </Button>
        </div>
      </div>

      {/* 配置列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            配置列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : configs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无配置，请点击右上角新建配置
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">分类</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">仓库</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">仓库地址</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">状态</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((config) => (
                    <tr key={config.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{config.categoryName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <WarehouseIcon className="w-4 h-4 text-green-500" />
                          <span>{config.warehouseName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{config.warehouseAddress}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            config.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {config.isActive ? '启用' : '禁用'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(config)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            编辑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(config.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            删除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 说明卡片 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">功能说明</h3>
              <p className="text-sm text-blue-700 mt-1">
                配置分类与仓库的映射关系后，用户下单时会根据商品分类自动分配目标仓库地址。
                骑手取件后会将物品送至对应仓库。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 创建/编辑弹窗 */}
      <Modal
        open={modalVisible}
        onOpenChange={setModalVisible}
        title={editingConfig ? '编辑配置' : '新建配置'}
      >
        <div className="space-y-4">
          {/* 分类选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品分类 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: Number(e.target.value) })
              }
              disabled={!!editingConfig}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value={0}>请选择分类</option>
              {editingConfig
                ? categories
                    .filter((c) => c.id === editingConfig.categoryId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                : getUnconfiguredCategories().map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
            </select>
            {editingConfig && (
              <p className="text-xs text-gray-500 mt-1">编辑时不能修改分类</p>
            )}
          </div>

          {/* 仓库选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              目标仓库 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.warehouseId}
              onChange={(e) =>
                setFormData({ ...formData, warehouseId: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>请选择仓库</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} - {w.address}
                </option>
              ))}
            </select>
          </div>

          {/* 状态开关 */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              启用该配置
            </label>
          </div>

          {/* 按钮 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalVisible(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitLoading}>
              {submitLoading ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

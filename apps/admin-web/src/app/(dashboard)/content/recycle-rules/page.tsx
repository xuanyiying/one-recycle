'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { ConfirmDialog, useConfirm } from '@/components/ui/confirm-dialog';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { contentConfigService, RecycleRule, RecycleRuleCategoryMap, CreateRecycleRuleDto, UpdateRecycleRuleDto } from '@/services/contentConfigService';

export default function RecycleRulesPage() {
  const [rules, setRules] = useState<RecycleRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [editVisible, setEditVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<RecycleRule | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { confirm: showConfirm, dialogProps } = useConfirm();

  const [formData, setFormData] = useState<CreateRecycleRuleDto & { tagsInput?: string }>({
    category: 'SERVICE_TYPE',
    title: '',
    content: '',
    icon: '',
    sortOrder: 0,
    isActive: true,
    tagsInput: '',
  });

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contentConfigService.getRecycleRules({
        ...filters,
        page,
        pageSize,
      });
      setRules(Array.isArray(data.items) ? data.items : []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch recycle rules:', error);
      toast.error('获取回收规则列表失败');
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      category: 'SERVICE_TYPE',
      title: '',
      content: '',
      icon: '',
      sortOrder: 0,
      isActive: true,
      tagsInput: '',
    });
    setEditVisible(true);
  };

  const handleEdit = (record: RecycleRule) => {
    setEditingItem(record);
    setFormData({
      category: record.category,
      title: record.title,
      content: record.content,
      icon: record.icon || '',
      sortOrder: record.sortOrder,
      isActive: record.isActive,
      tagsInput: record.extra?.tags?.join(', ') || '',
    });
    setEditVisible(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm('确定要删除这条规则吗？', {
      title: '确认操作',
      type: 'danger',
      confirmText: '确定',
    });
    if (!confirmed) return;
    
    setDeletingId(id);
    try {
      await contentConfigService.deleteRecycleRule(id);
      toast.success('删除成功');
      fetchRules();
    } catch (error) {
      toast.error('删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast.error('请填写标题和内容');
      return;
    }

    const data: CreateRecycleRuleDto | UpdateRecycleRuleDto = {
      category: formData.category,
      title: formData.title,
      content: formData.content,
      icon: formData.icon || undefined,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive,
    };

    if (formData.tagsInput) {
      data.extra = {
        tags: formData.tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        tagType: formData.category === 'STANDARD' && formData.title.includes('可回收') ? 'success' : 'error',
      };
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        await contentConfigService.updateRecycleRule(editingItem.id, data);
        toast.success('更新成功');
      } else {
        await contentConfigService.createRecycleRule(data as CreateRecycleRuleDto);
        toast.success('添加成功');
      }
      setEditVisible(false);
      fetchRules();
    } catch (error) {
      toast.error('操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await contentConfigService.updateRecycleRule(id, { isActive: !isActive });
      toast.success('状态已更新');
      fetchRules();
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const getCategoryBadge = (category: string) => {
    const config = RecycleRuleCategoryMap[category] || { text: category, color: 'gray' };
    return <Badge className={`bg-${config.color}-100 text-${config.color}-800`}>{config.text}</Badge>;
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>回收规则管理</CardTitle>
          <div className="flex space-x-2">
            <Select
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">全部分类</option>
              {Object.entries(RecycleRuleCategoryMap).map(([key, value]) => (
                <option key={key} value={key}>{value.text}</option>
              ))}
            </Select>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" />
              添加规则
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">分类</th>
                    <th className="p-3 text-left text-sm font-medium">标题</th>
                    <th className="p-3 text-left text-sm font-medium">内容</th>
                    <th className="p-3 text-left text-sm font-medium">图标</th>
                    <th className="p-3 text-left text-sm font-medium">排序</th>
                    <th className="p-3 text-left text-sm font-medium">状态</th>
                    <th className="p-3 text-right text-sm font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    rules.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-muted/50">
                        <td className="p-3">{getCategoryBadge(item.category)}</td>
                        <td className="p-3 font-medium">{item.title}</td>
                        <td className="p-3 max-w-xs truncate">{item.content}</td>
                        <td className="p-3">{item.icon || '-'}</td>
                        <td className="p-3">{item.sortOrder}</td>
                        <td className="p-3">
                          <Badge variant={item.isActive ? 'default' : 'secondary'}>
                            {item.isActive ? '启用' : '禁用'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-end space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleToggleActive(item.id, item.isActive)}>
                              {item.isActive ? '禁用' : '启用'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId === item.id}
                            >
                              {deletingId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                共 {total} 条，第 {page} / {totalPages} 页
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={editVisible}
        onOpenChange={setEditVisible}
        title={editingItem ? '编辑规则' : '添加规则'}
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium">分类</label>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {Object.entries(RecycleRuleCategoryMap).map(([key, value]) => (
                <option key={key} value={key}>{value.text}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">标题</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="请输入标题"
            />
          </div>

          <div>
            <label className="text-sm font-medium">内容</label>
            <textarea
              className="w-full p-2 border rounded-md min-h-[100px]"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="请输入内容"
            />
          </div>

          <div>
            <label className="text-sm font-medium">图标</label>
            <Input
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="例如: book, shirt, device"
            />
          </div>

          <div>
            <label className="text-sm font-medium">标签（可选）</label>
            <Input
              value={formData.tagsInput}
              onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
              placeholder="多个标签用英文逗号分隔"
            />
            <p className="text-xs text-muted-foreground mt-1">例如: 干净衣物, 完整书籍</p>
          </div>

          <div>
            <label className="text-sm font-medium">排序</label>
            <Input
              type="number"
              min={0}
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
            />
            <p className="text-xs text-muted-foreground mt-1">数值越小越靠前</p>
          </div>

          <div>
            <label className="text-sm font-medium">是否启用</label>
            <Select
              value={formData.isActive ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
            >
              <option value="true">启用</option>
              <option value="false">禁用</option>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setEditVisible(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            保存
          </Button>
        </div>
      </Modal>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

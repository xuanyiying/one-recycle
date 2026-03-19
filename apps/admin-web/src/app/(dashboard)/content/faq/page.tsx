'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { contentConfigService, FAQ, FAQCategoryMap, CreateFAQDto, UpdateFAQDto } from '@/services/contentConfigService';

export default function FAQPage() {
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [editVisible, setEditVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQ | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateFAQDto>({
    question: '',
    answer: '',
    category: 'GENERAL',
    sortOrder: 0,
    isActive: true,
  });

  const fetchFAQs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contentConfigService.getFAQs({
        ...filters,
        page,
        pageSize,
      });
      setFAQs(Array.isArray(data.items) ? data.items : []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
      toast.error('获取FAQ列表失败');
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      question: '',
      answer: '',
      category: 'GENERAL',
      sortOrder: 0,
      isActive: true,
    });
    setEditVisible(true);
  };

  const handleEdit = (record: FAQ) => {
    setEditingItem(record);
    setFormData({
      question: record.question,
      answer: record.answer,
      category: record.category,
      sortOrder: record.sortOrder,
      isActive: record.isActive,
    });
    setEditVisible(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条FAQ吗？')) return;
    
    setDeletingId(id);
    try {
      await contentConfigService.deleteFAQ(id);
      toast.success('删除成功');
      fetchFAQs();
    } catch (error) {
      toast.error('删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('问题和答案不能为空');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        await contentConfigService.updateFAQ(editingItem.id, formData as UpdateFAQDto);
        toast.success('更新成功');
      } else {
        await contentConfigService.createFAQ(formData);
        toast.success('添加成功');
      }
      setEditVisible(false);
      fetchFAQs();
    } catch (error) {
      toast.error('操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await contentConfigService.updateFAQ(id, { isActive: !isActive });
      toast.success('状态已更新');
      fetchFAQs();
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const getCategoryBadge = (category: string) => {
    const config = FAQCategoryMap[category] || { text: category, color: 'default' };
    const colorClass: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800',
      orange: 'bg-orange-100 text-orange-800',
      purple: 'bg-purple-100 text-purple-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      cyan: 'bg-cyan-100 text-cyan-800',
      default: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={colorClass[config.color] || colorClass.default}>{config.text}</Badge>;
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>常见问答管理</CardTitle>
          <div className="flex space-x-2">
            <Input
              placeholder="搜索问题或答案"
              className="w-48"
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && fetchFAQs()}
            />
            <Select
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">全部分类</option>
              {Object.entries(FAQCategoryMap).map(([key, value]) => (
                <option key={key} value={key}>{value.text}</option>
              ))}
            </Select>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" />
              添加FAQ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">分类</th>
                    <th className="p-3 text-left text-sm font-medium">问题</th>
                    <th className="p-3 text-left text-sm font-medium">答案</th>
                    <th className="p-3 text-left text-sm font-medium">排序</th>
                    <th className="p-3 text-left text-sm font-medium">状态</th>
                    <th className="p-3 text-right text-sm font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {faqs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    faqs.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-muted/50">
                        <td className="p-3">{getCategoryBadge(item.category)}</td>
                        <td className="p-3 max-w-xs truncate">{item.question}</td>
                        <td className="p-3 max-w-xs truncate">{item.answer}</td>
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
        title={editingItem ? '编辑FAQ' : '添加FAQ'}
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium">分类</label>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {Object.entries(FAQCategoryMap).map(([key, value]) => (
                <option key={key} value={key}>{value.text}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">问题</label>
            <textarea
              className="w-full p-2 border rounded-md min-h-[60px]"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="请输入问题"
            />
          </div>

          <div>
            <label className="text-sm font-medium">答案</label>
            <textarea
              className="w-full p-2 border rounded-md min-h-[100px]"
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              placeholder="请输入答案"
            />
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
    </div>
  );
}

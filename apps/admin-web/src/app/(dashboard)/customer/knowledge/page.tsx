'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';

interface Knowledge {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  intent?: string;
  priority: number;
  isActive: boolean;
  hitCount: number;
  createdAt: string;
}

const CategoryMap: Record<string, { text: string; color: string }> = {
  ORDER: { text: '订单相关', color: 'blue' },
  RECYCLE: { text: '回收相关', color: 'green' },
  PAYMENT: { text: '支付相关', color: 'orange' },
  LOGISTICS: { text: '物流相关', color: 'purple' },
  ACCOUNT: { text: '账户相关', color: 'cyan' },
  GENERAL: { text: '通用问题', color: 'default' },
};

export default function KnowledgePage() {
  const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [editVisible, setEditVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Knowledge | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    category: 'GENERAL',
    question: '',
    answer: '',
    keywords: '',
    intent: '',
    priority: 0,
    isActive: true,
  });

  const fetchKnowledge = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/customer/knowledge?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setKnowledge(Array.isArray(data.items) ? data.items : []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch knowledge:', error);
      toast.error('获取知识库失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchKnowledge();
  }, [fetchKnowledge]);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      category: 'GENERAL',
      question: '',
      answer: '',
      keywords: '',
      intent: '',
      priority: 0,
      isActive: true,
    });
    setEditVisible(true);
  };

  const handleEdit = (record: Knowledge) => {
    setEditingItem(record);
    setFormData({
      category: record.category,
      question: record.question,
      answer: record.answer,
      keywords: record.keywords?.join(', ') || '',
      intent: record.intent || '',
      priority: record.priority,
      isActive: record.isActive,
    });
    setEditVisible(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/customer/knowledge/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('删除成功');
        fetchKnowledge();
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async () => {
    const data = {
      ...formData,
      keywords: formData.keywords?.split(',').map((k: string) => k.trim()).filter(Boolean),
    };

    setSubmitting(true);
    try {
      const url = editingItem
        ? `/api/customer/knowledge/${editingItem.id}`
        : '/api/customer/knowledge';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(editingItem ? '更新成功' : '添加成功');
        setEditVisible(false);
        fetchKnowledge();
      } else {
        toast.error('操作失败');
      }
    } catch (error) {
      toast.error('操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/customer/knowledge/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (res.ok) {
        toast.success('状态已更新');
        fetchKnowledge();
      } else {
        toast.error('操作失败');
      }
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const getCategoryBadge = (category: string) => {
    const config = CategoryMap[category] || { text: category, color: 'gray' };
    return <Badge className={`bg-${config.color}-100 text-${config.color}-800`}>{config.text}</Badge>;
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>知识库管理</CardTitle>
          <div className="flex space-x-2">
            <Input
              placeholder="搜索问题或答案"
              className="w-48"
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && fetchKnowledge()}
            />
            <Select
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">全部分类</option>
              {Object.entries(CategoryMap).map(([key, value]) => (
                <option key={key} value={key}>{value.text}</option>
              ))}
            </Select>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" />
              添加知识
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
                    <th className="p-3 text-left text-sm font-medium">问题</th>
                    <th className="p-3 text-left text-sm font-medium">答案</th>
                    <th className="p-3 text-left text-sm font-medium">关键词</th>
                    <th className="p-3 text-left text-sm font-medium">优先级</th>
                    <th className="p-3 text-left text-sm font-medium">命中次数</th>
                    <th className="p-3 text-left text-sm font-medium">状态</th>
                    <th className="p-3 text-right text-sm font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {knowledge.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    knowledge.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-muted/50">
                        <td className="p-3">{getCategoryBadge(item.category)}</td>
                        <td className="p-3 max-w-xs truncate">{item.question}</td>
                        <td className="p-3 max-w-xs truncate">{item.answer}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {item.keywords?.slice(0, 3).map((k, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{k}</Badge>
                            ))}
                            {item.keywords?.length > 3 && (
                              <Badge variant="secondary" className="text-xs">+{item.keywords.length - 3}</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3">{item.priority}</td>
                        <td className="p-3">{item.hitCount}</td>
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

          {/* Pagination */}
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

      {/* Edit Modal */}
      <Modal
        open={editVisible}
        onOpenChange={setEditVisible}
        title={editingItem ? '编辑知识' : '添加知识'}
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium">分类</label>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {Object.entries(CategoryMap).map(([key, value]) => (
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
            <label className="text-sm font-medium">关键词</label>
            <Input
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="多个关键词用英文逗号分隔"
            />
            <p className="text-xs text-muted-foreground mt-1">例如: 订单, 查询, 状态</p>
          </div>

          <div>
            <label className="text-sm font-medium">意图标签</label>
            <Input
              value={formData.intent}
              onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
              placeholder="例如: ORDER_QUERY"
            />
          </div>

          <div>
            <label className="text-sm font-medium">优先级</label>
            <Input
              type="number"
              min={0}
              max={100}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
            />
            <p className="text-xs text-muted-foreground mt-1">数值越大优先级越高</p>
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

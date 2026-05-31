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
  CreateTemplateRequest,
  NotificationTemplate,
  notificationTemplateService,
  TEMPLATE_TYPES,
  UpdateTemplateRequest,
} from '@/services/notificationTemplateService';
import {
  CheckCircle,
  Edit,
  Eye,
  FileText,
  Gift,
  Plus,
  PlusCircle,
  RotateCw,
  Search,
  ShoppingBag,
  Trash2,
  UserCheck,
  Variable,
  XCircle,
  X as XIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface TemplateFormData {
  name: string;
  type: string;
  subject: string;
  content: string;
  isActive: boolean;
}

const CATEGORY_BADGE_VARIANT: Record<string, 'default' | 'info' | 'success' | 'warning' | 'destructive' | 'secondary' | 'outline'> = {
  '订单': 'info',
  '账户': 'default',
  '积分': 'success',
  '财务': 'warning',
  '营销': 'destructive',
  '系统': 'secondary',
  '其他': 'outline',
};

const CATEGORY_FILTER_OPTIONS = [
  { value: '', label: '全部类型' },
  { value: '订单', label: '订单' },
  { value: '账户', label: '账户' },
  { value: '积分', label: '积分' },
  { value: '财务', label: '财务' },
  { value: '营销', label: '营销' },
  { value: '系统', label: '系统' },
  { value: '其他', label: '其他' },
];

function getTypeLabel(type: string) {
  return TEMPLATE_TYPES.find((t) => t.value === type)?.label || type;
}

function getTypeCategory(type: string) {
  return TEMPLATE_TYPES.find((t) => t.value === type)?.category || '其他';
}

export default function NotificationTemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [variables, setVariables] = useState<string[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<NotificationTemplate | null>(null);
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});
  const [previewResult, setPreviewResult] = useState<{ subject?: string; content: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [validateResult, setValidateResult] = useState<{ isValid: boolean; errors?: string[] } | null>(null);
  const [validateLoading, setValidateLoading] = useState(false);

  const { confirm: showConfirm, dialogProps } = useConfirm();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TemplateFormData>({
    defaultValues: {
      name: '',
      type: '',
      subject: '',
      content: '',
      isActive: true,
    },
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await notificationTemplateService.getTemplates();
      setTemplates(data || []);
    } catch (error) {
      console.error(error);
      toast.error('获取模板列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (modalVisible && editingTemplate) {
      reset({
        name: editingTemplate.name,
        type: editingTemplate.type,
        subject: editingTemplate.subject || '',
        content: editingTemplate.content,
        isActive: editingTemplate.isActive,
      });
      setVariables([...editingTemplate.variables]);
    } else if (modalVisible) {
      reset({
        name: '',
        type: '',
        subject: '',
        content: '',
        isActive: true,
      });
      setVariables([]);
    }
  }, [modalVisible, editingTemplate, reset]);

  const handleCreate = () => {
    setEditingTemplate(null);
    setModalVisible(true);
  };

  const handleEdit = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm('确定要删除这个通知模板吗？', {
      title: '确认操作',
      type: 'danger',
      confirmText: '确定',
    });
    if (!confirmed) return;
    try {
      await notificationTemplateService.deleteTemplate(id);
      fetchTemplates();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (template: NotificationTemplate) => {
    try {
      await notificationTemplateService.updateTemplate(template.id, {
        isActive: !template.isActive,
      });
      fetchTemplates();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePreview = (template: NotificationTemplate) => {
    setPreviewTemplate(template);
    const vars: Record<string, string> = {};
    template.variables.forEach((v) => {
      vars[v] = '';
    });
    setPreviewVariables(vars);
    setPreviewResult(null);
    setValidateResult(null);
    setPreviewVisible(true);
  };

  const handleAddVariable = () => {
    setVariables([...variables, '']);
  };

  const handleRemoveVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleVariableChange = (index: number, value: string) => {
    const newVars = [...variables];
    newVars[index] = value;
    setVariables(newVars);
  };

  const handlePreviewVariableChange = (key: string, value: string) => {
    setPreviewVariables((prev) => ({ ...prev, [key]: value }));
  };

  const handleRenderPreview = async () => {
    if (!previewTemplate) return;
    try {
      setPreviewLoading(true);
      const result = await notificationTemplateService.renderTemplate(
        previewTemplate.id,
        previewVariables
      );
      setPreviewResult(result);
    } catch (error) {
      console.error(error);
      toast.error('渲染模板失败');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleValidateTemplate = async () => {
    if (!previewTemplate) return;
    try {
      setValidateLoading(true);
      const result = await notificationTemplateService.validateTemplate(
        previewTemplate.id,
        previewVariables
      );
      setValidateResult(result);
      if (result.isValid) {
        toast.success('模板验证通过');
      } else {
        toast.error('模板验证失败');
      }
    } catch (error) {
      console.error(error);
      toast.error('模板验证失败');
    } finally {
      setValidateLoading(false);
    }
  };

  const onSubmit = async (data: TemplateFormData) => {
    try {
      setModalLoading(true);
      const filteredVariables = variables.filter((v) => v.trim() !== '');
      if (editingTemplate) {
        const updateData: UpdateTemplateRequest = {
          name: data.name,
          subject: data.subject || undefined,
          content: data.content,
          variables: filteredVariables,
          isActive: data.isActive,
        };
        await notificationTemplateService.updateTemplate(editingTemplate.id, updateData);
      } else {
        const createData: CreateTemplateRequest = {
          name: data.name,
          type: data.type,
          subject: data.subject || undefined,
          content: data.content,
          variables: filteredVariables,
        };
        await notificationTemplateService.createTemplate(createData);
      }
      setModalVisible(false);
      fetchTemplates();
    } catch (error) {
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      getTypeLabel(template.type).includes(searchInput);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && template.isActive) ||
      (statusFilter === 'inactive' && !template.isActive);
    const matchesCategory =
      !categoryFilter || getTypeCategory(template.type) === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: templates.length,
    order: templates.filter((t) => getTypeCategory(t.type) === '订单').length,
    account: templates.filter((t) => getTypeCategory(t.type) === '账户').length,
    points: templates.filter((t) => getTypeCategory(t.type) === '积分').length,
  };

  const groupedTemplateTypes = TEMPLATE_TYPES.reduce<Record<string, typeof TEMPLATE_TYPES>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">通知模板管理</h1>
          <p className="text-sm text-muted-foreground">
            管理短信、邮件、推送等通知模板，支持变量替换
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          添加模板
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">模板总数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              已配置 {templates.filter((t) => t.isActive).length} 个启用
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">订单类模板</CardTitle>
            <ShoppingBag className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{stats.order}</div>
            <p className="text-xs text-muted-foreground mt-1">
              订单确认、支付、物流等
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">账户类模板</CardTitle>
            <UserCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.account}</div>
            <p className="text-xs text-muted-foreground mt-1">
              验证码、密码重置等
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">积分类模板</CardTitle>
            <Gift className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.points}</div>
            <p className="text-xs text-muted-foreground mt-1">
              积分到账、签到奖励等
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
                  placeholder="搜索模板名称..."
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-[140px]"
              >
                {CATEGORY_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={fetchTemplates} title="刷新">
              <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>模板名称</TableHead>
                <TableHead>模板类型</TableHead>
                <TableHead>主题</TableHead>
                <TableHead>变量数</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[80px] rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[40px]" />
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
              ) : filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    暂无通知模板
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <Badge variant={CATEGORY_BADGE_VARIANT[getTypeCategory(template.type)]}>
                        {getTypeLabel(template.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm truncate max-w-[200px] block">
                        {template.subject || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Variable className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{template.variables.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.isActive ? 'success' : 'secondary'}>
                        {template.isActive ? '已启用' : '已禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="预览渲染"
                          onClick={() => handlePreview(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title={template.isActive ? '禁用' : '启用'}
                          onClick={() => handleToggleStatus(template)}
                        >
                          {template.isActive ? (
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
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="删除"
                          onClick={() => handleDelete(template.id)}
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
        title={editingTemplate ? '编辑通知模板' : '添加通知模板'}
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
              <label className="text-sm font-medium">模板名称</label>
              <Input
                {...register('name', { required: '请输入模板名称' })}
                placeholder="例如：订单确认通知"
              />
              {errors.name && (
                <span className="text-xs text-destructive">{errors.name.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">模板类型</label>
              <Select
                {...register('type', { required: '请选择模板类型' })}
                disabled={!!editingTemplate}
                value={watch('type')}
                onChange={(e) => setValue('type', e.target.value)}
              >
                <option value="">请选择模板类型</option>
                {Object.entries(groupedTemplateTypes).map(([category, types]) => (
                  <optgroup key={category} label={category}>
                    {types.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
              {errors.type && (
                <span className="text-xs text-destructive">{errors.type.message}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">邮件主题（可选）</label>
            <Input
              {...register('subject')}
              placeholder="仅邮件模板需要填写"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">模板内容</label>
            <textarea
              {...register('content', { required: '请输入模板内容' })}
              rows={8}
              className="flex w-full rounded-lg border border-border/40 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all duration-200 resize-none"
              placeholder="使用 {{变量名}} 格式插入变量，例如：尊敬的{{userName}}，您的订单{{orderNo}}已确认。"
            />
            {errors.content && (
              <span className="text-xs text-destructive">{errors.content.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">变量列表</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddVariable}
              >
                <PlusCircle className="mr-1 h-3 w-3" />
                添加变量
              </Button>
            </div>
            <div className="space-y-2">
              {variables.map((variable, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={variable}
                    onChange={(e) => handleVariableChange(index, e.target.value)}
                    placeholder="变量名，例如：userName"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleRemoveVariable(index)}
                  >
                    <XIcon className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              {variables.length === 0 && (
                <p className="text-xs text-muted-foreground">暂无变量，点击&ldquo;添加变量&rdquo;按钮新增</p>
              )}
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
              启用此模板
            </label>
          </div>
        </form>
      </Modal>

      <Modal
        title="预览渲染"
        open={previewVisible}
        onOpenChange={(open) => !open && setPreviewVisible(false)}
        width={800}
        footer={
          <>
            <Button
              variant="outline"
              onClick={handleValidateTemplate}
              disabled={validateLoading}
            >
              {validateLoading ? '验证中...' : '验证模板'}
            </Button>
            <Button onClick={handleRenderPreview} disabled={previewLoading}>
              {previewLoading ? '渲染中...' : '渲染预览'}
            </Button>
            <Button variant="outline" onClick={() => setPreviewVisible(false)}>
              关闭
            </Button>
          </>
        }
      >
        {previewTemplate && (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">变量输入</h3>
              {previewTemplate.variables.length === 0 ? (
                <p className="text-xs text-muted-foreground">此模板没有变量</p>
              ) : (
                previewTemplate.variables.map((v) => (
                  <div key={v} className="space-y-1">
                    <label className="text-xs text-muted-foreground">{`{{${v}}}`}</label>
                    <Input
                      value={previewVariables[v] || ''}
                      onChange={(e) => handlePreviewVariableChange(v, e.target.value)}
                      placeholder={`输入 ${v} 的值`}
                    />
                  </div>
                ))
              )}
              {validateResult && (
                <div
                  className={cn(
                    'rounded-md p-3 text-sm',
                    validateResult.isValid
                      ? 'bg-success/10 text-success border border-success/20'
                      : 'bg-destructive/10 text-destructive border border-destructive/20'
                  )}
                >
                  {validateResult.isValid ? (
                    '模板验证通过'
                  ) : (
                    <div>
                      <p>模板验证失败：</p>
                      <ul className="list-disc pl-4 mt-1">
                        {validateResult.errors?.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">渲染结果</h3>
              {previewResult ? (
                <div className="rounded-md border border-border/40 p-4 space-y-3">
                  {previewResult.subject && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">主题</p>
                      <p className="text-sm font-medium">{previewResult.subject}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">内容</p>
                    <p className="text-sm whitespace-pre-wrap">{previewResult.content}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-border/40 p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    填写变量值后点击&ldquo;渲染预览&rdquo;查看结果
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

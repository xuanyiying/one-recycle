'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import {
  notificationService,
  Notification,
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  RecipientType,
  NotificationStats,
  CreateNotificationRequest,
} from '@/services/notificationService';
import {
  Bell,
  Plus,
  Search,
  RefreshCw,
  Send,
  Edit,
  Trash2,
  Eye,
  Clock,
  Users,
  AlertCircle,
  Info,
  Megaphone,
  Wrench,
  Play,
  XCircle,
} from 'lucide-react';

const NotificationTypeConfig = {
  [NotificationType.SYSTEM]: { label: '系统通知', icon: Info, color: 'bg-blue-100 text-blue-800' },
  [NotificationType.ORDER]: { label: '订单通知', icon: Bell, color: 'bg-green-100 text-green-800' },
  [NotificationType.PROMOTION]: { label: '促销通知', icon: Megaphone, color: 'bg-purple-100 text-purple-800' },
  [NotificationType.MAINTENANCE]: { label: '维护通知', icon: Wrench, color: 'bg-orange-100 text-orange-800' },
};

const NotificationStatusConfig = {
  [NotificationStatus.DRAFT]: { label: '草稿', color: 'bg-gray-100 text-gray-800' },
  [NotificationStatus.SCHEDULED]: { label: '已计划', color: 'bg-blue-100 text-blue-800' },
  [NotificationStatus.SENT]: { label: '已发送', color: 'bg-green-100 text-green-800' },
  [NotificationStatus.FAILED]: { label: '发送失败', color: 'bg-red-100 text-red-800' },
};

const NotificationPriorityConfig = {
  [NotificationPriority.LOW]: { label: '低', color: 'bg-gray-100 text-gray-600' },
  [NotificationPriority.MEDIUM]: { label: '中', color: 'bg-blue-100 text-blue-600' },
  [NotificationPriority.HIGH]: { label: '高', color: 'bg-orange-100 text-orange-600' },
  [NotificationPriority.URGENT]: { label: '紧急', color: 'bg-red-100 text-red-600' },
};

export default function NotificationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const typeFilter = searchParams.get('type') || '';
  const statusFilter = searchParams.get('status') || '';

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [searchInput, setSearchInput] = useState(search);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const [formData, setFormData] = useState<CreateNotificationRequest>({
    title: '',
    content: '',
    type: NotificationType.SYSTEM,
    priority: NotificationPriority.MEDIUM,
    recipientType: RecipientType.ALL_USERS,
  });

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications({
        page,
        pageSize,
        search: search || undefined,
        type: typeFilter ? (typeFilter as NotificationType) : undefined,
        status: statusFilter ? (statusFilter as NotificationStatus) : undefined,
      }, false);
      setNotifications(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error(error);
      toast.error('获取通知列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, typeFilter, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await notificationService.getNotificationStats(false);
      setStats(response);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [fetchNotifications, fetchStats]);

  const updateUrl = (newParams: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCreate = () => {
    setEditingNotification(null);
    setFormData({
      title: '',
      content: '',
      type: NotificationType.SYSTEM,
      priority: NotificationPriority.MEDIUM,
      recipientType: RecipientType.ALL_USERS,
    });
    setModalVisible(true);
  };

  const handleEdit = (notification: Notification) => {
    if (notification.status !== NotificationStatus.DRAFT) {
      toast.warning('只能编辑草稿状态的通知');
      return;
    }
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      content: notification.content,
      type: notification.type,
      priority: notification.priority,
      recipientType: notification.recipientType,
      recipientIds: notification.recipientIds,
      scheduledTime: notification.scheduledTime,
      imageUrl: notification.imageUrl,
      actionUrl: notification.actionUrl,
      actionText: notification.actionText,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此通知吗？')) return;
    try {
      await notificationService.deleteNotification(id);
      toast.success('删除成功');
      fetchNotifications();
      fetchStats();
    } catch (error) {
      console.error(error);
      toast.error('删除失败');
    }
  };

  const handleSend = async (notification: Notification) => {
    if (notification.status !== NotificationStatus.DRAFT && notification.status !== NotificationStatus.FAILED) {
      toast.warning('只能发送草稿或发送失败的通知');
      return;
    }
    if (!confirm('确定要立即发送此通知吗？')) return;
    try {
      await notificationService.sendNotification({
        notificationId: notification.id,
        sendNow: true,
      });
      toast.success('通知已发送');
      fetchNotifications();
      fetchStats();
    } catch (error) {
      console.error(error);
      toast.error('发送失败');
    }
  };

  const handleCancel = async (notification: Notification) => {
    if (notification.status !== NotificationStatus.SCHEDULED) {
      toast.warning('只能取消已计划的通知');
      return;
    }
    if (!confirm('确定要取消此计划通知吗？')) return;
    try {
      await notificationService.cancelNotification(notification.id);
      toast.success('已取消计划');
      fetchNotifications();
      fetchStats();
    } catch (error) {
      console.error(error);
      toast.error('取消失败');
    }
  };

  const handleViewDetail = (notification: Notification) => {
    setSelectedNotification(notification);
    setDetailModalVisible(true);
  };

  const handleModalSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('请填写标题和内容');
      return;
    }
    try {
      setModalLoading(true);
      if (editingNotification) {
        await notificationService.updateNotification(editingNotification.id, formData);
        toast.success('更新成功');
      } else {
        await notificationService.createNotification(formData);
        toast.success('创建成功');
      }
      setModalVisible(false);
      fetchNotifications();
      fetchStats();
    } catch (error) {
      console.error(error);
      toast.error(editingNotification ? '更新失败' : '创建失败');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">通知管理</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          创建通知
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总通知数</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalNotifications}</div>
              <p className="text-xs text-muted-foreground">
                已发送: {stats.sentNotifications}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">计划发送</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduledNotifications}</div>
              <p className="text-xs text-muted-foreground">
                草稿: {stats.draftNotifications}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总阅读量</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReads}</div>
              <p className="text-xs text-muted-foreground">
                阅读率: {(stats.averageReadRate * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">发送失败</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.failedNotifications}</div>
              <p className="text-xs text-muted-foreground">
                点击率: {(stats.averageClickRate * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索通知标题..."
                  className="pl-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateUrl({ search: searchInput, page: 1 });
                    }
                  }}
                />
              </div>
              <Select
                value={typeFilter}
                onChange={(e) => updateUrl({ type: e.target.value, page: 1 })}
                className="w-[130px]"
              >
                <option value="">所有类型</option>
                {Object.entries(NotificationTypeConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </Select>
              <Select
                value={statusFilter}
                onChange={(e) => updateUrl({ status: e.target.value, page: 1 })}
                className="w-[130px]"
              >
                <option value="">所有状态</option>
                {Object.entries(NotificationStatusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={() => { fetchNotifications(); fetchStats(); }} title="刷新">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">标题</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">类型</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">优先级</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">状态</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">接收者</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">阅读/总数</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">创建时间</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-4"><Skeleton className="h-4 w-[200px]" /></td>
                      <td className="p-4"><Skeleton className="h-5 w-[80px] rounded-full" /></td>
                      <td className="p-4"><Skeleton className="h-5 w-[50px] rounded-full" /></td>
                      <td className="p-4"><Skeleton className="h-5 w-[60px] rounded-full" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[80px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[60px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[120px]" /></td>
                      <td className="p-4"><Skeleton className="h-8 w-[120px] ml-auto" /></td>
                    </tr>
                  ))
                ) : notifications.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="h-24 text-center text-muted-foreground">
                      暂无通知数据
                    </td>
                  </tr>
                ) : (
                  notifications.map((notification) => {
                    const typeConfig = NotificationTypeConfig[notification.type] || { label: notification.type, color: 'bg-gray-100 text-gray-800' };
                    const statusConfig = NotificationStatusConfig[notification.status] || { label: notification.status, color: 'bg-gray-100 text-gray-800' };
                    const priorityConfig = NotificationPriorityConfig[notification.priority] || { label: notification.priority, color: 'bg-gray-100 text-gray-800' };
                    return (
                      <tr key={notification.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {notification.content}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={typeConfig.color}>
                            {typeConfig.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={priorityConfig.color}>
                            {priorityConfig.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm">
                          {notification.recipientType === RecipientType.ALL_USERS ? '所有用户' :
                           notification.recipientType === RecipientType.COURIERS ? '快递员' :
                           notification.recipientType === RecipientType.USER_GROUP ? '用户组' : '指定用户'}
                        </td>
                        <td className="p-4 text-sm">
                          {notification.readCount} / {notification.totalRecipients}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetail(notification)} title="查看详情">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {notification.status === NotificationStatus.DRAFT && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(notification)} title="编辑">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleSend(notification)} title="发送" className="text-green-600 hover:text-green-700">
                                  <Send className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {notification.status === NotificationStatus.SCHEDULED && (
                              <Button variant="ghost" size="sm" onClick={() => handleCancel(notification)} title="取消计划" className="text-orange-600 hover:text-orange-700">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {notification.status === NotificationStatus.FAILED && (
                              <Button variant="ghost" size="sm" onClick={() => handleSend(notification)} title="重新发送" className="text-green-600 hover:text-green-700">
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {(notification.status === NotificationStatus.DRAFT || notification.status === NotificationStatus.FAILED) && (
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(notification.id)} title="删除" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {total > 0 && (
            <div className="border-t px-4 py-4">
              <Pagination
                total={total}
                pageSize={pageSize}
                current={page}
                onChange={(p: number) => updateUrl({ page: p })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={modalVisible}
        onOpenChange={(open) => !open && setModalVisible(false)}
        title={editingNotification ? '编辑通知' : '创建通知'}
        width={600}
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setModalVisible(false)}>取消</Button>
            <Button onClick={handleModalSubmit} disabled={modalLoading}>
              {modalLoading ? '保存中...' : '保存'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">标题 *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="请输入通知标题"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">内容 *</label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="请输入通知内容"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">类型</label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as NotificationType })}
              >
                {Object.entries(NotificationTypeConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">优先级</label>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as NotificationPriority })}
              >
                {Object.entries(NotificationPriorityConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">接收者</label>
            <Select
              value={formData.recipientType}
              onChange={(e) => setFormData({ ...formData, recipientType: e.target.value as RecipientType })}
            >
              <option value={RecipientType.ALL_USERS}>所有用户</option>
              <option value={RecipientType.COURIERS}>快递员</option>
              <option value={RecipientType.USER_GROUP}>用户组</option>
              <option value={RecipientType.SPECIFIC_USERS}>指定用户</option>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">计划发送时间（可选）</label>
            <Input
              type="datetime-local"
              value={formData.scheduledTime ? formData.scheduledTime.slice(0, 16) : ''}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
            />
            <p className="text-xs text-muted-foreground mt-1">留空则保存为草稿</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">跳转链接（可选）</label>
            <Input
              value={formData.actionUrl || ''}
              onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value || undefined })}
              placeholder="https://example.com"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={detailModalVisible}
        onOpenChange={(open) => !open && setDetailModalVisible(false)}
        title="通知详情"
        width={700}
        footer={
          <Button onClick={() => setDetailModalVisible(false)}>关闭</Button>
        }
      >
        {selectedNotification && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">标题</label>
                <p className="mt-1">{selectedNotification.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">类型</label>
                <p className="mt-1">
                  <Badge className={NotificationTypeConfig[selectedNotification.type].color}>
                    {NotificationTypeConfig[selectedNotification.type].label}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">优先级</label>
                <p className="mt-1">
                  <Badge className={NotificationPriorityConfig[selectedNotification.priority].color}>
                    {NotificationPriorityConfig[selectedNotification.priority].label}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">状态</label>
                <p className="mt-1">
                  <Badge className={NotificationStatusConfig[selectedNotification.status].color}>
                    {NotificationStatusConfig[selectedNotification.status].label}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">创建时间</label>
                <p className="mt-1">{new Date(selectedNotification.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">发送时间</label>
                <p className="mt-1">{selectedNotification.sentTime ? new Date(selectedNotification.sentTime).toLocaleString() : '-'}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">内容</label>
              <div className="mt-1 p-3 bg-muted/30 rounded-md text-sm whitespace-pre-wrap">
                {selectedNotification.content}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold">{selectedNotification.totalRecipients}</div>
                <div className="text-xs text-muted-foreground">接收人数</div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{selectedNotification.readCount}</div>
                <div className="text-xs text-muted-foreground">阅读人数</div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{selectedNotification.clickCount}</div>
                <div className="text-xs text-muted-foreground">点击次数</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

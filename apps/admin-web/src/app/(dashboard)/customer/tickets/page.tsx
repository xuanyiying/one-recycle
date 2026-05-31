'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { ConfirmDialog, useConfirm } from '@/components/ui/confirm-dialog';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, User, Loader2 } from 'lucide-react';

interface Ticket {
  id: string;
  ticketNo: string;
  type: string;
  status: string;
  priority: string;
  title: string;
  description?: string;
  user: {
    id: string;
    nickname: string;
    mobile?: string;
  };
  order?: {
    id: string;
    orderNo: string;
  };
  assignee?: {
    id: string;
    realName: string;
  };
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
  histories: TicketHistory[];
}

interface TicketHistory {
  id: string;
  action: string;
  fromStatus?: string;
  toStatus?: string;
  comment?: string;
  operator?: {
    realName: string;
  };
  createdAt: string;
}

const TicketTypeMap: Record<string, string> = {
  ORDER_CANCEL: '订单取消',
  ORDER_MODIFY: '订单修改',
  REFUND_REQUEST: '退款申请',
  LOGISTICS_ISSUE: '物流异常',
  RECYCLE_ISSUE: '回收问题',
  PRICE_DISPUTE: '价格异议',
  TIME_RESCHEDULE: '时间调整',
  COMPLAINT: '投诉建议',
  OTHER: '其他',
};

const TicketStatusMap: Record<string, { text: string; color: string }> = {
  PENDING: { text: '待处理', color: 'orange' },
  PROCESSING: { text: '处理中', color: 'blue' },
  RESOLVED: { text: '已解决', color: 'green' },
  CLOSED: { text: '已关闭', color: 'gray' },
  REOPENED: { text: '已重开', color: 'red' },
};

const TicketPriorityMap: Record<string, { text: string; color: string }> = {
  LOW: { text: '低', color: 'gray' },
  NORMAL: { text: '普通', color: 'blue' },
  HIGH: { text: '高', color: 'orange' },
  URGENT: { text: '紧急', color: 'red' },
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [resolveVisible, setResolveVisible] = useState(false);
  const [resolveComment, setResolveComment] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);

  const { confirm: showConfirm, dialogProps } = useConfirm();

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/customer/tickets?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(Array.isArray(data.items) ? data.items : []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('获取工单列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleViewDetail = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/customer/tickets/${ticketId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data);
        setDetailVisible(true);
      } else {
        toast.error('获取详情失败');
      }
    } catch (error) {
      toast.error('获取详情失败');
    }
  };

  const handleAssign = async (ticketId: string) => {
    setProcessingId(ticketId);
    try {
      const res = await fetch(`/api/customer/tickets/${ticketId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: 'current-agent' }),
      });

      if (res.ok) {
        toast.success('接单成功');
        fetchTickets();
      } else {
        toast.error('接单失败');
      }
    } catch (error) {
      toast.error('接单失败');
    } finally {
      setProcessingId(null);
    }
  };

  const handleResolve = async () => {
    if (!selectedTicket || !resolveComment.trim()) {
      toast.error('请输入解决方案');
      return;
    }

    setProcessingId(selectedTicket.id);
    try {
      const res = await fetch(`/api/customer/tickets/${selectedTicket.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution: resolveComment }),
      });

      if (res.ok) {
        toast.success('工单已解决');
        setResolveVisible(false);
        setResolveComment('');
        fetchTickets();
      } else {
        toast.error('操作失败');
      }
    } catch (error) {
      toast.error('操作失败');
    } finally {
      setProcessingId(null);
    }
  };

  const handleClose = async (ticketId: string) => {
    const confirmed = await showConfirm('确定要关闭这个工单吗？', {
      title: '确认操作',
      type: 'warning',
      confirmText: '确定',
    });
    if (!confirmed) return;

    setClosingId(ticketId);
    try {
      const res = await fetch(`/api/customer/tickets/${ticketId}/close`, {
        method: 'POST',
      });

      if (res.ok) {
        toast.success('工单已关闭');
        fetchTickets();
      } else {
        toast.error('操作失败');
      }
    } catch (error) {
      toast.error('操作失败');
    } finally {
      setClosingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = TicketStatusMap[status] || { text: status, color: 'gray' };
    return <Badge className={`bg-${config.color}-100 text-${config.color}-800`}>{config.text}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const config = TicketPriorityMap[priority] || { text: priority, color: 'gray' };
    return <Badge variant="outline" className={`border-${config.color}-500 text-${config.color}-600`}>{config.text}</Badge>;
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>工单管理</CardTitle>
          <div className="flex space-x-2">
            <Select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">全部状态</option>
              {Object.entries(TicketStatusMap).map(([key, value]) => (
                <option key={key} value={key}>{value.text}</option>
              ))}
            </Select>
            <Select
              value={filters.type || ''}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">全部类型</option>
              {Object.entries(TicketTypeMap).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </Select>
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
                    <th className="p-3 text-left text-sm font-medium">工单号</th>
                    <th className="p-3 text-left text-sm font-medium">类型</th>
                    <th className="p-3 text-left text-sm font-medium">标题</th>
                    <th className="p-3 text-left text-sm font-medium">用户</th>
                    <th className="p-3 text-left text-sm font-medium">优先级</th>
                    <th className="p-3 text-left text-sm font-medium">状态</th>
                    <th className="p-3 text-left text-sm font-medium">处理人</th>
                    <th className="p-3 text-left text-sm font-medium">创建时间</th>
                    <th className="p-3 text-right text-sm font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr key={ticket.id} className="border-t hover:bg-muted/50">
                        <td className="p-3 font-mono text-sm">{ticket.ticketNo}</td>
                        <td className="p-3">{TicketTypeMap[ticket.type] || ticket.type}</td>
                        <td className="p-3 max-w-xs truncate">{ticket.title}</td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{ticket.user?.nickname || '-'}</span>
                          </div>
                        </td>
                        <td className="p-3">{getPriorityBadge(ticket.priority)}</td>
                        <td className="p-3">{getStatusBadge(ticket.status)}</td>
                        <td className="p-3">{ticket.assignee?.realName || '-'}</td>
                        <td className="p-3 text-sm">{new Date(ticket.createdAt).toLocaleString()}</td>
                        <td className="p-3">
                          <div className="flex justify-end space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetail(ticket.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {ticket.status === 'PENDING' && (
                              <Button
                                size="sm"
                                onClick={() => handleAssign(ticket.id)}
                                disabled={processingId === ticket.id}
                              >
                                {processingId === ticket.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  '接单'
                                )}
                              </Button>
                            )}
                            {ticket.status === 'PROCESSING' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  setResolveVisible(true);
                                }}
                              >
                                解决
                              </Button>
                            )}
                            {ticket.status === 'RESOLVED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleClose(ticket.id)}
                                disabled={closingId === ticket.id}
                              >
                                {closingId === ticket.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  '关闭'
                                )}
                              </Button>
                            )}
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

      {/* Detail Modal */}
      <Modal
        open={detailVisible}
        onOpenChange={setDetailVisible}
        title="工单详情"
        width={600}
      >
        {selectedTicket && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">工单号:</span>
                <span className="ml-2 font-mono">{selectedTicket.ticketNo}</span>
              </div>
              <div>
                <span className="text-muted-foreground">类型:</span>
                <span className="ml-2">{TicketTypeMap[selectedTicket.type]}</span>
              </div>
              <div>
                <span className="text-muted-foreground">状态:</span>
                <span className="ml-2">{getStatusBadge(selectedTicket.status)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">优先级:</span>
                <span className="ml-2">{getPriorityBadge(selectedTicket.priority)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">标题:</span>
                <span className="ml-2">{selectedTicket.title}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">描述:</span>
                <span className="ml-2">{selectedTicket.description || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">用户:</span>
                <span className="ml-2">{selectedTicket.user?.nickname || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">手机号:</span>
                <span className="ml-2">{selectedTicket.user?.mobile || '-'}</span>
              </div>
              {selectedTicket.order && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">关联订单:</span>
                  <span className="ml-2 font-mono">{selectedTicket.order.orderNo}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">处理人:</span>
                <span className="ml-2">{selectedTicket.assignee?.realName || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">创建时间:</span>
                <span className="ml-2">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
              </div>
              {selectedTicket.resolution && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">解决方案:</span>
                  <span className="ml-2">{selectedTicket.resolution}</span>
                </div>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">处理记录</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedTicket.histories?.map((history, index) => (
                    <div key={history.id} className="flex space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${history.action === 'RESOLVE' ? 'bg-green-500' : 'bg-blue-500'}`} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{history.action}</span>
                          {history.operator && (
                            <span className="text-sm text-muted-foreground">- {history.operator.realName}</span>
                          )}
                        </div>
                        {history.fromStatus && history.toStatus && (
                          <div className="text-sm text-muted-foreground">
                            {TicketStatusMap[history.fromStatus]?.text} → {TicketStatusMap[history.toStatus]?.text}
                          </div>
                        )}
                        {history.comment && (
                          <div className="text-sm mt-1">{history.comment}</div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(history.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!selectedTicket.histories || selectedTicket.histories.length === 0) && (
                    <div className="text-center text-muted-foreground py-4">暂无处理记录</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Modal>

      {/* Resolve Modal */}
      <Modal
        open={resolveVisible}
        onOpenChange={(open) => {
          setResolveVisible(open);
          if (!open) setResolveComment('');
        }}
        title="解决工单"
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium">解决方案</label>
            <textarea
              className="w-full p-2 border rounded-md min-h-[100px] mt-1"
              value={resolveComment}
              onChange={(e) => setResolveComment(e.target.value)}
              placeholder="请输入解决方案..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setResolveVisible(false);
              setResolveComment('');
            }}
          >
            取消
          </Button>
          <Button
            onClick={handleResolve}
            disabled={processingId === selectedTicket?.id || !resolveComment.trim()}
          >
            {processingId === selectedTicket?.id && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            确认解决
          </Button>
        </div>
      </Modal>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

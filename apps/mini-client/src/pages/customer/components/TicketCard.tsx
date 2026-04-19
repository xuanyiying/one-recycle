import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';

interface TicketData {
  ticketNo: string;
  type: string;
  status: string;
  priority: string;
  title: string;
  description?: string;
  createdAt: string;
}

interface TicketCardProps {
  data: TicketData;
}

const TicketCard: React.FC<TicketCardProps> = ({ data }) => {
  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
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
    return typeMap[type] || type;
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: '待处理',
      PROCESSING: '处理中',
      RESOLVED: '已解决',
      CLOSED: '已关闭',
      REOPENED: '已重开',
    };
    return statusMap[status] || status;
  };

  const getPriorityClass = (priority: string) => {
    const classMap: Record<string, string> = {
      LOW: 'priority-low',
      NORMAL: 'priority-normal',
      HIGH: 'priority-high',
      URGENT: 'priority-urgent',
    };
    return classMap[priority] || 'priority-normal';
  };

  const handleViewDetail = () => {
    Taro.navigateTo({
      url: `/pages/ticket/detail?ticketNo=${data.ticketNo}`,
    });
  };

  return (
    <View className="ticket-card">
      <View className="card-header">
        <Text className="card-title">工单 {data.ticketNo}</Text>
        <Text className={`card-status ${getPriorityClass(data.priority)}`}>
          {getStatusText(data.status)}
        </Text>
      </View>

      <View className="card-content">
        <View className="info-row">
          <Text className="label">问题类型</Text>
          <Text className="value">{getTypeText(data.type)}</Text>
        </View>
        <View className="info-row">
          <Text className="label">问题描述</Text>
          <Text className="value">{data.title}</Text>
        </View>
        {data.description && (
          <View className="info-row">
            <Text className="label">详细说明</Text>
            <Text className="value">{data.description}</Text>
          </View>
        )}
        <View className="info-row">
          <Text className="label">创建时间</Text>
          <Text className="value">
            {new Date(data.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>

      <View className="card-footer">
        <Button className="card-btn secondary" onClick={handleViewDetail}>
          查看详情
        </Button>
        {data.status === 'RESOLVED' && (
          <Button className="card-btn primary">确认解决</Button>
        )}
      </View>
    </View>
  );
};

export default TicketCard;

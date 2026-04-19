import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Button } from '@nutui/nutui-react-taro';

interface OrderData {
  orderNo: string;
  status: string;
  createdAt: string;
  estimatedAmount?: number;
  address?: string;
  pickupTime?: string;
}

interface OrderCardProps {
  data: OrderData | OrderData[];
}

const OrderCard: React.FC<OrderCardProps> = ({ data }) => {
  const orders = Array.isArray(data) ? data : [data];

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: '待处理',
      PENDING_PICKUP: '待取件',
      PICKED_UP: '已取件',
      IN_TRANSIT: '运输中',
      DELIVERED: '已送达',
      CANCELLED: '已取消',
      COMPLETED: '已完成',
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string) => {
    if (['COMPLETED', 'DELIVERED'].includes(status)) {
      return 'card-status success';
    }
    if (['CANCELLED'].includes(status)) {
      return 'card-status error';
    }
    return 'card-status';
  };

  const handleViewDetail = (orderNo: string) => {
    Taro.navigateTo({
      url: `/pages/order/detail?orderNo=${orderNo}`,
    });
  };

  return (
    <View className="order-card-wrapper">
      {orders.map((order, index) => (
        <View key={order.orderNo || index} className="order-card">
          <View className="card-header">
            <Text className="card-title">订单 {order.orderNo}</Text>
            <Text className={getStatusClass(order.status)}>
              {getStatusText(order.status)}
            </Text>
          </View>

          <View className="card-content">
            {order.estimatedAmount && (
              <View className="info-row">
                <Text className="label">预估金额</Text>
                <Text className="value">¥{Number(order.estimatedAmount).toFixed(2)}</Text>
              </View>
            )}
            {order.address && (
              <View className="info-row">
                <Text className="label">收货地址</Text>
                <Text className="value">{order.address}</Text>
              </View>
            )}
            {order.pickupTime && (
              <View className="info-row">
                <Text className="label">取件时间</Text>
                <Text className="value">{order.pickupTime}</Text>
              </View>
            )}
            <View className="info-row">
              <Text className="label">创建时间</Text>
              <Text className="value">
                {new Date(order.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>

          <View className="card-footer">
            <Button
              className="card-btn secondary"
              onClick={() => handleViewDetail(order.orderNo)}
            >
              查看详情
            </Button>
          </View>
        </View>
      ))}
    </View>
  );
};

export default OrderCard;

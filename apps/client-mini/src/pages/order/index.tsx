import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '@/hooks/useAuth';
import { getUserOrders } from '@/services/order';
import AuthGuard from '@/components/AuthGuard';
import { Order, OrderStatus } from '@/types';
import './index.scss';

const OrderListPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | OrderStatus>('all');

  useEffect(() => {
    loadOrderList();
  }, []);

  const loadOrderList = async () => {
    try {
      setLoading(true);
      const result = await getUserOrders(user?.id || '');
      if (result.success && result.data) {
        // 处理分页结果
        if (Array.isArray(result.data)) {
          setOrderList(result.data);
        } else if (result.data.items) {
          setOrderList(result.data.items);
        }
      } else {
        throw new Error(result.message || '获取订单列表失败');
      }
    } catch (error) {
      console.error('加载订单列表失败:', error);
      Taro.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrderList();
    setRefreshing(false);
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: '待确认',
      confirmed: '已确认',
      picked_up: '已上门',
      completed: '已完成',
      cancelled: '已取消'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      pending: '#ff9500',
      confirmed: '#00c896',
      picked_up: '#007aff',
      completed: '#34c759',
      cancelled: '#ff3b30'
    };
    return colorMap[status] || '#666';
  };

  const getFilteredOrders = () => {
    if (activeTab === 'all') {
      return orderList;
    }
    return orderList.filter(order => order.status === activeTab);
  };

  const handleOrderClick = (orderId: string) => {
    Taro.navigateTo({
      url: `/pages/order/detail/index?id=${orderId}`
    });
  };

  const handleCreateOrder = () => {
    Taro.navigateTo({
      url: '/pages/recycle/index'
    });
  };

  const filteredOrders = getFilteredOrders();

  // Render order item component
  const renderOrderItem = useCallback((order: Order) => (
    <View
      key={order.id}
      className="order-item"
      onClick={() => handleOrderClick(order.id)}
    >
      <View className="order-header">
        <Text className="order-number">订单号：{order.id}</Text>
        <View 
          className="status-badge"
          style={{ backgroundColor: getStatusColor(order.status) }}
        >
          <Text className="status-text">{order.statusText}</Text>
        </View>
      </View>

      <View className="order-content">
        <View className="order-info">
          <Text className="category">{order.categoryName}</Text>
          <Text className="description">{order.items.join(', ')}</Text>
          <Text className="weight">重量：{order.estimatedWeight}kg</Text>
        </View>

        <View className="price-info">
          {order.actualPrice ? (
            <Text className="actual-price">¥{order.actualPrice.toFixed(2)}</Text>
          ) : (
            <Text className="estimated-price">预估 ¥{order.estimatedPrice.toFixed(2)}</Text>
          )}
        </View>
      </View>

      <View className="order-footer">
        <Text className="create-time">下单时间：{order.createTime}</Text>
        <Text className="pickup-time">上门时间：{order.appointmentTime}</Text>
      </View>
    </View>
  ), []);

  return (
    <AuthGuard>
      <View className="order-list-page">
      {/* 状态筛选标签 */}
      <View className="tab-container">
        <View className="tab-list">
          {[
            { key: 'all', label: '全部' },
            { key: 'pending', label: '待确认' },
            { key: 'confirmed', label: '已确认' },
            { key: 'completed', label: '已完成' }
          ].map(tab => (
            <View
              key={tab.key}
              className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key as any)}
            >
              <Text className="tab-text">{tab.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 订单列表 */}
      <ScrollView
        className="content-container"
        scrollY
        refresherEnabled
        refresherTriggered={refreshing}
        onRefresherRefresh={handleRefresh}
      >
        {loading ? (
          <View className="loading-container">
            <Text className="loading-text">加载中...</Text>
          </View>
        ) : filteredOrders.length > 0 ? (
          <View className="order-list">
            {filteredOrders.map(order => renderOrderItem(order))}
          </View>
        ) : (
          <View className="empty-container">
            <Text className="empty-icon">📦</Text>
            <Text className="empty-text">
              {activeTab === 'all' ? '暂无订单' : `暂无${getStatusText(activeTab)}订单`}
            </Text>
            <Button 
              className="create-order-btn"
              onClick={handleCreateOrder}
            >
              立即下单
            </Button>
          </View>
        )}
      </ScrollView>

      {/* 底部创建订单按钮 */}
      {filteredOrders.length > 0 && (
        <View className="fab-container">
          <Button 
            className="fab-btn"
            onClick={handleCreateOrder}
          >
            +
          </Button>
        </View>
      )}
      </View>
    </AuthGuard>
  );
};

export default OrderListPage;
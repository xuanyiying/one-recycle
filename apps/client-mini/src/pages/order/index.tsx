import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '@/hooks/useAuth';
import { getUserOrders } from '@/services/order';
import AuthGuard from '@/components/AuthGuard';
import { Order, OrderStatus } from '@/types';
import { Popup } from '@nutui/nutui-react-taro'
import EmptyIcon from '@/assets/images/empty-box.webp'
import { Edit, Star, Close } from '@nutui/icons-react-taro';
import { RecycleCard } from '@/components/RecycleCard';
import { useRecycleNavigation } from '../index/useRecycleNavigation';
import './index.scss';
import { getCdnUrl } from '@/utils/cdn';

const OrderListPage: React.FC = () => {
  const { user } = useAuth();
  const { handleRecycleClick } = useRecycleNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | OrderStatus>('all');
  const [showCategorySelect, setShowCategorySelect] = useState(false);

  const loadOrderList = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const result = await getUserOrders(user.id);
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
  }, [user?.id]);

  // 监听用户登录状态变化，一旦获取到用户信息（登录成功），立即加载订单
  useEffect(() => {
    loadOrderList();
  }, [loadOrderList]);

  // 监听页面显示，检查是否有来自其他页面的跳转参数，并触发数据加载
  Taro.useDidShow(() => {
    const targetTab = Taro.getStorageSync('ORDER_ACTIVE_TAB')
    if (targetTab) {
      setActiveTab(targetTab as any)
      Taro.removeStorageSync('ORDER_ACTIVE_TAB')
    }
    loadOrderList()
  })

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

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orderList
    return orderList.filter(order => order.status === activeTab)
  }, [orderList, activeTab])

  const handleOrderClick = (orderId: string) => {
    Taro.navigateTo({
      url: `/pages/order/detail/index?id=${orderId}`
    });
  };

  const handleCreateOrder = () => {
    setShowCategorySelect(true);
  };

  const handleCardClick = (type: 'book' | 'clothes') => {
    setShowCategorySelect(false);
    handleRecycleClick(type);
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch (e) {
      return dateString;
    }
  };

  // Render order item component
  const renderOrderItem = useCallback((order: Order) => (
    <View
      key={order.id}
      className="order-card"
      onClick={() => handleOrderClick(order.id)}
      hoverClass="order-card-hover"
      hoverStayTime={70}
    >
      <View className="card-header">
        <Text className="order-no">订单号 {order.id}</Text>
        <View
          className={`status-tag ${order.status.toLowerCase()}`}
          style={{
            color: getStatusColor(order.status),
            backgroundColor: `${getStatusColor(order.status)}15`
          }}
        >
          <Text className="status-text">{getStatusText(order.status)}</Text>
        </View>
      </View>

      <View className="card-body">
        {Array.isArray(order.items) && order.items.map((item, index) => (
          <View key={index} className="item-row">
            <View className="item-image-placeholder">
              {item.photos && item.photos.length > 0 ? (
                <Image
                  src={getCdnUrl(item.photos[0], { w: 160, h: 160, fmt: 'webp', q: 80 })}
                  className="item-img"
                  mode="aspectFill"
                  lazyLoad
                />
              ) : (
                <View className="icon-wrapper">
                  {(item.categoryName || '').includes('书') ? <Edit size={24} color='#999' /> : <Star size={24} color='#999' />}
                </View>
              )}
            </View>
            <View className="item-content">
              <View className="item-main">
                <Text className="item-title">{item.categoryName || '回收物品'}</Text>
                <Text className="item-price">
                  {item.amount ? `¥${item.amount.toFixed(2)}` : '待估价'}
                </Text>
              </View>
              <View className="item-sub">
                <Text className="item-specs">
                  {(item.weight) ? `${item.weight}kg` : ''}
                  {item.weight && item.unitPrice ? ' | ' : ''}
                  {item.unitPrice ? `¥${item.unitPrice}/kg` : ''}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className="card-footer">
        <View className="info-col">
          <Text className="info-text">{formatDate(order.appointmentTime || order.createTime)}</Text>
        </View>
        <View className="total-col">
          <Text className="total-label">预估合计</Text>
          <Text className="total-price">
            <Text className="symbol">¥</Text>
            {order.actualPrice ? order.actualPrice.toFixed(2) : (order.estimatedPrice?.toFixed(2) ?? '0.00')}
          </Text>
        </View>
      </View>
    </View>
  ), []);

  return (
    <AuthGuard>
      <View className="order-list-page">
        {/* 状态筛选标签 - 悬浮胶囊风格 */}
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
                {activeTab === tab.key && <View className="active-indicator" />}
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
              <Image
                src={EmptyIcon}
                className="empty-img"
                mode="aspectFit"
              />
              <Text className="empty-title">暂无订单</Text>
              <Text className="empty-desc">
                {activeTab === 'all' ? '快去回收你的第一件物品吧' : '当前状态下没有订单哦'}
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
        {
          filteredOrders.length > 0 && (
            <View className="fab-container">
              <Button
                className="fab-btn"
                onClick={handleCreateOrder}
              >
                +
              </Button>
            </View>
          )
        }

        {/* 分类选择弹窗 */}
        <Popup
          visible={showCategorySelect}
          position="bottom"
          round
          onClose={() => setShowCategorySelect(false)}
          className="category-popup"
        >
          <View className="popup-header">
            <Text className="popup-title">选择回收类型</Text>
            <View className="close-btn" onClick={() => setShowCategorySelect(false)}>
              <Close size={20} color="#999" />
            </View>
          </View>
          <View className="category-options">
            <RecycleCard
              type='book'
              onClick={() => handleCardClick('book')}
              className='popup-action-card'
            />
            <RecycleCard
              type='clothes'
              onClick={() => handleCardClick('clothes')}
              className='popup-action-card'
            />
          </View>
        </Popup>
      </View >
    </AuthGuard >
  );
};

export default OrderListPage;

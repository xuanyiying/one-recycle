import { logger } from '@/utils/logger'
import { useState, useEffect, useCallback } from 'react';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { View, Text, Image, Button } from '@tarojs/components';
import AuthGuard from '@/components/AuthGuard';
import Icon from '@/components/Icon';
import { useSafeArea } from '@/hooks/useSafeArea';
import { getInviteStats, getInviteList, InviteStats, InviteRecord } from '@/services/referral';
import defaultAvatar from '@/assets/icons/default-avatar.png'
import './index.scss';

const ReferralPage: React.FC = () => {
  const { top: safeAreaTop } = useSafeArea();
  const [stats, setStats] = useState<InviteStats | null>(null);
  const [inviteList, setInviteList] = useState<InviteRecord[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setPage(1);
      }

      const [statsRes, listRes] = await Promise.all([
        getInviteStats(),
        getInviteList(1, 20),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }

      if (listRes.success) {
        setInviteList(listRes.data.data || []);
        setHasMore(listRes.data.page < listRes.data.totalPages);
        setPage(1);
      }
    } catch (error) {
      logger.error('加载推广数据失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'error' });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  usePullDownRefresh(async () => {
    await loadData(true);
    Taro.stopPullDownRefresh();
  });

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const res = await getInviteList(nextPage, 20);

      if (res.success) {
        setInviteList(prev => [...prev, ...(res.data.data || [])]);
        setHasMore(res.data.page < res.data.totalPages);
        setPage(nextPage);
      }
    } catch (error) {
      logger.error('加载更多失败:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCopyCode = () => {
    if (!stats?.inviteCode) return;

    Taro.setClipboardData({
      data: stats.inviteCode,
      success: () => {
        Taro.showToast({ title: '邀请码已复制', icon: 'success' });
      },
    });
  };

  const renderStatsCard = () => (
    <View className="stats-card">
      <View className="stats-grid">
        <View className="stat-item">
          <Text className="stat-value">{stats?.totalInvites || 0}</Text>
          <Text className="stat-label">邀请人数</Text>
        </View>
        <View className="stat-item">
          <Text className="stat-value">{stats?.totalRewards || 0}</Text>
          <Text className="stat-label">获得积分</Text>
        </View>
        <View className="stat-item">
          <Text className="stat-value">{stats?.totalItems || 0}</Text>
          <Text className="stat-label">旧物数量</Text>
        </View>
      </View>

      <View className="invite-code-section">
        <Text className="code-label">我的邀请码</Text>
        <View className="code-value">
          <Text className="code-text">{stats?.inviteCode || '------'}</Text>
          <Button className="copy-btn" onClick={handleCopyCode}>复制</Button>
        </View>
      </View>
    </View>
  );

  const renderShareSection = () => (
    <View className="share-section">
      <Button className="share-btn" open-type="share">
        <Icon name="share" size={40} color="#2E7D32" />
        <Text className="share-text">分享给好友</Text>
      </Button>
    </View>
  );

  const renderInviteItem = (item: InviteRecord) => (
    <View key={item.id} className="invite-item">
      <Image
        className="invitee-avatar"
        src={item.invitee.avatarUrl || defaultAvatar}
        mode="aspectFill"
      />
      <View className="invitee-info">
        <Text className="invitee-name">{item.invitee.nickname || '微信用户'}</Text>
        <Text className="invitee-status">
          注册时间: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View className="reward-info">
        {item.hasOrdered ? (
          <>
            <Text className="reward-points">+{item.totalOrderRewards}</Text>
            <Text className="reward-label">返佣积分</Text>
          </>
        ) : (
          <Text className="status-tag">未下单</Text>
        )}
      </View>
    </View>
  );

  const renderInviteList = () => (
    <View className="invite-list-section">
      <View className="section-title">
        <Text>邀请记录</Text>
        <Text className="section-count">共{stats?.totalInvites || 0}人</Text>
      </View>

      {inviteList.length > 0 ? (
        <>
          {inviteList.map(renderInviteItem)}
          {hasMore && (
            <View className="load-more" onClick={loadMore}>
              {loadingMore ? '加载中...' : '加载更多'}
            </View>
          )}
        </>
      ) : (
        <View className="empty-state">
          <Icon name="users" size={80} color="#ccc" />
          <Text className="empty-text">暂无邀请记录</Text>
          <Text className="empty-text">分享邀请码给好友开始推广</Text>
        </View>
      )}
    </View>
  );

  return (
    <AuthGuard showLoginPrompt>
      <View className="referral-page">
        <View className="header-section" style={{ paddingTop: `${safeAreaTop + 40}rpx` }}>
          <Text className="title">邀请好友</Text>
          <Text className="subtitle">好友下单即返积分奖励</Text>
        </View>

        {renderStatsCard()}
        {renderShareSection()}
        {renderInviteList()}
      </View>
    </AuthGuard>
  );
};

export default ReferralPage;

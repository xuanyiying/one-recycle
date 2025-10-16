import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useNetworkStatus } from '../../utils/networkStatus';
import syncQueue from '../../utils/syncQueue';
import './index.scss';

/**
 * Offline Indicator Component
 * Shows a banner when device is offline and displays pending sync count
 */

export default function OfflineIndicator() {
  const networkStatus = useNetworkStatus();
  const [pendingCount, setPendingCount] = Taro.useState(0);
  const [showBanner, setShowBanner] = Taro.useState(false);

  Taro.useEffect(() => {
    // Update pending count
    const updatePendingCount = () => {
      setPendingCount(syncQueue.getPendingCount());
    };

    updatePendingCount();

    // Update every 5 seconds
    const interval = setInterval(updatePendingCount, 5000);

    return () => clearInterval(interval);
  }, []);

  Taro.useEffect(() => {
    // Show banner when offline
    if (!networkStatus.isConnected) {
      setShowBanner(true);
    } else {
      // Hide banner after a delay when back online
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [networkStatus.isConnected]);

  if (!showBanner) {
    return null;
  }

  const handleRetrySync = () => {
    if (networkStatus.isConnected) {
      syncQueue.processQueue();
      Taro.showToast({
        title: '正在同步...',
        icon: 'loading',
        duration: 1500,
      });
    } else {
      Taro.showToast({
        title: '当前无网络连接',
        icon: 'none',
        duration: 2000,
      });
    }
  };

  return (
    <View className="offline-indicator">
      <View className={`offline-banner ${networkStatus.isConnected ? 'online' : 'offline'}`}>
        <View className="banner-content">
          <View className="status-icon">
            {networkStatus.isConnected ? '✓' : '⚠'}
          </View>
          <View className="status-text">
            {networkStatus.isConnected ? (
              <Text>网络已恢复</Text>
            ) : (
              <Text>当前无网络连接</Text>
            )}
          </View>
          {pendingCount > 0 && (
            <View className="pending-count">
              <Text>{pendingCount} 项待同步</Text>
            </View>
          )}
        </View>
        {pendingCount > 0 && networkStatus.isConnected && (
          <View className="retry-button" onClick={handleRetrySync}>
            <Text>立即同步</Text>
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * Performance Dashboard Component
 * Displays performance metrics for debugging (development only)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Button } from '@tarojs/components';
import { performanceMonitor } from '../../utils/performanceMonitor';
import './index.scss';

interface PerformanceDashboardProps {
  visible?: boolean;
  onClose?: () => void;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  visible = false,
  onClose
}) => {
  const [summary, setSummary] = useState(performanceMonitor.getSummary());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (visible) {
      const interval = setInterval(() => {
        setSummary(performanceMonitor.getSummary());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [visible]);

  const handleRefresh = () => {
    setSummary(performanceMonitor.getSummary());
    setRefreshKey(prev => prev + 1);
  };

  const handleClear = () => {
    performanceMonitor.clear();
    setSummary(performanceMonitor.getSummary());
  };

  const handleExport = () => {
    const metrics = performanceMonitor.exportMetrics();
    console.log('Performance Metrics:', metrics);
    // In production, you might want to download or send this data
  };

  if (!visible) return null;

  return (
    <View className="performance-dashboard">
      <View className="dashboard-header">
        <Text className="dashboard-title">性能监控</Text>
        <Button className="close-btn" onClick={onClose}>×</Button>
      </View>

      <View className="dashboard-content">
        {/* Page Load Metrics */}
        <View className="metric-section">
          <Text className="section-title">页面加载</Text>
          <View className="metric-row">
            <Text className="metric-label">加载次数:</Text>
            <Text className="metric-value">{summary.pageLoads.count}</Text>
          </View>
          <View className="metric-row">
            <Text className="metric-label">平均时间:</Text>
            <Text className={`metric-value ${summary.pageLoads.average > 1000 ? 'warning' : ''}`}>
              {summary.pageLoads.average}ms
            </Text>
          </View>
          <View className="metric-row">
            <Text className="metric-label">最慢加载:</Text>
            <Text className={`metric-value ${summary.pageLoads.slowest > 2000 ? 'error' : ''}`}>
              {summary.pageLoads.slowest}ms
            </Text>
          </View>
        </View>

        {/* API Request Metrics */}
        <View className="metric-section">
          <Text className="section-title">API 请求</Text>
          <View className="metric-row">
            <Text className="metric-label">请求次数:</Text>
            <Text className="metric-value">{summary.apiRequests.count}</Text>
          </View>
          <View className="metric-row">
            <Text className="metric-label">平均响应:</Text>
            <Text className={`metric-value ${summary.apiRequests.average > 500 ? 'warning' : ''}`}>
              {summary.apiRequests.average}ms
            </Text>
          </View>
          <View className="metric-row">
            <Text className="metric-label">最慢请求:</Text>
            <Text className={`metric-value ${summary.apiRequests.slowest > 1000 ? 'error' : ''}`}>
              {summary.apiRequests.slowest}ms
            </Text>
          </View>
          <View className="metric-row">
            <Text className="metric-label">错误数:</Text>
            <Text className={`metric-value ${summary.apiRequests.errors > 0 ? 'error' : ''}`}>
              {summary.apiRequests.errors}
            </Text>
          </View>
        </View>

        {/* User Interactions */}
        <View className="metric-section">
          <Text className="section-title">用户交互</Text>
          <View className="metric-row">
            <Text className="metric-label">交互次数:</Text>
            <Text className="metric-value">{summary.interactions.count}</Text>
          </View>
        </View>
      </View>

      <View className="dashboard-actions">
        <Button className="action-btn" onClick={handleRefresh}>刷新</Button>
        <Button className="action-btn" onClick={handleClear}>清除</Button>
        <Button className="action-btn" onClick={handleExport}>导出</Button>
      </View>
    </View>
  );
};

export default PerformanceDashboard;

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { pointsMallConfigApi, PointsMallConfig } from '@/services/pointsService';
import { Store, Power, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface PointsMallToggleProps {
  className?: string;
}

export function PointsMallToggle({ className }: PointsMallToggleProps) {
  const [config, setConfig] = useState<PointsMallConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  // 加载配置
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await pointsMallConfigApi.getConfig();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load points mall config:', error);
      toast.error('加载积分商城配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换状态
  const handleToggle = async (enabled: boolean) => {
    if (toggling) return;

    try {
      setToggling(true);
      const updatedConfig = await pointsMallConfigApi.toggleStatus(enabled);
      setConfig(updatedConfig);
      toast.success(`积分商城已${enabled ? '开启' : '关闭'}`);
    } catch (error) {
      console.error('Failed to toggle points mall status:', error);
      toast.error('操作失败，请重试');
      // 恢复原状态
      await loadConfig();
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      </Card>
    );
  }

  const isEnabled = config?.enabled ?? true;

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`h-12 w-12 rounded-lg flex items-center justify-center transition-colors duration-300 ${
              isEnabled
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              积分商城
              {isEnabled ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  运行中
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  <XCircle className="h-3 w-3" />
                  已关闭
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isEnabled
                ? '用户可以通过积分兑换商品，参与签到和任务'
                : '积分商城功能已关闭，用户无法访问相关功能'}
            </p>
            {config?.updatedAt && (
              <p className="text-xs text-gray-400 mt-1">
                上次更新: {new Date(config.updatedAt).toLocaleString('zh-CN')}
                {config.updatedBy && ` · 操作人: ${config.updatedBy}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1">
            <span
              className={`text-sm font-medium transition-colors duration-200 ${
                isEnabled ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {isEnabled ? '已启用' : '已禁用'}
            </span>
            <span className="text-xs text-gray-400">
              {toggling ? '处理中...' : '点击切换'}
            </span>
          </div>

          <Button
            variant={isEnabled ? 'default' : 'outline'}
            size="lg"
            className={`relative min-w-[100px] transition-all duration-300 ${
              isEnabled
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            } ${toggling ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={() => handleToggle(!isEnabled)}
            disabled={toggling}
          >
            {toggling ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                处理中
              </span>
            ) : isEnabled ? (
              <span className="flex items-center gap-2">
                <Power className="h-4 w-4" />
                关闭
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Power className="h-4 w-4" />
                开启
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* 状态提示 */}
      <div
        className={`mt-4 p-3 rounded-lg text-sm flex items-start gap-2 transition-all duration-300 ${
          isEnabled
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}
      >
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">
            {isEnabled ? '功能已启用' : '功能已关闭'}
          </p>
          <p className="mt-0.5 opacity-90">
            {isEnabled
              ? '用户现在可以正常访问积分商城、兑换商品、参与签到和任务活动。关闭后将影响用户体验，请谨慎操作。'
              : '用户将无法访问积分商城页面，已兑换的订单不受影响。开启后将恢复所有积分商城功能。'}
          </p>
        </div>
      </div>
    </Card>
  );
}

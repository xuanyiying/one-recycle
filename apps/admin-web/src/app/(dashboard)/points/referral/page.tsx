'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { referralConfigApi, ReferralConfig } from '@/services/pointsService';
import { Gift, Users, Save, RefreshCw } from 'lucide-react';

export default function ReferralConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ReferralConfig | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const data = await referralConfigApi.getConfig();
      setConfig(data);
    } catch (error) {
      console.error(error);
      toast.error('获取配置失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    if (!config) return;

    if (config.rewardValue <= 0) {
      toast.error('推广返佣奖励值必须大于 0');
      return;
    }
    if (config.rewardType === 'PERCENTAGE' && config.rewardValue > 100) {
      toast.error('推广返佣百分比不能超过 100');
      return;
    }
    if (config.minRewardPoints < 1) {
      toast.error('最低奖励积分不能小于 1');
      return;
    }
    if (config.inviteRewardValue <= 0) {
      toast.error('邀请奖励值必须大于 0');
      return;
    }
    if (config.inviteRewardType === 'PERCENTAGE' && config.inviteRewardValue > 100) {
      toast.error('邀请奖励百分比不能超过 100');
      return;
    }

    try {
      setSaving(true);
      await referralConfigApi.updateConfig(config);
      toast.success('配置保存成功');
      await fetchConfig();
    } catch (error) {
      console.error(error);
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">推广积分配置</h1>
        <Button variant="outline" onClick={fetchConfig} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ) : (
        config && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="mr-2 h-5 w-5" />
                  推广返佣配置
                </CardTitle>
                <CardDescription>配置被邀请用户下单后给邀请者的返佣规则</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">奖励类型</label>
                    <Select
                      value={config.rewardType}
                      onChange={(e) => setConfig({ ...config, rewardType: e.target.value as ReferralConfig['rewardType'] })}
                    >
                      <option value="FIXED">固定积分</option>
                      <option value="PERCENTAGE">订单金额百分比</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {config.rewardType === 'FIXED' ? '固定积分值' : '百分比 (%)'}
                    </label>
                    <Input
                      type="number"
                      value={config.rewardValue}
                      onChange={(e) => setConfig({ ...config, rewardValue: Number(e.target.value) })}
                      min={1}
                      max={config.rewardType === 'PERCENTAGE' ? 100 : undefined}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">奖励时机</label>
                    <Select
                      value={config.rewardTiming}
                      onChange={(e) => setConfig({ ...config, rewardTiming: e.target.value as ReferralConfig['rewardTiming'] })}
                    >
                      <option value="FIRST_ORDER">首单奖励</option>
                      <option value="EVERY_ORDER">每单奖励</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">最低奖励积分</label>
                    <Input
                      type="number"
                      value={config.minRewardPoints}
                      onChange={(e) => setConfig({ ...config, minRewardPoints: Number(e.target.value) })}
                      min={1}
                    />
                  </div>
                </div>
                <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  {config.rewardType === 'FIXED' ? (
                    <p>当前模式：被邀请用户每笔{config.rewardTiming === 'FIRST_ORDER' ? '首单' : '订单'}完成后，邀请者获得 <strong>{config.rewardValue}</strong> 积分</p>
                  ) : (
                    <p>当前模式：被邀请用户每笔{config.rewardTiming === 'FIRST_ORDER' ? '首单' : '订单'}完成后，邀请者获得订单金额 <strong>{config.rewardValue}%</strong> 的积分（最低 {config.minRewardPoints} 积分）</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  邀请好友奖励
                </CardTitle>
                <CardDescription>配置邀请好友成功后邀请人获得的积分规则</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">奖励方式</label>
                    <Select
                      value={config.inviteRewardType}
                      onChange={(e) => setConfig({ ...config, inviteRewardType: e.target.value as ReferralConfig['inviteRewardType'] })}
                    >
                      <option value="FIXED">一次性到账</option>
                      <option value="PERCENTAGE">按回收订单比例返佣</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {config.inviteRewardType === 'FIXED' ? '奖励积分' : '返佣比例 (%)'}
                    </label>
                    <Input
                      type="number"
                      value={config.inviteRewardValue}
                      onChange={(e) => setConfig({ ...config, inviteRewardValue: Number(e.target.value) })}
                      min={1}
                      max={config.inviteRewardType === 'PERCENTAGE' ? 100 : undefined}
                    />
                  </div>
                </div>
                <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  {config.inviteRewardType === 'FIXED' ? (
                    <p>当前模式：每成功邀请一位好友，邀请人一次性获得 <strong>{config.inviteRewardValue}</strong> 积分</p>
                  ) : (
                    <p>当前模式：邀请好友后，每次被邀请者完成回收订单，邀请人获得订单金额 <strong>{config.inviteRewardValue}%</strong> 的积分返佣</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? '保存中...' : '保存设置'}
              </Button>
            </div>
          </>
        )
      )}
    </div>
  );
}

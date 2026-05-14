'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  settingsService,
  SystemSettings,
  SecuritySettings,
  NotificationSettings,
  BackupSettings,
  BackupRecord,
} from '@/services/settingsService';
import {
  Settings,
  Shield,
  Bell,
  Database,
  Save,
  RefreshCw,
  Server,
  Globe,
  Clock,
  Mail,
  Smartphone,
  Key,
  Lock,
  Upload,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';

type SettingsTab = 'system' | 'security' | 'notification' | 'backup';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('system');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [backupSettings, setBackupSettings] = useState<BackupSettings | null>(null);
  const [backupRecords, setBackupRecords] = useState<BackupRecord[]>([]);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const [system, security, notification] = await Promise.all([
        settingsService.getSystemSettings(false),
        settingsService.getSecuritySettings(),
        settingsService.getNotificationSettings(false),
      ]);
      setSystemSettings(system);
      setSecuritySettings(security);
      setNotificationSettings(notification);
    } catch (error) {
      console.error(error);
      toast.error('获取设置失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveSystemSettings = async () => {
    if (!systemSettings) return;
    try {
      setSaving(true);
      await settingsService.updateSystemSettings(systemSettings);
      toast.success('系统设置保存成功');
    } catch (error) {
      console.error(error);
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecuritySettings = async () => {
    if (!securitySettings) return;
    try {
      setSaving(true);
      await settingsService.updateSecuritySettings(securitySettings);
      toast.success('安全设置保存成功');
    } catch (error) {
      console.error(error);
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    if (!notificationSettings) return;
    try {
      setSaving(true);
      await settingsService.updateNotificationSettings(notificationSettings);
      toast.success('通知设置保存成功');
    } catch (error) {
      console.error(error);
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('确定要清理系统缓存吗？')) return;
    try {
      await settingsService.clearCache();
      toast.success('缓存清理成功');
    } catch (error) {
      console.error(error);
      toast.error('清理缓存失败');
    }
  };

  const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: 'system', label: '系统设置', icon: <Settings className="h-4 w-4" /> },
    { key: 'security', label: '安全设置', icon: <Shield className="h-4 w-4" /> },
    { key: 'notification', label: '通知设置', icon: <Bell className="h-4 w-4" /> },
    { key: 'backup', label: '备份管理', icon: <Database className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">系统设置</h1>
        <Button variant="outline" onClick={fetchSettings} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-48 shrink-0">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      activeTab === tab.key
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 min-w-0">
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
            <>
              {activeTab === 'system' && systemSettings && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="mr-2 h-5 w-5" />
                      系统设置
                    </CardTitle>
                    <CardDescription>配置系统基本信息和运行参数</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">站点名称</label>
                        <Input
                          value={systemSettings.siteName}
                          onChange={(e) => setSystemSettings({ ...systemSettings, siteName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">站点描述</label>
                        <Input
                          value={systemSettings.siteDescription}
                          onChange={(e) => setSystemSettings({ ...systemSettings, siteDescription: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">时区</label>
                        <Select
                          value={systemSettings.timezone}
                          onChange={(e) => setSystemSettings({ ...systemSettings, timezone: e.target.value })}
                        >
                          <option value="Asia/Shanghai">中国标准时间 (UTC+8)</option>
                          <option value="UTC">协调世界时 (UTC)</option>
                          <option value="America/New_York">美国东部时间</option>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">语言</label>
                        <Select
                          value={systemSettings.language}
                          onChange={(e) => setSystemSettings({ ...systemSettings, language: e.target.value })}
                        >
                          <option value="zh-CN">简体中文</option>
                          <option value="en-US">English</option>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">货币</label>
                        <Select
                          value={systemSettings.currency}
                          onChange={(e) => setSystemSettings({ ...systemSettings, currency: e.target.value })}
                        >
                          <option value="CNY">人民币 (CNY)</option>
                          <option value="USD">美元 (USD)</option>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">日期格式</label>
                        <Select
                          value={systemSettings.dateFormat}
                          onChange={(e) => setSystemSettings({ ...systemSettings, dateFormat: e.target.value })}
                        >
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        </Select>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">文件上传设置</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">最大文件大小 (MB)</label>
                          <Input
                            type="number"
                            value={systemSettings.maxFileSize}
                            onChange={(e) => setSystemSettings({ ...systemSettings, maxFileSize: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">允许的文件类型</label>
                          <Input
                            value={systemSettings.allowedFileTypes.join(', ')}
                            onChange={(e) => setSystemSettings({ ...systemSettings, allowedFileTypes: e.target.value.split(', ') })}
                            placeholder="jpg, png, pdf"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">维护模式</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">启用维护模式</p>
                          <p className="text-sm text-muted-foreground">开启后，普通用户将无法访问系统</p>
                        </div>
                        <Switch
                          checked={systemSettings.maintenanceMode}
                          onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, maintenanceMode: checked })}
                        />
                      </div>
                      {systemSettings.maintenanceMode && (
                        <div className="mt-4 space-y-2">
                          <label className="text-sm font-medium">维护公告</label>
                          <Input
                            value={systemSettings.maintenanceMessage || ''}
                            onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMessage: e.target.value })}
                            placeholder="系统维护中，请稍后再试..."
                          />
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">系统操作</h4>
                      <div className="flex space-x-4">
                        <Button variant="outline" onClick={handleClearCache}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          清理缓存
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end border-t pt-4">
                      <Button onClick={handleSaveSystemSettings} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? '保存中...' : '保存设置'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'security' && securitySettings && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="mr-2 h-5 w-5" />
                      安全设置
                    </CardTitle>
                    <CardDescription>配置系统安全策略和访问控制</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">双因素认证</p>
                          <p className="text-sm text-muted-foreground">启用后，登录时需要验证码</p>
                        </div>
                        <Switch
                          checked={securitySettings.twoFactorEnabled}
                          onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">登录通知</p>
                          <p className="text-sm text-muted-foreground">新设备登录时发送通知</p>
                        </div>
                        <Switch
                          checked={securitySettings.loginNotifications}
                          onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, loginNotifications: checked })}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">登录限制</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">最大登录尝试次数</label>
                          <Input
                            type="number"
                            value={securitySettings.maxLoginAttempts}
                            onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">锁定时长 (分钟)</label>
                          <Input
                            type="number"
                            value={securitySettings.lockoutDuration}
                            onChange={(e) => setSecuritySettings({ ...securitySettings, lockoutDuration: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">会话管理</h4>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">最大会话数</label>
                          <Input
                            type="number"
                            value={securitySettings.sessionManagement.maxSessions}
                            onChange={(e) => setSecuritySettings({
                              ...securitySettings,
                              sessionManagement: { ...securitySettings.sessionManagement, maxSessions: Number(e.target.value) }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">会话超时 (分钟)</label>
                          <Input
                            type="number"
                            value={securitySettings.sessionManagement.sessionTimeout}
                            onChange={(e) => setSecuritySettings({
                              ...securitySettings,
                              sessionManagement: { ...securitySettings.sessionManagement, sessionTimeout: Number(e.target.value) }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">记住登录 (天)</label>
                          <Input
                            type="number"
                            value={securitySettings.sessionManagement.rememberMeDuration}
                            onChange={(e) => setSecuritySettings({
                              ...securitySettings,
                              sessionManagement: { ...securitySettings.sessionManagement, rememberMeDuration: Number(e.target.value) }
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">密码策略</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">最小长度</label>
                          <Input
                            type="number"
                            value={securitySettings.passwordPolicy.minLength}
                            onChange={(e) => setSecuritySettings({
                              ...securitySettings,
                              passwordPolicy: { ...securitySettings.passwordPolicy, minLength: Number(e.target.value) }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">密码有效期 (天，0=永不过期)</label>
                          <Input
                            type="number"
                            value={securitySettings.passwordPolicy.passwordExpiry}
                            onChange={(e) => setSecuritySettings({
                              ...securitySettings,
                              passwordPolicy: { ...securitySettings.passwordPolicy, passwordExpiry: Number(e.target.value) }
                            })}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2 mt-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="requireUppercase"
                            checked={securitySettings.passwordPolicy.requireUppercase}
                            onChange={(e) => setSecuritySettings({
                              ...securitySettings,
                              passwordPolicy: { ...securitySettings.passwordPolicy, requireUppercase: e.target.checked }
                            })}
                            className="h-4 w-4"
                          />
                          <label htmlFor="requireUppercase" className="text-sm">要求大写字母</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="requireLowercase"
                            checked={securitySettings.passwordPolicy.requireLowercase}
                            onChange={(e) => setSecuritySettings({
                              ...securitySettings,
                              passwordPolicy: { ...securitySettings.passwordPolicy, requireLowercase: e.target.checked }
                            })}
                            className="h-4 w-4"
                          />
                          <label htmlFor="requireLowercase" className="text-sm">要求小写字母</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="requireNumbers"
                            checked={securitySettings.passwordPolicy.requireNumbers}
                            onChange={(e) => setSecuritySettings({
                              ...securitySettings,
                              passwordPolicy: { ...securitySettings.passwordPolicy, requireNumbers: e.target.checked }
                            })}
                            className="h-4 w-4"
                          />
                          <label htmlFor="requireNumbers" className="text-sm">要求数字</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="requireSpecialChars"
                            checked={securitySettings.passwordPolicy.requireSpecialChars}
                            onChange={(e) => setSecuritySettings({
                              ...securitySettings,
                              passwordPolicy: { ...securitySettings.passwordPolicy, requireSpecialChars: e.target.checked }
                            })}
                            className="h-4 w-4"
                          />
                          <label htmlFor="requireSpecialChars" className="text-sm">要求特殊字符</label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end border-t pt-4">
                      <Button onClick={handleSaveSecuritySettings} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? '保存中...' : '保存设置'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'notification' && notificationSettings && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="mr-2 h-5 w-5" />
                      通知设置
                    </CardTitle>
                    <CardDescription>配置系统通知和消息推送</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-4 flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        邮件通知
                      </h4>
                      <div className="grid gap-2">
                        {[
                          { key: 'orderUpdates', label: '订单更新通知' },
                          { key: 'userRegistrations', label: '用户注册通知' },
                          { key: 'systemAlerts', label: '系统告警通知' },
                          { key: 'inventoryAlerts', label: '库存预警通知' },
                          { key: 'paymentNotifications', label: '支付通知' },
                          { key: 'marketingEmails', label: '营销邮件' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between py-2 border-b last:border-0">
                            <span className="text-sm">{item.label}</span>
                            <Switch
                              checked={notificationSettings.emailNotifications[item.key as keyof typeof notificationSettings.emailNotifications]}
                              onCheckedChange={(checked) => setNotificationSettings({
                                ...notificationSettings,
                                emailNotifications: { ...notificationSettings.emailNotifications, [item.key]: checked }
                              })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4 flex items-center">
                        <Smartphone className="mr-2 h-4 w-4" />
                        短信通知
                      </h4>
                      <div className="grid gap-2">
                        {[
                          { key: 'orderUpdates', label: '订单更新通知' },
                          { key: 'systemAlerts', label: '系统告警通知' },
                          { key: 'securityAlerts', label: '安全告警通知' },
                          { key: 'emergencyAlerts', label: '紧急告警通知' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between py-2 border-b last:border-0">
                            <span className="text-sm">{item.label}</span>
                            <Switch
                              checked={notificationSettings.smsNotifications[item.key as keyof typeof notificationSettings.smsNotifications]}
                              onCheckedChange={(checked) => setNotificationSettings({
                                ...notificationSettings,
                                smsNotifications: { ...notificationSettings.smsNotifications, [item.key]: checked }
                              })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">通知频率</h4>
                      <Select
                        value={notificationSettings.notificationFrequency}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          notificationFrequency: e.target.value as NotificationSettings['notificationFrequency']
                        })}
                        className="w-[200px]"
                      >
                        <option value="immediate">即时通知</option>
                        <option value="hourly">每小时汇总</option>
                        <option value="daily">每日汇总</option>
                        <option value="weekly">每周汇总</option>
                      </Select>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">免打扰时段</h4>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={notificationSettings.quietHours.enabled}
                            onCheckedChange={(checked) => setNotificationSettings({
                              ...notificationSettings,
                              quietHours: { ...notificationSettings.quietHours, enabled: checked }
                            })}
                          />
                          <span className="text-sm">启用</span>
                        </div>
                        {notificationSettings.quietHours.enabled && (
                          <>
                            <Input
                              type="time"
                              value={notificationSettings.quietHours.startTime}
                              onChange={(e) => setNotificationSettings({
                                ...notificationSettings,
                                quietHours: { ...notificationSettings.quietHours, startTime: e.target.value }
                              })}
                              className="w-[120px]"
                            />
                            <span className="text-sm">至</span>
                            <Input
                              type="time"
                              value={notificationSettings.quietHours.endTime}
                              onChange={(e) => setNotificationSettings({
                                ...notificationSettings,
                                quietHours: { ...notificationSettings.quietHours, endTime: e.target.value }
                              })}
                              className="w-[120px]"
                            />
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end border-t pt-4">
                      <Button onClick={handleSaveNotificationSettings} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? '保存中...' : '保存设置'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'backup' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="mr-2 h-5 w-5" />
                      备份管理
                    </CardTitle>
                    <CardDescription>管理系统数据备份和恢复</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="border-dashed">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-100 rounded-full">
                              <Download className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">创建备份</p>
                              <p className="text-sm text-muted-foreground">手动创建系统数据备份</p>
                            </div>
                          </div>
                          <Button className="w-full mt-4" variant="outline">
                            立即备份
                          </Button>
                        </CardContent>
                      </Card>
                      <Card className="border-dashed">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 rounded-full">
                              <Upload className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">恢复数据</p>
                              <p className="text-sm text-muted-foreground">从备份文件恢复数据</p>
                            </div>
                          </div>
                          <Button className="w-full mt-4" variant="outline">
                            选择备份文件
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">自动备份设置</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">启用自动备份</p>
                            <p className="text-sm text-muted-foreground">按计划自动创建备份</p>
                          </div>
                          <Switch
                            checked={backupSettings?.autoBackup ?? false}
                            onCheckedChange={(checked) => {
                              if (backupSettings) {
                                setBackupSettings({ ...backupSettings, autoBackup: checked });
                              }
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">备份频率</label>
                          <Select defaultValue="daily" className="w-full">
                            <option value="daily">每天</option>
                            <option value="weekly">每周</option>
                            <option value="monthly">每月</option>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">备份时间</label>
                          <Input type="time" defaultValue="02:00" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">保留天数</label>
                          <Input type="number" defaultValue={30} />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">备份记录</h4>
                      <div className="text-center py-8 text-muted-foreground">
                        <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>暂无备份记录</p>
                        <p className="text-sm">创建备份后将在此显示</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

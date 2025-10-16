'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Upload,
  Avatar,
  Divider,
  Row,
  Col,
  Space,
  message,
  Modal,
  Table,
  Tag,
  Progress,
  Statistic,
  TimePicker,
  InputNumber,
  Checkbox,
  List,
  Typography,
  Alert,
  Spin,
  Popconfirm,
} from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  SecurityScanOutlined,
  CloudUploadOutlined,
  UploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ReloadOutlined,
  LockOutlined,
  SafetyOutlined,
  DatabaseOutlined,
  InfoCircleOutlined,
  ClearOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  settingsService,
  UserProfile,
  SystemSettings,
  NotificationSettings,
  SecuritySettings,
  BackupSettings,
  BackupRecord,
  UpdateProfileRequest,
  UpdateSystemSettingsRequest,
  UpdateNotificationSettingsRequest,
  UpdateSecuritySettingsRequest,
  ChangePasswordRequest,
} from '@/services/settingsService';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [personalForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [systemForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [backupForm] = Form.useForm();

  // 状态管理
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [backupSettings, setBackupSettings] = useState<BackupSettings | null>(null);
  const [backupRecords, setBackupRecords] = useState<BackupRecord[]>([]);
  const [systemInfo, setSystemInfo] = useState<any>(null);

  // 模态框状态
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [twoFactorModalVisible, setTwoFactorModalVisible] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');

  // 分页状态
  const [backupPagination, setBackupPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 初始化数据
  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    setPageLoading(true);
    try {
      const [
        profileData,
        systemData,
        notificationData,
        securityData,
        backupData,
        systemInfoData,
      ] = await Promise.all([
        settingsService.getUserProfile(),
        settingsService.getSystemSettings(),
        settingsService.getNotificationSettings(),
        settingsService.getSecuritySettings(),
        settingsService.getBackupSettings(),
        settingsService.getSystemInfo(),
      ]);

      setUserProfile(profileData);
      setSystemSettings(systemData);
      setNotificationSettings(notificationData);
      setSecuritySettings(securityData);
      setBackupSettings(backupData);
      setSystemInfo(systemInfoData);

      // 设置表单初始值
      personalForm.setFieldsValue(profileData);
      systemForm.setFieldsValue(systemData);
      notificationForm.setFieldsValue(notificationData);
      securityForm.setFieldsValue(securityData);
      backupForm.setFieldsValue(backupData);

      // 加载备份记录
      await loadBackupRecords();
    } catch (error) {
      message.error('加载设置失败');
      console.error('Load settings error:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const loadBackupRecords = async (page = 1, pageSize = 10) => {
    try {
      const response = await settingsService.getBackupRecords({
        page,
        pageSize,
      });
      setBackupRecords(response.data);
      setBackupPagination({
        current: response.page,
        pageSize: response.pageSize,
        total: response.total,
      });
    } catch (error) {
      message.error('加载备份记录失败');
    }
  };

  const handlePersonalSubmit = async (values: UpdateProfileRequest) => {
    setLoading(true);
    try {
      const updatedProfile = await settingsService.updateUserProfile(values);
      setUserProfile(updatedProfile);
      message.success('个人资料更新成功');
    } catch (error) {
      message.error('更新失败');
      console.error('Update profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (values: ChangePasswordRequest) => {
    setLoading(true);
    try {
      await settingsService.changePassword(values);
      message.success('密码修改成功');
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error('密码修改失败');
      console.error('Change password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSubmit = async (values: UpdateSystemSettingsRequest) => {
    setLoading(true);
    try {
      const updatedSettings = await settingsService.updateSystemSettings(values);
      setSystemSettings(updatedSettings);
      message.success('系统设置更新成功');
    } catch (error) {
      message.error('更新失败');
      console.error('Update system settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSubmit = async (values: UpdateNotificationSettingsRequest) => {
    setLoading(true);
    try {
      const updatedSettings = await settingsService.updateNotificationSettings(values);
      setNotificationSettings(updatedSettings);
      message.success('通知设置更新成功');
    } catch (error) {
      message.error('更新失败');
      console.error('Update notification settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySubmit = async (values: UpdateSecuritySettingsRequest) => {
    setLoading(true);
    try {
      const updatedSettings = await settingsService.updateSecuritySettings(values);
      setSecuritySettings(updatedSettings);
      message.success('安全设置更新成功');
    } catch (error) {
      message.error('更新失败');
      console.error('Update security settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackupSubmit = async (values: Partial<BackupSettings>) => {
    setLoading(true);
    try {
      const updatedSettings = await settingsService.updateBackupSettings(values);
      setBackupSettings(updatedSettings);
      message.success('备份设置更新成功');
    } catch (error) {
      message.error('更新失败');
      console.error('Update backup settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const response = await settingsService.uploadAvatar(file);
      const updatedProfile = { ...userProfile!, avatar: response.url };
      setUserProfile(updatedProfile);
      personalForm.setFieldsValue({ avatar: response.url });
      message.success('头像上传成功');
      return false; // 阻止默认上传行为
    } catch (error) {
      message.error('头像上传失败');
      return false;
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    try {
      const response = await settingsService.uploadFile(file, type);
      systemForm.setFieldsValue({ [type]: response.url });
      message.success(`${type === 'logo' ? 'Logo' : 'Favicon'}上传成功`);
      return false;
    } catch (error) {
      message.error('文件上传失败');
      return false;
    }
  };

  const handleEnableTwoFactor = async () => {
    try {
      const response = await settingsService.enableTwoFactor();
      setQrCode(response.qrCode);
      setTwoFactorModalVisible(true);
    } catch (error) {
      message.error('启用双因子认证失败');
    }
  };

  const handleVerifyTwoFactor = async (code: string) => {
    try {
      await settingsService.verifyTwoFactor(code);
      message.success('双因子认证启用成功');
      setTwoFactorModalVisible(false);
      await loadAllSettings(); // 重新加载设置
    } catch (error) {
      message.error('验证码错误');
    }
  };

  const handleDisableTwoFactor = async (code: string) => {
    try {
      await settingsService.disableTwoFactor(code);
      message.success('双因子认证已禁用');
      await loadAllSettings();
    } catch (error) {
      message.error('禁用失败');
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      await settingsService.createBackup();
      message.success('备份任务已创建');
      await loadBackupRecords();
    } catch (error) {
      message.error('创建备份失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async (id: string, filename: string) => {
    try {
      const blob = await settingsService.downloadBackup(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('备份下载成功');
    } catch (error) {
      message.error('下载失败');
    }
  };

  const handleDeleteBackup = async (id: string) => {
    try {
      await settingsService.deleteBackup(id);
      message.success('备份删除成功');
      await loadBackupRecords();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleRestoreBackup = async (id: string) => {
    try {
      await settingsService.restoreBackup(id);
      message.success('备份恢复成功');
    } catch (error) {
      message.error('恢复失败');
    }
  };

  const handleClearCache = async () => {
    setLoading(true);
    try {
      await settingsService.clearCache();
      message.success('缓存清理成功');
    } catch (error) {
      message.error('清理失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRestartSystem = async () => {
    try {
      await settingsService.restartSystem();
      message.success('系统重启命令已发送');
    } catch (error) {
      message.error('重启失败');
    }
  };

    if (pageLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  // 备份记录表格列定义
  const backupColumns = [
    {
      title: '文件名',
      dataIndex: 'filename',
      key: 'filename',
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => `${(size / 1024 / 1024).toFixed(2)} MB`,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'manual' ? 'blue' : 'green'}>
          {type === 'manual' ? '手动' : '自动'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          completed: { color: 'success', text: '已完成' },
          failed: { color: 'error', text: '失败' },
          in_progress: { color: 'processing', text: '进行中' },
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (record: BackupRecord) => (
        <Space>
          {record.status === 'completed' && (
            <>
              <Button
                type="link"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadBackup(record.id, record.filename)}
              >
                下载
              </Button>
              <Popconfirm
                title="确定要恢复此备份吗？"
                onConfirm={() => handleRestoreBackup(record.id)}
              >
                <Button type="link" icon={<ReloadOutlined />}>
                  恢复
                </Button>
              </Popconfirm>
            </>
          )}
          <Popconfirm
            title="确定要删除此备份吗？"
            onConfirm={() => handleDeleteBackup(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>系统设置</Title>

      <Tabs defaultActiveKey="1">
        {/* 个人资料 */}
        <TabPane tab={<span><UserOutlined />个人资料</span>} key="1">
          <Row gutter={24}>
            <Col span={16}>
              <Card title="基本信息">
                <Form
                  form={personalForm}
                  layout="vertical"
                  onFinish={handlePersonalSubmit}
                >
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item label="头像">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <Avatar 
                            size={80} 
                            src={userProfile?.avatar} 
                            icon={<UserOutlined />} 
                          />
                          <Upload
                            beforeUpload={handleAvatarUpload}
                            showUploadList={false}
                            accept="image/*"
                          >
                            <Button icon={<UploadOutlined />}>更换头像</Button>
                          </Upload>
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="name"
                        label="姓名"
                        rules={[{ required: true, message: '请输入姓名' }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                          { required: true, message: '请输入邮箱' },
                          { type: 'email', message: '请输入有效的邮箱地址' },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="phone"
                        label="手机号"
                        rules={[{ required: true, message: '请输入手机号' }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="department" label="部门">
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="position" label="职位">
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit" loading={loading}>
                        保存更改
                      </Button>
                      <Button onClick={() => setPasswordModalVisible(true)}>
                        修改密码
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col span={8}>
              <Card title="账户信息">
                <List>
                  <List.Item>
                    <Text strong>用户ID:</Text>
                    <Text>{userProfile?.id}</Text>
                  </List.Item>
                  <List.Item>
                    <Text strong>角色:</Text>
                    <Tag color="blue">{userProfile?.role}</Tag>
                  </List.Item>
                  <List.Item>
                    <Text strong>创建时间:</Text>
                    <Text>{dayjs(userProfile?.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
                  </List.Item>
                  <List.Item>
                    <Text strong>最后更新:</Text>
                    <Text>{dayjs(userProfile?.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
                  </List.Item>
                </List>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* 系统设置 */}
        <TabPane tab={<span><SettingOutlined />系统设置</span>} key="2">
          <Row gutter={24}>
            <Col span={16}>
              <Card title="基本设置">
                <Form
                  form={systemForm}
                  layout="vertical"
                  onFinish={handleSystemSubmit}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="siteName"
                        label="网站名称"
                        rules={[{ required: true, message: '请输入网站名称' }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="language" label="默认语言">
                        <Select>
                          <Option value="zh-CN">简体中文</Option>
                          <Option value="en-US">English</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="siteDescription" label="网站描述">
                    <TextArea rows={3} />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="timezone" label="时区">
                        <Select>
                          <Option value="Asia/Shanghai">Asia/Shanghai</Option>
                          <Option value="UTC">UTC</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="currency" label="货币">
                        <Select>
                          <Option value="CNY">人民币 (CNY)</Option>
                          <Option value="USD">美元 (USD)</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="logo" label="网站Logo">
                        <Upload
                          beforeUpload={(file) => handleFileUpload(file, 'logo')}
                          showUploadList={false}
                          accept="image/*"
                        >
                          <Button icon={<UploadOutlined />}>上传Logo</Button>
                        </Upload>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="favicon" label="网站图标">
                        <Upload
                          beforeUpload={(file) => handleFileUpload(file, 'favicon')}
                          showUploadList={false}
                          accept="image/*"
                        >
                          <Button icon={<UploadOutlined />}>上传图标</Button>
                        </Upload>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider />

                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="maintenanceMode" label="维护模式" valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="emailEnabled" label="邮件服务" valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="smsEnabled" label="短信服务" valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="maintenanceMessage" label="维护提示信息">
                    <TextArea rows={2} />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      保存设置
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col span={8}>
              <Card title="系统信息">
                {systemInfo && (
                  <List>
                    <List.Item>
                      <Text strong>版本:</Text>
                      <Text>{systemInfo.version}</Text>
                    </List.Item>
                    <List.Item>
                      <Text strong>环境:</Text>
                      <Tag color={systemInfo.environment === 'production' ? 'red' : 'blue'}>
                        {systemInfo.environment}
                      </Tag>
                    </List.Item>
                    <List.Item>
                      <Text strong>运行时间:</Text>
                      <Text>{Math.floor(systemInfo.uptime / 3600)}小时</Text>
                    </List.Item>
                    <List.Item>
                      <Text strong>内存使用:</Text>
                      <Progress percent={systemInfo.memoryUsage} size="small" />
                    </List.Item>
                    <List.Item>
                      <Text strong>磁盘使用:</Text>
                      <Progress percent={systemInfo.diskUsage} size="small" />
                    </List.Item>
                  </List>
                )}

                <Divider />

                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    icon={<ClearOutlined />} 
                    onClick={handleClearCache}
                    loading={loading}
                    block
                  >
                    清理缓存
                  </Button>
                  <Popconfirm
                    title="确定要重启系统吗？"
                    onConfirm={handleRestartSystem}
                  >
                    <Button 
                      icon={<PoweroffOutlined />} 
                      danger 
                      block
                    >
                      重启系统
                    </Button>
                  </Popconfirm>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* 通知设置 */}
        <TabPane tab={<span><BellOutlined />通知设置</span>} key="3">
          <Card title="通知偏好">
            <Form
              form={notificationForm}
              layout="vertical"
              onFinish={handleNotificationSubmit}
            >
              <Title level={4}>邮件通知</Title>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item name={['emailNotifications', 'orderUpdates']} valuePropName="checked">
                    <Checkbox>订单更新</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['emailNotifications', 'userRegistrations']} valuePropName="checked">
                    <Checkbox>用户注册</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['emailNotifications', 'systemAlerts']} valuePropName="checked">
                    <Checkbox>系统警报</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['emailNotifications', 'marketingEmails']} valuePropName="checked">
                    <Checkbox>营销邮件</Checkbox>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={4}>短信通知</Title>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item name={['smsNotifications', 'orderUpdates']} valuePropName="checked">
                    <Checkbox>订单更新</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['smsNotifications', 'systemAlerts']} valuePropName="checked">
                    <Checkbox>系统警报</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['smsNotifications', 'securityAlerts']} valuePropName="checked">
                    <Checkbox>安全警报</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['smsNotifications', 'emergencyAlerts']} valuePropName="checked">
                    <Checkbox>紧急警报</Checkbox>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={4}>推送通知</Title>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item name={['pushNotifications', 'orderUpdates']} valuePropName="checked">
                    <Checkbox>订单更新</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['pushNotifications', 'userActivities']} valuePropName="checked">
                    <Checkbox>用户活动</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['pushNotifications', 'systemAlerts']} valuePropName="checked">
                    <Checkbox>系统警报</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['pushNotifications', 'promotions']} valuePropName="checked">
                    <Checkbox>促销活动</Checkbox>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="notificationFrequency" label="通知频率">
                    <Select>
                      <Option value="immediate">立即</Option>
                      <Option value="hourly">每小时</Option>
                      <Option value="daily">每日</Option>
                      <Option value="weekly">每周</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name={['quietHours', 'enabled']} label="免打扰时间" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name={['quietHours', 'startTime']} label="开始时间">
                    <TimePicker format="HH:mm" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name={['quietHours', 'endTime']} label="结束时间">
                    <TimePicker format="HH:mm" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        {/* 安全设置 */}
        <TabPane tab={<span><SecurityScanOutlined />安全设置</span>} key="4">
          <Row gutter={24}>
            <Col span={16}>
              <Card title="安全配置">
                <Form
                  form={securityForm}
                  layout="vertical"
                  onFinish={handleSecuritySubmit}
                >
                  <Title level={4}>认证设置</Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="twoFactorEnabled" label="双因子认证" valuePropName="checked">
                        <Switch 
                          onChange={(checked) => {
                            if (checked && !securitySettings?.twoFactorEnabled) {
                              handleEnableTwoFactor();
                            }
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="loginNotifications" label="登录通知" valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider />

                  <Title level={4}>会话管理</Title>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name={['sessionManagement', 'maxSessions']} label="最大会话数">
                        <InputNumber min={1} max={10} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['sessionManagement', 'sessionTimeout']} label="会话超时(分钟)">
                        <InputNumber min={5} max={1440} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['sessionManagement', 'rememberMeDuration']} label="记住我(天)">
                        <InputNumber min={1} max={30} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider />

                  <Title level={4}>密码策略</Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name={['passwordPolicy', 'minLength']} label="最小长度">
                        <InputNumber min={6} max={32} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name={['passwordPolicy', 'passwordExpiry']} label="密码过期(天)">
                        <InputNumber min={0} max={365} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item name={['passwordPolicy', 'requireUppercase']} valuePropName="checked">
                        <Checkbox>需要大写字母</Checkbox>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['passwordPolicy', 'requireLowercase']} valuePropName="checked">
                        <Checkbox>需要小写字母</Checkbox>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['passwordPolicy', 'requireNumbers']} valuePropName="checked">
                        <Checkbox>需要数字</Checkbox>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['passwordPolicy', 'requireSpecialChars']} valuePropName="checked">
                        <Checkbox>需要特殊字符</Checkbox>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      保存设置
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col span={8}>
              <Card title="安全状态">
                <Alert
                  message="安全评分"
                  description={
                    <div>
                      <Progress 
                        percent={85} 
                        strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                      />
                      <Text type="secondary">您的账户安全性良好</Text>
                    </div>
                  }
                  type="success"
                  style={{ marginBottom: 16 }}
                />

                <List>
                  <List.Item>
                    <Text strong>双因子认证:</Text>
                    <Tag color={securitySettings?.twoFactorEnabled ? 'green' : 'red'}>
                      {securitySettings?.twoFactorEnabled ? '已启用' : '未启用'}
                    </Tag>
                  </List.Item>
                  <List.Item>
                    <Text strong>登录通知:</Text>
                    <Tag color={securitySettings?.loginNotifications ? 'green' : 'orange'}>
                      {securitySettings?.loginNotifications ? '已启用' : '未启用'}
                    </Tag>
                  </List.Item>
                  <List.Item>
                    <Text strong>最大登录尝试:</Text>
                    <Text>{securitySettings?.maxLoginAttempts}次</Text>
                  </List.Item>
                  <List.Item>
                    <Text strong>锁定时长:</Text>
                    <Text>{securitySettings?.lockoutDuration}分钟</Text>
                  </List.Item>
                </List>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* 备份设置 */}
        <TabPane tab={<span><DatabaseOutlined />备份管理</span>} key="5">
          <Row gutter={24}>
            <Col span={16}>
              <Card title="备份设置">
                <Form
                  form={backupForm}
                  layout="vertical"
                  onFinish={handleBackupSubmit}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="autoBackup" label="自动备份" valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="backupFrequency" label="备份频率">
                        <Select>
                          <Option value="daily">每日</Option>
                          <Option value="weekly">每周</Option>
                          <Option value="monthly">每月</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="backupTime" label="备份时间">
                        <TimePicker format="HH:mm" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="retentionPeriod" label="保留天数">
                        <InputNumber min={1} max={365} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="backupLocation" label="备份位置">
                        <Select>
                          <Option value="local">本地</Option>
                          <Option value="cloud">云端</Option>
                          <Option value="both">本地+云端</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="encryptBackups" label="加密备份" valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Title level={4}>备份内容</Title>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item name="includeDatabase" valuePropName="checked">
                        <Checkbox>数据库</Checkbox>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="includeUploads" valuePropName="checked">
                        <Checkbox>上传文件</Checkbox>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="includeLogs" valuePropName="checked">
                        <Checkbox>日志文件</Checkbox>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit" loading={loading}>
                        保存设置
                      </Button>
                      <Button 
                        icon={<CloudUploadOutlined />} 
                        onClick={handleCreateBackup}
                        loading={loading}
                      >
                        立即备份
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>

              <Card title="备份记录" style={{ marginTop: 16 }}>
                <Table
                  columns={backupColumns}
                  dataSource={backupRecords}
                  rowKey="id"
                  pagination={{
                    ...backupPagination,
                    onChange: (page, pageSize) => loadBackupRecords(page, pageSize),
                  }}
                />
              </Card>
            </Col>

            <Col span={8}>
              <Card title="存储信息">
                <Statistic
                  title="总备份大小"
                  value={backupRecords.reduce((sum, record) => sum + record.size, 0)}
                  formatter={(value) => `${((value as number) / 1024 / 1024 / 1024).toFixed(2)} GB`}
                  style={{ marginBottom: 16 }}
                />

                <Statistic
                  title="备份数量"
                  value={backupRecords.length}
                  suffix="个"
                  style={{ marginBottom: 16 }}
                />

                <Statistic
                  title="最后备份"
                  value={backupRecords[0]?.createdAt}
                  formatter={(value) => value ? dayjs(value as string).format('MM-DD HH:mm') : '无'}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordSubmit}
        >
          <Form.Item
            name="currentPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                确认修改
              </Button>
              <Button onClick={() => setPasswordModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 双因子认证模态框 */}
      <Modal
        title="启用双因子认证"
        open={twoFactorModalVisible}
        onCancel={() => setTwoFactorModalVisible(false)}
        footer={null}
      >
        <div style={{ textAlign: 'center' }}>
          <Alert
            message="请使用认证应用扫描二维码"
            description="推荐使用 Google Authenticator 或 Microsoft Authenticator"
            type="info"
            style={{ marginBottom: 16 }}
          />
          
          {qrCode && (
            <div style={{ marginBottom: 16 }}>
              <img src={qrCode} alt="QR Code" style={{ width: 200, height: 200 }} />
            </div>
          )}

          <Form
            onFinish={(values) => handleVerifyTwoFactor(values.code)}
          >
            <Form.Item
              name="code"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <Input placeholder="请输入6位验证码" maxLength={6} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  验证并启用
                </Button>
                <Button onClick={() => setTwoFactorModalVisible(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}
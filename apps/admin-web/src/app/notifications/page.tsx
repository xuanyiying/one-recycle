'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Space,
    Tag,
    message,
    Card,
    Row,
    Col,
    Statistic,
    Spin,
    Alert,
    Tooltip,
    Popconfirm,
    DatePicker,
    Upload,
    Image,
    Tabs,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SendOutlined,
    EyeOutlined,
    ReloadOutlined,
    ExportOutlined,
    BellOutlined,
    MessageOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    UploadOutlined,
    CopyOutlined,
} from '@ant-design/icons';
import {
    notificationService,
    type Notification,
    type NotificationStats,
    type NotificationTemplate,
    type CreateNotificationRequest,
    type UpdateNotificationRequest,
    type CreateTemplateRequest,
    NotificationType,
    NotificationStatus,
    NotificationPriority,
    RecipientType,
} from '../../services/notificationService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// 本地通知接口，添加key字段用于Table组件
interface LocalNotification extends Notification {
    key: string;
}

// 本地模板接口，添加key字段用于Table组件
interface LocalTemplate extends NotificationTemplate {
    key: string;
}

const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<LocalNotification[]>([]);
    const [templates, setTemplates] = useState<LocalTemplate[]>([]);
    const [stats, setStats] = useState<NotificationStats>({
        totalNotifications: 0,
        sentNotifications: 0,
        scheduledNotifications: 0,
        draftNotifications: 0,
        failedNotifications: 0,
        totalReads: 0,
        totalClicks: 0,
        averageReadRate: 0,
        averageClickRate: 0,
    });
    const [loading, setLoading] = useState(false);
    const [templateLoading, setTemplateLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [templatePagination, setTemplatePagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
    const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
    const [searchText, setSearchText] = useState('');
    const [typeFilter, setTypeFilter] = useState<NotificationType | undefined>();
    const [statusFilter, setStatusFilter] = useState<NotificationStatus | undefined>();
    const [activeTab, setActiveTab] = useState('notifications');
    const [form] = Form.useForm();
    const [templateForm] = Form.useForm();

    // 获取通知列表
    const fetchNotifications = useCallback(async (page = 1, pageSize = 10) => {
        try {
            setLoading(true);
            setError(null);
            const response = await notificationService.getNotifications({
                page,
                pageSize,
                search: searchText || undefined,
                type: typeFilter,
                status: statusFilter,
                sortBy: 'createdAt',
                sortOrder: 'desc',
            });

            const notificationsWithKeys = response.data.map(notification => ({
                ...notification,
                key: notification.id,
            }));

            setNotifications(notificationsWithKeys);
            setPagination({
                current: page,
                pageSize,
                total: response.total,
            });
        } catch (err) {
            setError('获取通知列表失败');
            console.error('获取通知列表失败:', err);
        } finally {
            setLoading(false);
        }
    }, [searchText, typeFilter, statusFilter]);

    // 获取模板列表
    const fetchTemplates = useCallback(async (page = 1, pageSize = 10) => {
        try {
            setTemplateLoading(true);
            const response = await notificationService.getTemplates({
                page,
                pageSize,
                sortBy: 'createdAt',
                sortOrder: 'desc',
            });

            const templatesWithKeys = response.data.map(template => ({
                ...template,
                key: template.id,
            }));

            setTemplates(templatesWithKeys);
            setTemplatePagination({
                current: page,
                pageSize,
                total: response.total,
            });
        } catch (err) {
            console.error('获取模板列表失败:', err);
        } finally {
            setTemplateLoading(false);
        }
    }, []);

    // 获取统计信息
    const fetchStats = useCallback(async () => {
        try {
            const statsData = await notificationService.getNotificationStats();
            setStats(statsData);
        } catch (err) {
            console.error('获取统计信息失败:', err);
        }
    }, []);

    // 初始化数据
    useEffect(() => {
        fetchNotifications();
        fetchStats();
        if (activeTab === 'templates') {
            fetchTemplates();
        }
    }, [fetchNotifications, fetchStats, fetchTemplates, activeTab]);

    // 处理搜索
    const handleSearch = () => {
        fetchNotifications(1, pagination.pageSize);
    };

    // 处理刷新
    const handleRefresh = () => {
        if (activeTab === 'notifications') {
            fetchNotifications(pagination.current, pagination.pageSize);
            fetchStats();
        } else {
            fetchTemplates(templatePagination.current, templatePagination.pageSize);
        }
    };

    // 处理分页变化
    const handleTableChange = (paginationConfig: any) => {
        if (activeTab === 'notifications') {
            fetchNotifications(paginationConfig.current, paginationConfig.pageSize);
        } else {
            fetchTemplates(paginationConfig.current, paginationConfig.pageSize);
        }
    };

    // 查看详情
    const handleViewDetails = (notification: Notification) => {
        setSelectedNotification(notification);
        setIsDetailModalVisible(true);
    };

    // 添加通知
    const handleAddNotification = () => {
        setEditingNotification(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    // 编辑通知
    const handleEditNotification = (notification: Notification) => {
        setEditingNotification(notification);
        form.setFieldsValue({
            ...notification,
            scheduledTime: notification.scheduledTime ? dayjs(notification.scheduledTime) : undefined,
        });
        setIsModalVisible(true);
    };

    // 删除通知
    const handleDeleteNotification = async (notificationId: string) => {
        try {
            await notificationService.deleteNotification(notificationId);
            message.success('通知删除成功');
            fetchNotifications(pagination.current, pagination.pageSize);
            fetchStats();
        } catch (err) {
            message.error('删除失败');
            console.error('删除通知失败:', err);
        }
    };

    // 发送通知
    const handleSendNotification = async (notificationId: string) => {
        try {
            await notificationService.sendNotification({ notificationId, sendNow: true });
            message.success('通知发送成功');
            fetchNotifications(pagination.current, pagination.pageSize);
            fetchStats();
        } catch (err) {
            message.error('发送失败');
            console.error('发送通知失败:', err);
        }
    };

    // 处理通知表单提交
    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            
            if (editingNotification) {
                // 编辑通知
                const updateData: UpdateNotificationRequest = {
                    title: values.title,
                    content: values.content,
                    type: values.type,
                    priority: values.priority,
                    recipientType: values.recipientType,
                    scheduledTime: values.scheduledTime ? values.scheduledTime.toISOString() : undefined,
                    imageUrl: values.imageUrl,
                    actionUrl: values.actionUrl,
                    actionText: values.actionText,
                };
                await notificationService.updateNotification(editingNotification.id, updateData);
                message.success('通知更新成功');
            } else {
                // 添加通知
                const createData: CreateNotificationRequest = {
                    title: values.title,
                    content: values.content,
                    type: values.type,
                    priority: values.priority,
                    recipientType: values.recipientType,
                    scheduledTime: values.scheduledTime ? values.scheduledTime.toISOString() : undefined,
                    imageUrl: values.imageUrl,
                    actionUrl: values.actionUrl,
                    actionText: values.actionText,
                };
                await notificationService.createNotification(createData);
                message.success('通知创建成功');
            }

            setIsModalVisible(false);
            form.resetFields();
            fetchNotifications(pagination.current, pagination.pageSize);
            fetchStats();
        } catch (err) {
            message.error(editingNotification ? '更新失败' : '创建失败');
            console.error('操作失败:', err);
        }
    };

    // 添加模板
    const handleAddTemplate = () => {
        setEditingTemplate(null);
        templateForm.resetFields();
        setIsTemplateModalVisible(true);
    };

    // 编辑模板
    const handleEditTemplate = (template: NotificationTemplate) => {
        setEditingTemplate(template);
        templateForm.setFieldsValue(template);
        setIsTemplateModalVisible(true);
    };

    // 删除模板
    const handleDeleteTemplate = async (templateId: string) => {
        try {
            await notificationService.deleteTemplate(templateId);
            message.success('模板删除成功');
            fetchTemplates(templatePagination.current, templatePagination.pageSize);
        } catch (err) {
            message.error('删除失败');
            console.error('删除模板失败:', err);
        }
    };

    // 从模板创建通知
    const handleCreateFromTemplate = async (template: NotificationTemplate) => {
        try {
            const notification = await notificationService.createFromTemplate(template.id, {
                title: template.title,
                content: template.content,
                type: template.type,
                priority: template.priority,
            });
            message.success('从模板创建通知成功');
            setActiveTab('notifications');
            fetchNotifications(1, pagination.pageSize);
        } catch (err) {
            message.error('创建失败');
            console.error('从模板创建通知失败:', err);
        }
    };

    // 处理模板表单提交
    const handleTemplateModalOk = async () => {
        try {
            const values = await templateForm.validateFields();
            
            if (editingTemplate) {
                // 编辑模板
                await notificationService.updateTemplate(editingTemplate.id, values);
                message.success('模板更新成功');
            } else {
                // 添加模板
                const createData: CreateTemplateRequest = {
                    name: values.name,
                    title: values.title,
                    content: values.content,
                    type: values.type,
                    priority: values.priority,
                };
                await notificationService.createTemplate(createData);
                message.success('模板创建成功');
            }

            setIsTemplateModalVisible(false);
            templateForm.resetFields();
            fetchTemplates(templatePagination.current, templatePagination.pageSize);
        } catch (err) {
            message.error(editingTemplate ? '更新失败' : '创建失败');
            console.error('操作失败:', err);
        }
    };

    // 导出数据
    const handleExport = async () => {
        try {
            const blob = await notificationService.exportNotifications({
                search: searchText || undefined,
                type: typeFilter,
                status: statusFilter,
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `notifications_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            message.success('导出成功');
        } catch (err) {
            message.error('导出失败');
            console.error('导出失败:', err);
        }
    };

    // 获取类型标签
    const getTypeTag = (type: NotificationType) => {
        const typeMap = {
            [NotificationType.SYSTEM]: { color: 'blue', text: '系统' },
            [NotificationType.ORDER]: { color: 'green', text: '订单' },
            [NotificationType.PROMOTION]: { color: 'orange', text: '促销' },
            [NotificationType.MAINTENANCE]: { color: 'red', text: '维护' },
        };
        const config = typeMap[type];
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    // 获取状态标签
    const getStatusTag = (status: NotificationStatus) => {
        const statusMap = {
            [NotificationStatus.DRAFT]: { color: 'default', text: '草稿' },
            [NotificationStatus.SCHEDULED]: { color: 'blue', text: '已安排' },
            [NotificationStatus.SENT]: { color: 'green', text: '已发送' },
            [NotificationStatus.FAILED]: { color: 'red', text: '发送失败' },
        };
        const config = statusMap[status];
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    // 获取优先级标签
    const getPriorityTag = (priority: NotificationPriority) => {
        const priorityMap = {
            [NotificationPriority.LOW]: { color: 'default', text: '低' },
            [NotificationPriority.MEDIUM]: { color: 'blue', text: '中' },
            [NotificationPriority.HIGH]: { color: 'orange', text: '高' },
            [NotificationPriority.URGENT]: { color: 'red', text: '紧急' },
        };
        const config = priorityMap[priority];
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    // 通知表格列定义
    const notificationColumns = [
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            ellipsis: true,
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 80,
            render: (type: NotificationType) => getTypeTag(type),
        },
        {
            title: '优先级',
            dataIndex: 'priority',
            key: 'priority',
            width: 80,
            render: (priority: NotificationPriority) => getPriorityTag(priority),
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: NotificationStatus) => getStatusTag(status),
        },
        {
            title: '接收者',
            dataIndex: 'totalRecipients',
            key: 'totalRecipients',
            width: 80,
            render: (count: number) => `${count}人`,
        },
        {
            title: '已读',
            dataIndex: 'readCount',
            key: 'readCount',
            width: 80,
            render: (count: number, record: LocalNotification) => 
                `${count}/${record.totalRecipients}`,
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (record: LocalNotification) => (
                <Space size="small">
                    <Tooltip title="查看详情">
                        <Button
                            type="link"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>
                    <Tooltip title="编辑">
                        <Button
                            type="link"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditNotification(record)}
                            disabled={record.status === NotificationStatus.SENT}
                        />
                    </Tooltip>
                    {record.status === NotificationStatus.DRAFT && (
                        <Tooltip title="发送">
                            <Button
                                type="link"
                                size="small"
                                icon={<SendOutlined />}
                                onClick={() => handleSendNotification(record.id)}
                            />
                        </Tooltip>
                    )}
                    <Popconfirm
                        title="确定要删除这个通知吗？"
                        onConfirm={() => handleDeleteNotification(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Tooltip title="删除">
                            <Button
                                type="link"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // 模板表格列定义
    const templateColumns = [
        {
            title: '模板名称',
            dataIndex: 'name',
            key: 'name',
            width: 150,
        },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            ellipsis: true,
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 80,
            render: (type: NotificationType) => getTypeTag(type),
        },
        {
            title: '优先级',
            dataIndex: 'priority',
            key: 'priority',
            width: 80,
            render: (priority: NotificationPriority) => getPriorityTag(priority),
        },
        {
            title: '使用次数',
            dataIndex: 'usageCount',
            key: 'usageCount',
            width: 80,
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (record: LocalTemplate) => (
                <Space size="small">
                    <Tooltip title="使用模板">
                        <Button
                            type="link"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => handleCreateFromTemplate(record)}
                        />
                    </Tooltip>
                    <Tooltip title="编辑">
                        <Button
                            type="link"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditTemplate(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="确定要删除这个模板吗？"
                        onConfirm={() => handleDeleteTemplate(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Tooltip title="删除">
                            <Button
                                type="link"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            {/* 统计卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="总通知数"
                            value={stats.totalNotifications}
                            prefix={<BellOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="已发送"
                            value={stats.sentNotifications}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="已安排"
                            value={stats.scheduledNotifications}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="平均阅读率"
                            value={stats.averageReadRate}
                            precision={1}
                            suffix="%"
                            prefix={<MessageOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 错误提示 */}
            {error && (
                <Alert
                    message="错误"
                    description={error}
                    type="error"
                    closable
                    style={{ marginBottom: 16 }}
                    onClose={() => setError(null)}
                />
            )}

            {/* 主要内容 */}
            <Card>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="通知管理" key="notifications">
                        {/* 操作栏 */}
                        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
                            <Col flex="auto">
                                <Space>
                                    <Input.Search
                                        placeholder="搜索通知标题、内容"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onSearch={handleSearch}
                                        style={{ width: 250 }}
                                        allowClear
                                    />
                                    <Select
                                        placeholder="类型筛选"
                                        value={typeFilter}
                                        onChange={setTypeFilter}
                                        style={{ width: 120 }}
                                        allowClear
                                    >
                                        <Option value={NotificationType.SYSTEM}>系统</Option>
                                        <Option value={NotificationType.ORDER}>订单</Option>
                                        <Option value={NotificationType.PROMOTION}>促销</Option>
                                        <Option value={NotificationType.MAINTENANCE}>维护</Option>
                                    </Select>
                                    <Select
                                        placeholder="状态筛选"
                                        value={statusFilter}
                                        onChange={setStatusFilter}
                                        style={{ width: 120 }}
                                        allowClear
                                    >
                                        <Option value={NotificationStatus.DRAFT}>草稿</Option>
                                        <Option value={NotificationStatus.SCHEDULED}>已安排</Option>
                                        <Option value={NotificationStatus.SENT}>已发送</Option>
                                        <Option value={NotificationStatus.FAILED}>发送失败</Option>
                                    </Select>
                                </Space>
                            </Col>
                            <Col>
                                <Space>
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={handleRefresh}
                                        loading={loading}
                                    >
                                        刷新
                                    </Button>
                                    <Button
                                        icon={<ExportOutlined />}
                                        onClick={handleExport}
                                    >
                                        导出
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddNotification}
                                    >
                                        创建通知
                                    </Button>
                                </Space>
                            </Col>
                        </Row>

                        {/* 通知表格 */}
                        <Spin spinning={loading}>
                            <Table
                                columns={notificationColumns}
                                dataSource={notifications}
                                pagination={{
                                    ...pagination,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total, range) =>
                                        `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                                }}
                                onChange={handleTableChange}
                                scroll={{ x: 1200 }}
                            />
                        </Spin>
                    </TabPane>

                    <TabPane tab="通知模板" key="templates">
                        {/* 模板操作栏 */}
                        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
                            <Col flex="auto">
                                <Space>
                                    {/* 模板搜索功能可以后续添加 */}
                                </Space>
                            </Col>
                            <Col>
                                <Space>
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={handleRefresh}
                                        loading={templateLoading}
                                    >
                                        刷新
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddTemplate}
                                    >
                                        创建模板
                                    </Button>
                                </Space>
                            </Col>
                        </Row>

                        {/* 模板表格 */}
                        <Spin spinning={templateLoading}>
                            <Table
                                columns={templateColumns}
                                dataSource={templates}
                                pagination={{
                                    ...templatePagination,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total, range) =>
                                        `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                                }}
                                onChange={handleTableChange}
                                scroll={{ x: 1000 }}
                            />
                        </Spin>
                    </TabPane>
                </Tabs>
            </Card>

            {/* 创建/编辑通知模态框 */}
            <Modal
                title={editingNotification ? '编辑通知' : '创建通知'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                width={800}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="title"
                                label="通知标题"
                                rules={[{ required: true, message: '请输入通知标题' }]}
                            >
                                <Input placeholder="请输入通知标题" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="type"
                                label="通知类型"
                                rules={[{ required: true, message: '请选择通知类型' }]}
                            >
                                <Select placeholder="请选择通知类型">
                                    <Option value={NotificationType.SYSTEM}>系统通知</Option>
                                    <Option value={NotificationType.ORDER}>订单通知</Option>
                                    <Option value={NotificationType.PROMOTION}>促销通知</Option>
                                    <Option value={NotificationType.MAINTENANCE}>维护通知</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="priority"
                                label="优先级"
                                rules={[{ required: true, message: '请选择优先级' }]}
                            >
                                <Select placeholder="请选择优先级">
                                    <Option value={NotificationPriority.LOW}>低</Option>
                                    <Option value={NotificationPriority.MEDIUM}>中</Option>
                                    <Option value={NotificationPriority.HIGH}>高</Option>
                                    <Option value={NotificationPriority.URGENT}>紧急</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="recipientType"
                                label="接收者类型"
                                rules={[{ required: true, message: '请选择接收者类型' }]}
                            >
                                <Select placeholder="请选择接收者类型">
                                    <Option value={RecipientType.ALL_USERS}>所有用户</Option>
                                    <Option value={RecipientType.SPECIFIC_USERS}>指定用户</Option>
                                    <Option value={RecipientType.USER_GROUP}>用户组</Option>
                                    <Option value={RecipientType.COURIERS}>骑手</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="content"
                        label="通知内容"
                        rules={[{ required: true, message: '请输入通知内容' }]}
                    >
                        <TextArea rows={4} placeholder="请输入通知内容" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="scheduledTime" label="定时发送">
                                <DatePicker
                                    showTime
                                    placeholder="选择发送时间"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="actionText" label="操作按钮文字">
                                <Input placeholder="如：查看详情" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="actionUrl" label="操作链接">
                        <Input placeholder="点击通知后跳转的链接" />
                    </Form.Item>
                    <Form.Item name="imageUrl" label="图片链接">
                        <Input placeholder="通知图片URL" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 创建/编辑模板模态框 */}
            <Modal
                title={editingTemplate ? '编辑模板' : '创建模板'}
                open={isTemplateModalVisible}
                onOk={handleTemplateModalOk}
                onCancel={() => {
                    setIsTemplateModalVisible(false);
                    templateForm.resetFields();
                }}
                width={600}
                destroyOnClose
            >
                <Form form={templateForm} layout="vertical">
                    <Form.Item
                        name="name"
                        label="模板名称"
                        rules={[{ required: true, message: '请输入模板名称' }]}
                    >
                        <Input placeholder="请输入模板名称" />
                    </Form.Item>
                    <Form.Item
                        name="title"
                        label="通知标题"
                        rules={[{ required: true, message: '请输入通知标题' }]}
                    >
                        <Input placeholder="请输入通知标题" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="type"
                                label="通知类型"
                                rules={[{ required: true, message: '请选择通知类型' }]}
                            >
                                <Select placeholder="请选择通知类型">
                                    <Option value={NotificationType.SYSTEM}>系统通知</Option>
                                    <Option value={NotificationType.ORDER}>订单通知</Option>
                                    <Option value={NotificationType.PROMOTION}>促销通知</Option>
                                    <Option value={NotificationType.MAINTENANCE}>维护通知</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="priority"
                                label="优先级"
                                rules={[{ required: true, message: '请选择优先级' }]}
                            >
                                <Select placeholder="请选择优先级">
                                    <Option value={NotificationPriority.LOW}>低</Option>
                                    <Option value={NotificationPriority.MEDIUM}>中</Option>
                                    <Option value={NotificationPriority.HIGH}>高</Option>
                                    <Option value={NotificationPriority.URGENT}>紧急</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="content"
                        label="通知内容"
                        rules={[{ required: true, message: '请输入通知内容' }]}
                    >
                        <TextArea rows={4} placeholder="请输入通知内容" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 通知详情模态框 */}
            <Modal
                title="通知详情"
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
                        关闭
                    </Button>,
                ]}
                width={600}
            >
                {selectedNotification && (
                    <div>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Card title="基本信息" size="small">
                                    <p><strong>标题：</strong>{selectedNotification.title}</p>
                                    <p><strong>类型：</strong>{getTypeTag(selectedNotification.type)}</p>
                                    <p><strong>优先级：</strong>{getPriorityTag(selectedNotification.priority)}</p>
                                    <p><strong>状态：</strong>{getStatusTag(selectedNotification.status)}</p>
                                    <p><strong>内容：</strong>{selectedNotification.content}</p>
                                </Card>
                            </Col>
                            <Col span={24}>
                                <Card title="发送统计" size="small">
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <Statistic title="总接收者" value={selectedNotification.totalRecipients} />
                                        </Col>
                                        <Col span={8}>
                                            <Statistic title="已读数" value={selectedNotification.readCount} />
                                        </Col>
                                        <Col span={8}>
                                            <Statistic title="点击数" value={selectedNotification.clickCount} />
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default NotificationsPage;
'use client';

import React, { useState, useEffect } from 'react';
import { dashboardApi, DashboardStats, RecentOrder, InventoryAlert } from '@/services/dashboardApi';
import {
    Card,
    Row,
    Col,
    Statistic,
    Progress,
    Table,
    Tag,
    Button,
    Space,
    List,
    Avatar,
    Typography,
    Alert,
} from 'antd';
import {
    ShoppingCartOutlined,
    UserOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    RiseOutlined,
    EyeOutlined,
    ReloadOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalOrders: 0,
        todayOrders: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        totalUsers: 0,
        activeUsers: 0,
        pendingOrders: 0,
        completedOrders: 0,
        orderGrowth: 0,
        revenueGrowth: 0,
    });

    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);

    // 加载仪表板数据
    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const data = await dashboardApi.refreshDashboardData();
            
            setStats(data.stats);
            setRecentOrders(data.recentOrders);
            setInventoryAlerts(data.inventoryAlerts);
        } catch (error) {
            console.error('加载仪表板数据失败:', error);
            // 可以在这里添加错误提示
        } finally {
            setLoading(false);
        }
    };

    // 组件挂载时加载数据
    useEffect(() => {
        loadDashboardData();
    }, []);

    // 状态标签映射
    const getStatusTag = (status: string) => {
        const statusMap = {
            PENDING: { color: 'orange', text: '待处理' },
            CONFIRMED: { color: 'blue', text: '已确认' },
            PROCESSING: { color: 'purple', text: '处理中' },
            COMPLETED: { color: 'green', text: '已完成' },
            CANCELLED: { color: 'red', text: '已取消' },
        };
        const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    // 刷新数据
    const handleRefresh = async () => {
        await loadDashboardData();
    };

    const orderColumns = [
        {
            title: '订单号',
            dataIndex: 'orderNo',
            key: 'orderNo',
            width: 150,
        },
        {
            title: '客户',
            dataIndex: 'customer',
            key: 'customer',
            width: 100,
        },
        {
            title: '金额',
            dataIndex: 'amount',
            key: 'amount',
            width: 100,
            render: (amount: number) => `¥${amount.toFixed(2)}`,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: string) => getStatusTag(status),
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (date: string) => date.split(' ')[0],
        },
        {
            title: '操作',
            key: 'action',
            width: 80,
            render: (record: RecentOrder) => (
                <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => window.location.href = `/orders/${record.id}`}
                >
                    查看
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            {/* 页面标题和操作 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>
                    仪表板
                </Title>
                <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    loading={loading}
                    onClick={handleRefresh}
                >
                    刷新数据
                </Button>
            </div>

            {/* 统计卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="总订单数"
                            value={stats.totalOrders}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                            suffix={
                                <div style={{ fontSize: '12px', color: '#52c41a' }}>
                                    <RiseOutlined /> {stats.orderGrowth}%
                                </div>
                            }
                        />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            今日新增: {stats.todayOrders}
                        </Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="总收入"
                            value={stats.totalRevenue}
                            precision={2}
                            prefix="¥"
                            valueStyle={{ color: '#52c41a' }}
                            suffix={
                                <div style={{ fontSize: '12px', color: '#52c41a' }}>
                                    <RiseOutlined /> {stats.revenueGrowth}%
                                </div>
                            }
                        />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            今日收入: ¥{stats.todayRevenue.toFixed(2)}
                        </Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="用户总数"
                            value={stats.totalUsers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            活跃用户: {stats.activeUsers}
                        </Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="待处理订单"
                            value={stats.pendingOrders}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            已完成: {stats.completedOrders}
                        </Text>
                    </Card>
                </Col>
            </Row>

            {/* 订单完成率和库存预警 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={12}>
                    <Card title="订单完成率" extra={<CheckCircleOutlined />}>
                        <Progress
                            percent={Math.round((stats.completedOrders / stats.totalOrders) * 100)}
                            status="active"
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                        />
                        <div style={{ marginTop: 16 }}>
                            <Row>
                                <Col span={12}>
                                    <Statistic
                                        title="已完成"
                                        value={stats.completedOrders}
                                        valueStyle={{ fontSize: '16px' }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="待处理"
                                        value={stats.pendingOrders}
                                        valueStyle={{ fontSize: '16px', color: '#fa8c16' }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card
                        title="库存预警"
                        extra={<WarningOutlined style={{ color: '#ff4d4f' }} />}
                    >
                        {inventoryAlerts.length > 0 ? (
                            <List
                                size="small"
                                dataSource={inventoryAlerts}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    style={{
                                                        backgroundColor: item.status === 'out' ? '#ff4d4f' : '#fa8c16',
                                                    }}
                                                    icon={<WarningOutlined />}
                                                />
                                            }
                                            title={item.categoryName}
                                            description={
                                                <Space>
                                                    <Text type="secondary">
                                                        当前库存: {item.currentStock}
                                                    </Text>
                                                    <Text type="secondary">
                                                        最低库存: {item.minStock}
                                                    </Text>
                                                    <Tag color={item.status === 'out' ? 'red' : 'orange'}>
                                                        {item.status === 'out' ? '缺货' : '库存不足'}
                                                    </Tag>
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Alert
                                message="库存充足"
                                description="所有商品库存正常"
                                type="success"
                                showIcon
                            />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* 最近订单 */}
            <Card
                title="最近订单"
                extra={
                    <Space>
                        <Button
                            type="link"
                            onClick={() => window.location.href = '/orders'}
                        >
                            查看全部
                        </Button>
                    </Space>
                }
            >
                <Table
                    dataSource={recentOrders}
                    columns={orderColumns}
                    pagination={false}
                    size="small"
                    loading={loading}
                    rowKey="id"
                />
            </Card>
        </div>
    );
};

export default DashboardPage;
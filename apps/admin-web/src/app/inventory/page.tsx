'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Layout,
    Menu,
    Card,
    Row,
    Col,
    Statistic,
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Space,
    Tag,
    message,
    Spin,
    Alert,
    Pagination,
    Tooltip,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    DatabaseOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    ReloadOutlined,
    ExportOutlined,
} from '@ant-design/icons';
import type {
    InventoryItem,
    InventoryStats,
    InventoryStatus,
    InventoryQueryParams,
    InventoryListResponse,
    CreateInventoryRequest,
    UpdateInventoryRequest,
    InventoryAdjustment,
    InventoryAlert,
} from '../../services/inventoryService';
import { inventoryService } from '../../services/inventoryService';

const { Content, Sider } = Layout;
const { Option } = Select;

// 本地接口，扩展API接口以支持Table组件
interface LocalInventoryItem extends InventoryItem {
    key: string;
}

interface LocalInventoryAdjustment extends InventoryAdjustment {
    key: string;
}

const InventoryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('items');
    const [inventoryItems, setInventoryItems] = useState<LocalInventoryItem[]>([]);
    const [adjustments, setAdjustments] = useState<LocalInventoryAdjustment[]>([]);
    const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
    const [stats, setStats] = useState<InventoryStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isAdjustModalVisible, setIsAdjustModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [filters, setFilters] = useState<InventoryQueryParams>({});
    const [form] = Form.useForm();
    const [adjustForm] = Form.useForm();

    // 获取库存列表
    const fetchInventoryItems = useCallback(async (params: InventoryQueryParams = {}) => {
        try {
            setLoading(true);
            setError(null);
            
            const queryParams = {
                page: pagination.current,
                pageSize: pagination.pageSize,
                ...filters,
                ...params,
            };

            const response: InventoryListResponse = await inventoryService.getInventoryItems(queryParams);
            
            const itemsWithKeys = response.items.map(item => ({
                ...item,
                key: item.id,
            }));

            setInventoryItems(itemsWithKeys);
            setPagination(prev => ({
                ...prev,
                total: response.total,
                current: response.page,
                pageSize: response.pageSize,
            }));
        } catch (error: any) {
            console.error('获取库存列表失败:', error);
            setError(error.message || '获取库存列表失败');
            message.error('获取库存列表失败');
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize, filters]);

    // 获取库存统计
    const fetchInventoryStats = useCallback(async () => {
        try {
            const statsData = await inventoryService.getInventoryStats();
            setStats(statsData);
        } catch (error: any) {
            console.error('获取库存统计失败:', error);
            message.error('获取库存统计失败');
        }
    }, []);

    // 获取库存预警
    const fetchInventoryAlerts = useCallback(async () => {
        try {
            const alertsData = await inventoryService.getInventoryAlerts();
            setAlerts(alertsData);
        } catch (error: any) {
            console.error('获取库存预警失败:', error);
            message.error('获取库存预警失败');
        }
    }, []);

    // 获取库存调整记录
    const fetchInventoryAdjustments = useCallback(async (inventoryId: string) => {
        try {
            setLoading(true);
            const adjustmentsData = await inventoryService.getInventoryAdjustments(inventoryId);
            const adjustmentsWithKeys = adjustmentsData.map(adj => ({
                ...adj,
                key: adj.id,
            }));
            setAdjustments(adjustmentsWithKeys);
        } catch (error: any) {
            console.error('获取调整记录失败:', error);
            message.error('获取调整记录失败');
        } finally {
            setLoading(false);
        }
    }, []);

    // 初始化数据
    useEffect(() => {
        if (activeTab === 'items') {
            fetchInventoryItems();
            fetchInventoryStats();
        } else if (activeTab === 'alerts') {
            fetchInventoryAlerts();
        }
    }, [activeTab, fetchInventoryItems, fetchInventoryStats, fetchInventoryAlerts]);

    // 刷新数据
    const handleRefresh = useCallback(() => {
        if (activeTab === 'items') {
            fetchInventoryItems();
            fetchInventoryStats();
        } else if (activeTab === 'alerts') {
            fetchInventoryAlerts();
        } else if (activeTab === 'adjustments' && selectedItem) {
            fetchInventoryAdjustments(selectedItem.id);
        }
    }, [activeTab, selectedItem, fetchInventoryItems, fetchInventoryStats, fetchInventoryAlerts, fetchInventoryAdjustments]);

    // 创建库存项目
    const handleCreateItem = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    // 编辑库存项目
    const handleEditItem = (item: InventoryItem) => {
        setEditingItem(item);
        form.setFieldsValue({
            categoryId: item.categoryId,
            quantity: item.quantity,
            minThreshold: item.minThreshold,
            maxThreshold: item.maxThreshold,
            currentPrice: item.currentPrice,
            location: item.location,
            notes: item.notes,
        });
        setIsModalVisible(true);
    };

    // 删除库存项目
    const handleDeleteItem = async (id: string) => {
        try {
            await inventoryService.deleteInventoryItem(id);
            message.success('库存项目删除成功');
            fetchInventoryItems();
            fetchInventoryStats();
        } catch (error: any) {
            console.error('删除库存项目失败:', error);
            message.error('删除库存项目失败');
        }
    };

    // 查看库存调整记录
    const handleViewAdjustments = (item: InventoryItem) => {
        setSelectedItem(item);
        setActiveTab('adjustments');
        fetchInventoryAdjustments(item.id);
    };

    // 库存调整
    const handleAdjustInventory = (item: InventoryItem) => {
        setSelectedItem(item);
        adjustForm.resetFields();
        setIsAdjustModalVisible(true);
    };

    // 保存库存项目
    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            
            if (editingItem) {
                // 更新库存项目
                const updateData: UpdateInventoryRequest = {
                    quantity: values.quantity,
                    minThreshold: values.minThreshold,
                    maxThreshold: values.maxThreshold,
                    currentPrice: values.currentPrice,
                    location: values.location,
                    notes: values.notes,
                };
                
                await inventoryService.updateInventoryItem(editingItem.id, updateData);
                message.success('库存项目更新成功');
            } else {
                // 创建库存项目
                const createData: CreateInventoryRequest = {
                    categoryId: values.categoryId,
                    quantity: values.quantity,
                    minThreshold: values.minThreshold,
                    maxThreshold: values.maxThreshold,
                    currentPrice: values.currentPrice,
                    location: values.location,
                    notes: values.notes,
                };
                
                await inventoryService.createInventoryItem(createData);
                message.success('库存项目创建成功');
            }
            
            setIsModalVisible(false);
            fetchInventoryItems();
            fetchInventoryStats();
        } catch (error: any) {
            console.error('保存库存项目失败:', error);
            message.error('保存库存项目失败');
        }
    };

    // 保存库存调整
    const handleAdjustModalOk = async () => {
        try {
            const values = await adjustForm.validateFields();
            
            if (selectedItem) {
                await inventoryService.adjustInventory(selectedItem.id, {
                    type: values.type,
                    quantity: values.quantity,
                    reason: values.reason,
                });
                
                message.success('库存调整成功');
                setIsAdjustModalVisible(false);
                fetchInventoryItems();
                fetchInventoryStats();
            }
        } catch (error: any) {
            console.error('库存调整失败:', error);
            message.error('库存调整失败');
        }
    };

    // 导出库存数据
    const handleExport = async () => {
        try {
            const blob = await inventoryService.exportInventory(filters);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `inventory_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            message.success('库存数据导出成功');
        } catch (error: any) {
            console.error('导出失败:', error);
            message.error('导出失败');
        }
    };

    // 状态标签渲染
    const renderStatusTag = (status: InventoryStatus) => {
        const statusConfig = {
            AVAILABLE: { color: 'green', icon: <CheckCircleOutlined />, text: '充足' },
            LOW_STOCK: { color: 'orange', icon: <WarningOutlined />, text: '库存不足' },
            OUT_OF_STOCK: { color: 'red', icon: <WarningOutlined />, text: '缺货' },
            RESERVED: { color: 'blue', icon: <DatabaseOutlined />, text: '预留' },
        };

        const config = statusConfig[status];
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        );
    };

    // 库存项目表格列定义
    const inventoryColumns = [
        {
            title: '分类名称',
            dataIndex: 'categoryName',
            key: 'categoryName',
            sorter: true,
        },
        {
            title: '单位',
            dataIndex: 'unit',
            key: 'unit',
        },
        {
            title: '当前库存',
            dataIndex: 'quantity',
            key: 'quantity',
            sorter: true,
            render: (quantity: number, record: LocalInventoryItem) => (
                <span style={{ 
                    color: record.status === 'OUT_OF_STOCK' ? '#ff4d4f' : 
                           record.status === 'LOW_STOCK' ? '#faad14' : '#52c41a' 
                }}>
                    {quantity}
                </span>
            ),
        },
        {
            title: '最小阈值',
            dataIndex: 'minThreshold',
            key: 'minThreshold',
        },
        {
            title: '最大阈值',
            dataIndex: 'maxThreshold',
            key: 'maxThreshold',
        },
        {
            title: '当前价格',
            dataIndex: 'currentPrice',
            key: 'currentPrice',
            sorter: true,
            render: (price: number) => `¥${price.toFixed(2)}`,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: InventoryStatus) => renderStatusTag(status),
        },
        {
            title: '位置',
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: '最后更新',
            dataIndex: 'lastUpdated',
            key: 'lastUpdated',
            sorter: true,
            render: (date: string) => new Date(date).toLocaleString(),
        },
        {
            title: '操作',
            key: 'action',
            width: 250,
            render: (_: any, record: LocalInventoryItem) => (
                <Space size="small">
                    <Tooltip title="编辑">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditItem(record)}
                        />
                    </Tooltip>
                    <Tooltip title="库存调整">
                        <Button
                            size="small"
                            icon={<DatabaseOutlined />}
                            onClick={() => handleAdjustInventory(record)}
                        />
                    </Tooltip>
                    <Tooltip title="调整记录">
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewAdjustments(record)}
                        />
                    </Tooltip>
                    <Tooltip title="删除">
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteItem(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // 调整记录表格列定义
    const adjustmentColumns = [
        {
            title: '调整类型',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => {
                const typeConfig = {
                    IN: { color: 'green', text: '入库' },
                    OUT: { color: 'red', text: '出库' },
                    ADJUSTMENT: { color: 'blue', text: '调整' },
                };
                const config = typeConfig[type as keyof typeof typeConfig];
                return <Tag color={config.color}>{config.text}</Tag>;
            },
        },
        {
            title: '调整数量',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity: number, record: LocalInventoryAdjustment) => (
                <span style={{ color: record.type === 'OUT' ? '#ff4d4f' : '#52c41a' }}>
                    {record.type === 'OUT' ? '-' : '+'}{Math.abs(quantity)}
                </span>
            ),
        },
        {
            title: '调整原因',
            dataIndex: 'reason',
            key: 'reason',
        },
        {
            title: '操作人',
            dataIndex: 'operatorName',
            key: 'operatorName',
        },
        {
            title: '调整时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleString(),
        },
    ];

    // 预警列表列定义
    const alertColumns = [
        {
            title: '分类名称',
            dataIndex: 'categoryName',
            key: 'categoryName',
        },
        {
            title: '预警类型',
            dataIndex: 'alertType',
            key: 'alertType',
            render: (type: string) => {
                const typeConfig = {
                    LOW_STOCK: { color: 'orange', text: '库存不足' },
                    OUT_OF_STOCK: { color: 'red', text: '缺货' },
                    OVERSTOCK: { color: 'blue', text: '库存过多' },
                };
                const config = typeConfig[type as keyof typeof typeConfig];
                return <Tag color={config.color}>{config.text}</Tag>;
            },
        },
        {
            title: '当前库存',
            dataIndex: 'currentQuantity',
            key: 'currentQuantity',
        },
        {
            title: '阈值',
            dataIndex: 'threshold',
            key: 'threshold',
        },
        {
            title: '严重程度',
            dataIndex: 'severity',
            key: 'severity',
            render: (severity: string) => {
                const severityConfig = {
                    LOW: { color: 'green', text: '低' },
                    MEDIUM: { color: 'orange', text: '中' },
                    HIGH: { color: 'red', text: '高' },
                };
                const config = severityConfig[severity as keyof typeof severityConfig];
                return <Tag color={config.color}>{config.text}</Tag>;
            },
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleString(),
        },
    ];

    // 菜单项
    const menuItems = [
        {
            key: 'items',
            icon: <DatabaseOutlined />,
            label: '库存管理',
        },
        {
            key: 'alerts',
            icon: <WarningOutlined />,
            label: '库存预警',
        },
        {
            key: 'adjustments',
            icon: <EyeOutlined />,
            label: '调整记录',
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={200} style={{ background: '#fff' }}>
                <Menu
                    mode="inline"
                    selectedKeys={[activeTab]}
                    style={{ height: '100%', borderRight: 0 }}
                    items={menuItems}
                    onClick={({ key }) => setActiveTab(key)}
                />
            </Sider>
            <Layout style={{ padding: '0 24px 24px' }}>
                <Content style={{ padding: 24, margin: 0, minHeight: 280 }}>
                    {error && (
                        <Alert
                            message="数据加载失败"
                            description={error}
                            type="error"
                            showIcon
                            closable
                            style={{ marginBottom: 16 }}
                            onClose={() => setError(null)}
                        />
                    )}

                    {activeTab === 'items' && (
                        <>
                            {/* 统计卡片 */}
                            {stats && (
                                <Row gutter={16} style={{ marginBottom: 16 }}>
                                    <Col span={6}>
                                        <Card>
                                            <Statistic
                                                title="总库存项目"
                                                value={stats.totalItems}
                                                prefix={<DatabaseOutlined />}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={6}>
                                        <Card>
                                            <Statistic
                                                title="总库存价值"
                                                value={stats.totalValue}
                                                precision={2}
                                                prefix="¥"
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={6}>
                                        <Card>
                                            <Statistic
                                                title="库存不足"
                                                value={stats.lowStockItems}
                                                prefix={<WarningOutlined />}
                                                valueStyle={{ color: '#faad14' }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={6}>
                                        <Card>
                                            <Statistic
                                                title="缺货项目"
                                                value={stats.outOfStockItems}
                                                prefix={<WarningOutlined />}
                                                valueStyle={{ color: '#ff4d4f' }}
                                            />
                                        </Card>
                                    </Col>
                                </Row>
                            )}

                            {/* 操作按钮 */}
                            <div style={{ marginBottom: 16 }}>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleCreateItem}
                                    >
                                        新增库存
                                    </Button>
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={handleRefresh}
                                    >
                                        刷新
                                    </Button>
                                    <Button
                                        icon={<ExportOutlined />}
                                        onClick={handleExport}
                                    >
                                        导出
                                    </Button>
                                </Space>
                            </div>

                            {/* 库存列表 */}
                            <Spin spinning={loading}>
                                <Table
                                    columns={inventoryColumns}
                                    dataSource={inventoryItems}
                                    pagination={{
                                        current: pagination.current,
                                        pageSize: pagination.pageSize,
                                        total: pagination.total,
                                        showSizeChanger: true,
                                        showQuickJumper: true,
                                        showTotal: (total, range) =>
                                            `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
                                        onChange: (page, pageSize) => {
                                            setPagination(prev => ({
                                                ...prev,
                                                current: page,
                                                pageSize: pageSize || 10,
                                            }));
                                        },
                                    }}
                                    scroll={{ x: 1200 }}
                                />
                            </Spin>
                        </>
                    )}

                    {activeTab === 'alerts' && (
                        <>
                            <div style={{ marginBottom: 16 }}>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleRefresh}
                                >
                                    刷新
                                </Button>
                            </div>
                            <Spin spinning={loading}>
                                <Table
                                    columns={alertColumns}
                                    dataSource={alerts}
                                    rowKey="id"
                                    pagination={false}
                                />
                            </Spin>
                        </>
                    )}

                    {activeTab === 'adjustments' && (
                        <>
                            <div style={{ marginBottom: 16 }}>
                                <Space>
                                    <Button
                                        onClick={() => setActiveTab('items')}
                                    >
                                        返回库存管理
                                    </Button>
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={handleRefresh}
                                    >
                                        刷新
                                    </Button>
                                </Space>
                                {selectedItem && (
                                    <div style={{ marginTop: 8 }}>
                                        <strong>当前查看：{selectedItem.categoryName}</strong>
                                    </div>
                                )}
                            </div>
                            <Spin spinning={loading}>
                                <Table
                                    columns={adjustmentColumns}
                                    dataSource={adjustments}
                                    pagination={false}
                                />
                            </Spin>
                        </>
                    )}

                    {/* 新增/编辑库存项目模态框 */}
                    <Modal
                        title={editingItem ? '编辑库存项目' : '新增库存项目'}
                        open={isModalVisible}
                        onOk={handleModalOk}
                        onCancel={() => setIsModalVisible(false)}
                        width={600}
                    >
                        <Form form={form} layout="vertical">
                            <Form.Item
                                name="categoryId"
                                label="分类ID"
                                rules={[{ required: true, message: '请输入分类ID' }]}
                            >
                                <Input placeholder="请输入分类ID" />
                            </Form.Item>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="quantity"
                                        label="库存数量"
                                        rules={[{ required: true, message: '请输入库存数量' }]}
                                    >
                                        <InputNumber
                                            min={0}
                                            style={{ width: '100%' }}
                                            placeholder="请输入库存数量"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="currentPrice"
                                        label="当前价格"
                                        rules={[{ required: true, message: '请输入当前价格' }]}
                                    >
                                        <InputNumber
                                            min={0}
                                            precision={2}
                                            style={{ width: '100%' }}
                                            placeholder="请输入当前价格"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="minThreshold"
                                        label="最小阈值"
                                        rules={[{ required: true, message: '请输入最小阈值' }]}
                                    >
                                        <InputNumber
                                            min={0}
                                            style={{ width: '100%' }}
                                            placeholder="请输入最小阈值"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="maxThreshold"
                                        label="最大阈值"
                                        rules={[{ required: true, message: '请输入最大阈值' }]}
                                    >
                                        <InputNumber
                                            min={0}
                                            style={{ width: '100%' }}
                                            placeholder="请输入最大阈值"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item name="location" label="存储位置">
                                <Input placeholder="请输入存储位置" />
                            </Form.Item>
                            <Form.Item name="notes" label="备注">
                                <Input.TextArea rows={3} placeholder="请输入备注信息" />
                            </Form.Item>
                        </Form>
                    </Modal>

                    {/* 库存调整模态框 */}
                    <Modal
                        title="库存调整"
                        open={isAdjustModalVisible}
                        onOk={handleAdjustModalOk}
                        onCancel={() => setIsAdjustModalVisible(false)}
                        width={500}
                    >
                        <Form form={adjustForm} layout="vertical">
                            <Form.Item
                                name="type"
                                label="调整类型"
                                rules={[{ required: true, message: '请选择调整类型' }]}
                            >
                                <Select placeholder="请选择调整类型">
                                    <Option value="IN">入库</Option>
                                    <Option value="OUT">出库</Option>
                                    <Option value="ADJUSTMENT">调整</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="quantity"
                                label="调整数量"
                                rules={[{ required: true, message: '请输入调整数量' }]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    placeholder="请输入调整数量"
                                />
                            </Form.Item>
                            <Form.Item
                                name="reason"
                                label="调整原因"
                                rules={[{ required: true, message: '请输入调整原因' }]}
                            >
                                <Input.TextArea rows={3} placeholder="请输入调整原因" />
                            </Form.Item>
                        </Form>
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
};

export default InventoryPage;
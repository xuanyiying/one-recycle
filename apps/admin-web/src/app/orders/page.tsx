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
  Descriptions,
  Card,
  DatePicker,
  Statistic,
  Row,
  Col,
  Spin,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  FileTextOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import {
  orderService,
  OrderStatus,
  OrderQueryParams,
  OrderListResponse,
} from '../../services/orderService';
import type { Order, OrderItem, OrderStats } from '../../services/orderService';

const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

// 本地接口扩展（为Table组件添加key字段）
interface LocalOrder extends Order {
  key: string;
}

const OrdersPage: React.FC = () => {
  // 状态管理
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [filters, setFilters] = useState<OrderQueryParams>({
    page: 1,
    pageSize: 10,
    status: undefined,
    customerName: '',
    orderNumber: '',
    startDate: undefined,
    endDate: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [form] = Form.useForm();

  // 获取订单列表
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response: OrderListResponse = await orderService.getOrders(filters);

      // 为每个订单添加key字段
      const ordersWithKey: LocalOrder[] = response.orders.map((order) => ({
        ...order,
        key: order.id,
      }));

      setOrders(ordersWithKey);
      setPagination((prev) => ({
        ...prev,
        current: response.page,
        pageSize: response.pageSize,
        total: response.total,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取订单列表失败';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // 获取统计数据
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await orderService.getOrderStats();
      setStats(statsData);
    } catch (err) {
      console.error('获取统计数据失败:', err);
    }
  }, []);

  // 初始化数据
  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [fetchOrders, fetchStats]);

  // 处理分页变化
  const handleTableChange = (page: number, pageSize?: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      customerName: value,
      page: 1,
    }));
  };

  // 处理筛选
  const handleFilterChange = (key: keyof OrderQueryParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  // 刷新数据
  const handleRefresh = () => {
    fetchOrders();
    fetchStats();
  };

  // 查看订单详情
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalVisible(true);
  };

  // 编辑订单
  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    form.setFieldsValue({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      status: order.status,
      scheduledDate: order.scheduledDate,
      notes: order.notes,
    });
    setIsModalVisible(true);
  };

  // 删除订单
  const handleDeleteOrder = async (orderId: string) => {
    try {
      await orderService.deleteOrder(orderId);
      message.success('订单删除成功');
      fetchOrders();
      fetchStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除订单失败';
      message.error(errorMessage);
    }
  };

  // 更新订单状态
  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      message.success('订单状态更新成功');
      fetchOrders();
      fetchStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新订单状态失败';
      message.error(errorMessage);
    }
  };

  // 保存订单编辑
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingOrder) {
        await orderService.updateOrder(editingOrder.id, values);
        message.success('订单信息更新成功');
        setIsModalVisible(false);
        fetchOrders();
        fetchStats();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新订单失败';
      message.error(errorMessage);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDetailModalCancel = () => {
    setIsDetailModalVisible(false);
    setSelectedOrder(null);
  };

  const statusMap: Record<OrderStatus | string, { color: string; text: string }> = {
    [OrderStatus.PENDING]: { color: 'orange', text: '待处理' },
    [OrderStatus.CONFIRMED]: { color: 'blue', text: '已确认' },
    [OrderStatus.IN_PROGRESS]: { color: 'cyan', text: '处理中' },
    [OrderStatus.COMPLETED]: { color: 'green', text: '已完成' },
    [OrderStatus.CANCELLED]: { color: 'red', text: '已取消' },
    [OrderStatus.REFUNDED]: { color: 'purple', text: '已退款' },
  };

  const getStatusTag = (status: OrderStatus | string) => {
    const statusInfo =
      statusMap[status] ||
      (() => {
        if (!status) {
          return { color: 'default', text: '未知' };
        }
        if (typeof status === 'string') {
          if (status === 'DISPATCHED') {
            return { color: 'geekblue', text: '已派单' };
          }
          if (status === 'DISPATCH_FAILED') {
            return { color: 'volcano', text: '派单失败' };
          }
          if (status === 'PAYMENT_FAILED') {
            return { color: 'volcano', text: '支付失败' };
          }
          if (status === 'PAID') {
            return { color: 'green', text: '已支付' };
          }
          if (status === 'INVENTORY_INSUFFICIENT') {
            return { color: 'red', text: '库存不足' };
          }
        }
        return { color: 'default', text: status };
      })();

    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  // 表格列定义
  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 150,
    },
    {
      title: '客户姓名',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 120,
    },
    {
      title: '联系电话',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
      width: 130,
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: OrderStatus) => getStatusTag(status),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: LocalOrder) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>
            查看
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditOrder(record)}>
            编辑
          </Button>
          <Select
            value={record.status}
            size="small"
            style={{ width: 80 }}
            onChange={(value) => handleStatusChange(record.id, value)}
          >
            {Object.values(OrderStatus).map((status) => (
              <Option key={status} value={status}>
                {statusMap[status].text}
              </Option>
            ))}
          </Select>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: '确认删除',
                content: '确定要删除这个订单吗？',
                onOk: () => handleDeleteOrder(record.id),
              });
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 错误提示 */}
      {error && (
        <Alert
          message="数据加载失败"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: '16px' }}
          onClose={() => setError(null)}
        />
      )}

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={stats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总收入"
              value={stats.monthlyRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成订单"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待处理订单"
              value={stats.pending}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Search
              placeholder="搜索客户姓名"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="订单状态"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('status', value)}
            >
              {Object.values(OrderStatus).map((status) => (
                <Option key={status} value={status}>
                  {statusMap[status].text}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              style={{ width: '100%' }}
              onChange={(dates) => {
                if (dates) {
                  handleFilterChange('startDate', dates[0]?.format('YYYY-MM-DD'));
                  handleFilterChange('endDate', dates[1]?.format('YYYY-MM-DD'));
                } else {
                  handleFilterChange('startDate', undefined);
                  handleFilterChange('endDate', undefined);
                }
              }}
            />
          </Col>
          <Col span={8}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  // TODO: 实现新增订单功能
                  message.info('新增订单功能开发中');
                }}
              >
                新增订单
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 订单表格 */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={orders}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              onChange: handleTableChange,
              onShowSizeChange: handleTableChange,
            }}
            scroll={{ x: 1200 }}
          />
        </Spin>
      </Card>

      {/* 编辑订单模态框 */}
      <Modal
        title="编辑订单"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customerName"
                label="客户姓名"
                rules={[{ required: true, message: '请输入客户姓名' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="customerPhone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="customerAddress"
            label="客户地址"
            rules={[{ required: true, message: '请输入客户地址' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="订单状态">
                <Select>
                  {Object.values(OrderStatus).map((status) => (
                    <Option key={status} value={status}>
                      {statusMap[status].text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="scheduledDate" label="预约日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 订单详情模态框 */}
      <Modal
        title="订单详情"
        open={isDetailModalVisible}
        onCancel={handleDetailModalCancel}
        footer={[
          <Button key="close" onClick={handleDetailModalCancel}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="订单号">{selectedOrder.orderNumber}</Descriptions.Item>
              <Descriptions.Item label="订单状态">
                {getStatusTag(selectedOrder.status)}
              </Descriptions.Item>
              <Descriptions.Item label="客户姓名">{selectedOrder.customerName}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selectedOrder.customerPhone}</Descriptions.Item>
              <Descriptions.Item label="客户地址" span={2}>
                {selectedOrder.customerAddress}
              </Descriptions.Item>
              <Descriptions.Item label="订单金额">
                ¥{selectedOrder.totalAmount.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="预约日期">
                {selectedOrder.scheduledDate || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {new Date(selectedOrder.updatedAt).toLocaleString()}
              </Descriptions.Item>
              {selectedOrder.notes && (
                <Descriptions.Item label="备注" span={2}>
                  {selectedOrder.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* 订单项目列表 */}
            <div style={{ marginTop: '16px' }}>
              <h4>订单项目</h4>
              <Table
                size="small"
                dataSource={selectedOrder.items}
                pagination={false}
                columns={[
                  {
                    title: '类别',
                    dataIndex: 'categoryName',
                    key: 'categoryName',
                  },
                  {
                    title: '数量',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    render: (quantity: number, record: OrderItem) => `${quantity} ${record.unit}`,
                  },
                  {
                    title: '单价',
                    dataIndex: 'unitPrice',
                    key: 'unitPrice',
                    render: (price: number) => `¥${price.toFixed(2)}`,
                  },
                  {
                    title: '小计',
                    dataIndex: 'totalPrice',
                    key: 'totalPrice',
                    render: (price: number) => `¥${price.toFixed(2)}`,
                  },
                ]}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;

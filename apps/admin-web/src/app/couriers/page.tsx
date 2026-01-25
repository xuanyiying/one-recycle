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
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  ExportOutlined,
  UserOutlined,
  CarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import {
  courierService,
  type Courier,
  type CourierStats,
  type CreateCourierRequest,
  type UpdateCourierRequest,
  CourierStatus,
} from '../../services/courierService';

const { Option } = Select;

// 本地骑手接口，添加key字段用于Table组件
interface LocalCourier extends Courier {
  key: string;
}

const CouriersPage: React.FC = () => {
  const [couriers, setCouriers] = useState<LocalCourier[]>([]);
  const [stats, setStats] = useState<CourierStats>({
    totalCouriers: 0,
    availableCouriers: 0,
    busyCouriers: 0,
    offlineCouriers: 0,
    averageRating: 0,
    totalDeliveries: 0,
    averageDeliveryTime: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null);
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<CourierStatus | undefined>();
  const [form] = Form.useForm();

  // 获取骑手列表
  const fetchCouriers = useCallback(
    async (page = 1, pageSize = 10) => {
      try {
        setLoading(true);
        setError(null);
        const response = await courierService.getCouriers({
          page,
          pageSize,
          search: searchText || undefined,
          status: statusFilter,
          sortBy: 'registrationDate',
          sortOrder: 'desc',
        });

        const couriersWithKeys = response.data.map((courier) => ({
          ...courier,
          key: courier.id,
        }));

        setCouriers(couriersWithKeys);
        setPagination({
          current: page,
          pageSize,
          total: response.total,
        });
      } catch (err) {
        setError('获取骑手列表失败');
        console.error('获取骑手列表失败:', err);
      } finally {
        setLoading(false);
      }
    },
    [searchText, statusFilter],
  );

  // 获取统计信息
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await courierService.getCourierStats();
      setStats(statsData);
    } catch (err) {
      console.error('获取统计信息失败:', err);
    }
  }, []);

  // 初始化数据
  useEffect(() => {
    fetchCouriers();
    fetchStats();
  }, [fetchCouriers, fetchStats]);

  // 处理搜索
  const handleSearch = () => {
    fetchCouriers(1, pagination.pageSize);
  };

  // 处理刷新
  const handleRefresh = () => {
    fetchCouriers(pagination.current, pagination.pageSize);
    fetchStats();
  };

  // 处理分页变化
  const handleTableChange = (paginationConfig: any) => {
    fetchCouriers(paginationConfig.current, paginationConfig.pageSize);
  };

  // 查看详情
  const handleViewDetails = (courier: Courier) => {
    setSelectedCourier(courier);
    setIsDetailModalVisible(true);
  };

  // 添加骑手
  const handleAddCourier = () => {
    setEditingCourier(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 编辑骑手
  const handleEditCourier = (courier: Courier) => {
    setEditingCourier(courier);
    form.setFieldsValue(courier);
    setIsModalVisible(true);
  };

  // 删除骑手
  const handleDeleteCourier = async (courierId: string) => {
    try {
      await courierService.deleteCourier(courierId);
      message.success('骑手删除成功');
      fetchCouriers(pagination.current, pagination.pageSize);
      fetchStats();
    } catch (err) {
      message.error('删除失败');
      console.error('删除骑手失败:', err);
    }
  };

  // 更新骑手状态
  const handleStatusChange = async (courierId: string, status: CourierStatus) => {
    try {
      await courierService.updateCourierStatus(courierId, status);
      message.success('状态更新成功');
      fetchCouriers(pagination.current, pagination.pageSize);
      fetchStats();
    } catch (err) {
      message.error('状态更新失败');
      console.error('更新状态失败:', err);
    }
  };

  // 处理表单提交
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingCourier) {
        // 编辑骑手
        const updateData: UpdateCourierRequest = {
          name: values.name,
          phone: values.phone,
          idNumber: values.idNumber,
          licensePlate: values.licensePlate,
          status: values.status,
        };
        await courierService.updateCourier(editingCourier.id, updateData);
        message.success('骑手信息更新成功');
      } else {
        // 添加骑手
        const createData: CreateCourierRequest = {
          name: values.name,
          phone: values.phone,
          idNumber: values.idNumber,
          licensePlate: values.licensePlate,
        };
        await courierService.createCourier(createData);
        message.success('骑手添加成功');
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchCouriers(pagination.current, pagination.pageSize);
      fetchStats();
    } catch (err) {
      message.error(editingCourier ? '更新失败' : '添加失败');
      console.error('操作失败:', err);
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      const blob = await courierService.exportCouriers({
        search: searchText || undefined,
        status: statusFilter,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `couriers_${new Date().toISOString().split('T')[0]}.xlsx`;
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

  // 获取状态标签
  const getStatusTag = (status: CourierStatus) => {
    const statusMap = {
      [CourierStatus.AVAILABLE]: { color: 'green', text: '空闲' },
      [CourierStatus.BUSY]: { color: 'orange', text: '忙碌' },
      [CourierStatus.OFFLINE]: { color: 'red', text: '离线' },
    };
    const config = statusMap[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列定义
  const columns = [
    {
      title: '骑手ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: '车牌号',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: CourierStatus) => getStatusTag(status),
    },
    {
      title: '已完成订单',
      dataIndex: 'completedOrders',
      key: 'completedOrders',
      width: 100,
      sorter: true,
    },
    {
      title: '当前订单',
      dataIndex: 'assignedOrders',
      key: 'assignedOrders',
      width: 100,
    },
    {
      title: '注册日期',
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      width: 120,
      render: (date: string) => date.split(' ')[0],
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (record: LocalCourier) => (
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
              onClick={() => handleEditCourier(record)}
            />
          </Tooltip>
          <Select
            size="small"
            value={record.status}
            style={{ width: 80 }}
            onChange={(status) => handleStatusChange(record.id, status)}
          >
            <Option value={CourierStatus.AVAILABLE}>空闲</Option>
            <Option value={CourierStatus.BUSY}>忙碌</Option>
            <Option value={CourierStatus.OFFLINE}>离线</Option>
          </Select>
          <Popconfirm
            title="确定要删除这个骑手吗？"
            onConfirm={() => handleDeleteCourier(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
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
              title="总骑手数"
              value={stats.totalCouriers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="空闲骑手"
              value={stats.availableCouriers}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="忙碌骑手"
              value={stats.busyCouriers}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均评分"
              value={stats.averageRating}
              precision={1}
              suffix="分"
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

      {/* 操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space>
              <Input.Search
                placeholder="搜索骑手姓名、手机号"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={handleSearch}
                style={{ width: 250 }}
                allowClear
              />
              <Select
                placeholder="状态筛选"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 120 }}
                allowClear
              >
                <Option value={CourierStatus.AVAILABLE}>空闲</Option>
                <Option value={CourierStatus.BUSY}>忙碌</Option>
                <Option value={CourierStatus.OFFLINE}>离线</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                刷新
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                导出
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCourier}>
                添加骑手
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 骑手表格 */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={couriers}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 1000 }}
          />
        </Spin>
      </Card>

      {/* 添加/编辑骑手模态框 */}
      <Modal
        title={editingCourier ? '编辑骑手' : '添加骑手'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入骑手姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            name="idNumber"
            label="身份证号"
            rules={[
              { required: true, message: '请输入身份证号' },
              { len: 18, message: '身份证号必须为18位' },
            ]}
          >
            <Input placeholder="请输入身份证号" />
          </Form.Item>
          <Form.Item
            name="licensePlate"
            label="车牌号"
            rules={[{ required: true, message: '请输入车牌号' }]}
          >
            <Input placeholder="请输入车牌号" />
          </Form.Item>
          {editingCourier && (
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select placeholder="请选择状态">
                <Option value={CourierStatus.AVAILABLE}>空闲</Option>
                <Option value={CourierStatus.BUSY}>忙碌</Option>
                <Option value={CourierStatus.OFFLINE}>离线</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* 骑手详情模态框 */}
      <Modal
        title="骑手详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {selectedCourier && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="骑手ID">{selectedCourier.id}</Descriptions.Item>
            <Descriptions.Item label="姓名">{selectedCourier.name}</Descriptions.Item>
            <Descriptions.Item label="手机号">{selectedCourier.phone}</Descriptions.Item>
            <Descriptions.Item label="身份证号">{selectedCourier.idNumber}</Descriptions.Item>
            <Descriptions.Item label="车牌号">{selectedCourier.licensePlate}</Descriptions.Item>
            <Descriptions.Item label="状态">
              {getStatusTag(selectedCourier.status)}
            </Descriptions.Item>
            <Descriptions.Item label="已完成订单">
              {selectedCourier.completedOrders}
            </Descriptions.Item>
            <Descriptions.Item label="当前订单">{selectedCourier.assignedOrders}</Descriptions.Item>
            <Descriptions.Item label="注册日期" span={2}>
              {selectedCourier.registrationDate}
            </Descriptions.Item>
            {selectedCourier.rating && (
              <Descriptions.Item label="评分" span={2}>
                {selectedCourier.rating.toFixed(1)} 分
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CouriersPage;

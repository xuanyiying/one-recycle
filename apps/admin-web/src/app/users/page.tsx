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
    Spin,
    Alert,
    Card,
    Row,
    Col,
    Statistic,
    Pagination,
    Tooltip,
    Popconfirm,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    UserOutlined,
    TeamOutlined,
    UserAddOutlined,
    ReloadOutlined,
    ExportOutlined,
    MailOutlined,
    PhoneOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import type {
    User,
    UserStats,
    UserStatus,
    UserRole,
    UserQueryParams,
    UserListResponse,
    CreateUserRequest,
    UpdateUserRequest,
} from '../../services/userService';
import { userService, UserStatus as UserStatusEnum, UserRole as UserRoleEnum } from '../../services/userService';

const { Option } = Select;
const { Search } = Input;

// 本地用户接口，添加key字段用于Table组件
interface LocalUser extends User {
    key: string;
}

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<LocalUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [filters, setFilters] = useState<UserQueryParams>({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<LocalUser | null>(null);
    const [editingUser, setEditingUser] = useState<LocalUser | null>(null);
    const [form] = Form.useForm();

    // 获取用户列表
    const fetchUsers = useCallback(async (params?: UserQueryParams) => {
        try {
            setLoading(true);
            setError(null);
            const queryParams = {
                page: pagination.current,
                limit: pagination.pageSize,
                ...filters,
                ...params,
            };
            const response: UserListResponse = await userService.getUsers(queryParams);
            const usersWithKeys: LocalUser[] = response.users.map(user => ({
                ...user,
                key: user.id,
            }));
            setUsers(usersWithKeys);
            setPagination(prev => ({
                ...prev,
                total: response.total,
                current: response.page,
            }));
        } catch (err) {
            setError('获取用户列表失败');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize, filters]);

    // 获取用户统计信息
    const fetchUserStats = useCallback(async () => {
        try {
            const statsData = await userService.getUserStats();
            setStats(statsData);
        } catch (err) {
            console.error('Error fetching user stats:', err);
        }
    }, []);

    // 初始化数据
    useEffect(() => {
        fetchUsers();
        fetchUserStats();
    }, [fetchUsers, fetchUserStats]);

    // 处理搜索
    const handleSearch = (value: string) => {
        setFilters(prev => ({ ...prev, search: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    // 处理筛选
    const handleFilter = (key: keyof UserQueryParams, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    // 处理分页变化
    const handleTableChange = (page: number, pageSize?: number) => {
        setPagination(prev => ({
            ...prev,
            current: page,
            pageSize: pageSize || prev.pageSize,
        }));
    };

    // 刷新数据
    const handleRefresh = () => {
        fetchUsers();
        fetchUserStats();
    };

    // 添加用户
    const handleAddUser = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    // 编辑用户
    const handleEditUser = (user: LocalUser) => {
        setEditingUser(user);
        form.setFieldsValue({
            username: user.username,
            email: user.email,
            phone: user.phone,
            fullName: user.fullName,
            role: user.role,
            status: user.status,
        });
        setIsModalVisible(true);
    };

    // 查看用户详情
    const handleViewUser = (user: LocalUser) => {
        setSelectedUser(user);
        setIsDetailModalVisible(true);
    };

    // 删除用户
    const handleDeleteUser = async (userId: string) => {
        try {
            await userService.deleteUser(userId);
            message.success('用户删除成功');
            fetchUsers();
            fetchUserStats();
        } catch (err) {
            message.error('删除用户失败');
            console.error('Error deleting user:', err);
        }
    };

    // 更新用户状态
    const handleUpdateStatus = async (userId: string, status: UserStatus) => {
        try {
            await userService.updateUserStatus(userId, status);
            message.success('用户状态更新成功');
            fetchUsers();
            fetchUserStats();
        } catch (err) {
            message.error('更新用户状态失败');
            console.error('Error updating user status:', err);
        }
    };

    // 模态框确认
    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingUser) {
                // 编辑用户
                const updateData: UpdateUserRequest = values;
                await userService.updateUser(editingUser.id, updateData);
                message.success('用户信息更新成功');
            } else {
                // 添加新用户
                const createData: CreateUserRequest = {
                    ...values,
                    password: 'defaultPassword123', // 默认密码，实际应用中应该让用户设置
                };
                await userService.createUser(createData);
                message.success('用户添加成功');
            }
            setIsModalVisible(false);
            fetchUsers();
            fetchUserStats();
        } catch (err) {
            message.error(editingUser ? '更新用户失败' : '添加用户失败');
            console.error('Error saving user:', err);
        }
    };

    // 模态框取消
    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    // 详情模态框取消
    const handleDetailModalCancel = () => {
        setIsDetailModalVisible(false);
        setSelectedUser(null);
    };

    // 导出用户数据
    const handleExport = async () => {
        try {
            const blob = await userService.exportUsers(filters);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'users.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            message.success('用户数据导出成功');
        } catch (err) {
            message.error('导出用户数据失败');
            console.error('Error exporting users:', err);
        }
    };

    // 状态标签渲染
    const renderStatusTag = (status: UserStatus) => {
        const statusConfig = {
            [UserStatusEnum.ACTIVE]: { color: 'green', text: '活跃' },
            [UserStatusEnum.INACTIVE]: { color: 'orange', text: '非活跃' },
            [UserStatusEnum.SUSPENDED]: { color: 'red', text: '已暂停' },
            [UserStatusEnum.PENDING]: { color: 'blue', text: '待激活' },
        };
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    // 角色标签渲染
    const renderRoleTag = (role: UserRole) => {
        const roleConfig = {
            [UserRoleEnum.ADMIN]: { color: 'purple', text: '管理员' },
            [UserRoleEnum.MANAGER]: { color: 'blue', text: '经理' },
            [UserRoleEnum.OPERATOR]: { color: 'green', text: '操作员' },
            [UserRoleEnum.CUSTOMER]: { color: 'default', text: '客户' },
        };
        const config = roleConfig[role];
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    // 表格列定义
    const columns = [
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
            sorter: true,
        },
        {
            title: '姓名',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
            render: (email: string, record: LocalUser) => (
                <Space>
                    <span>{email}</span>
                    {record.isEmailVerified && (
                        <Tooltip title="邮箱已验证">
                            <MailOutlined style={{ color: 'green' }} />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone: string, record: LocalUser) => (
                <Space>
                    <span>{phone || '-'}</span>
                    {phone && record.isPhoneVerified && (
                        <Tooltip title="手机号已验证">
                            <PhoneOutlined style={{ color: 'green' }} />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            render: (role: UserRole) => renderRoleTag(role),
            filters: [
                { text: '管理员', value: UserRoleEnum.ADMIN },
                { text: '经理', value: UserRoleEnum.MANAGER },
                { text: '操作员', value: UserRoleEnum.OPERATOR },
                { text: '客户', value: UserRoleEnum.CUSTOMER },
            ],
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: UserStatus) => renderStatusTag(status),
            filters: [
                { text: '活跃', value: UserStatusEnum.ACTIVE },
                { text: '非活跃', value: UserStatusEnum.INACTIVE },
                { text: '已暂停', value: UserStatusEnum.SUSPENDED },
                { text: '待激活', value: UserStatusEnum.PENDING },
            ],
        },
        {
            title: '注册时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString(),
            sorter: true,
        },
        {
            title: '最后登录',
            dataIndex: 'lastLoginAt',
            key: 'lastLoginAt',
            render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: LocalUser) => (
                <Space size="middle">
                    <Tooltip title="查看详情">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewUser(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="编辑">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEditUser(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="更改状态">
                        <Select
                            value={record.status}
                            size="small"
                            style={{ width: 80 }}
                            onChange={(value) => handleUpdateStatus(record.id, value)}
                        >
                            <Option value={UserStatusEnum.ACTIVE}>活跃</Option>
                            <Option value={UserStatusEnum.INACTIVE}>非活跃</Option>
                            <Option value={UserStatusEnum.SUSPENDED}>暂停</Option>
                            <Option value={UserStatusEnum.PENDING}>待激活</Option>
                        </Select>
                    </Tooltip>
                    <Popconfirm
                        title="确定要删除这个用户吗？"
                        onConfirm={() => handleDeleteUser(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Tooltip title="删除">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (error) {
        return (
            <Alert
                message="加载失败"
                description={error}
                type="error"
                showIcon
                action={
                    <Button size="small" danger onClick={handleRefresh}>
                        重试
                    </Button>
                }
            />
        );
    }

    return (
        <div>
            {/* 统计卡片 */}
            {stats && (
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="总用户数"
                                value={stats.totalUsers}
                                prefix={<TeamOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="活跃用户"
                                value={stats.activeUsers}
                                prefix={<UserOutlined />}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="今日新增"
                                value={stats.newUsersToday}
                                prefix={<UserAddOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="本月新增"
                                value={stats.newUsersThisMonth}
                                prefix={<UserAddOutlined />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* 操作栏 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Space>
                    <Search
                        placeholder="搜索用户名、邮箱或手机号"
                        allowClear
                        onSearch={handleSearch}
                        style={{ width: 300 }}
                    />
                    <Select
                        placeholder="选择角色"
                        allowClear
                        style={{ width: 120 }}
                        onChange={(value) => handleFilter('role', value)}
                    >
                        <Option value={UserRoleEnum.ADMIN}>管理员</Option>
                        <Option value={UserRoleEnum.MANAGER}>经理</Option>
                        <Option value={UserRoleEnum.OPERATOR}>操作员</Option>
                        <Option value={UserRoleEnum.CUSTOMER}>客户</Option>
                    </Select>
                    <Select
                        placeholder="选择状态"
                        allowClear
                        style={{ width: 120 }}
                        onChange={(value) => handleFilter('status', value)}
                    >
                        <Option value={UserStatusEnum.ACTIVE}>活跃</Option>
                        <Option value={UserStatusEnum.INACTIVE}>非活跃</Option>
                        <Option value={UserStatusEnum.SUSPENDED}>暂停</Option>
                        <Option value={UserStatusEnum.PENDING}>待激活</Option>
                    </Select>
                </Space>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                        刷新
                    </Button>
                    <Button icon={<ExportOutlined />} onClick={handleExport}>
                        导出
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
                        添加用户
                    </Button>
                </Space>
            </div>

            {/* 用户表格 */}
            <Spin spinning={loading}>
                <Table
                    dataSource={users}
                    columns={columns}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                        onChange: handleTableChange,
                        onShowSizeChange: handleTableChange,
                    }}
                    onChange={(pagination, filters, sorter) => {
                        if (Array.isArray(sorter)) return;
                        if (sorter.field && sorter.order) {
                            setFilters(prev => ({
                                ...prev,
                                sortBy: sorter.field as any,
                                sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc',
                            }));
                        }
                    }}
                />
            </Spin>

            {/* 添加/编辑用户模态框 */}
            <Modal
                title={editingUser ? "编辑用户" : "添加用户"}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText="确定"
                cancelText="取消"
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="username"
                                label="用户名"
                                rules={[{ required: true, message: '请输入用户名' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="fullName"
                                label="姓名"
                                rules={[{ required: true, message: '请输入姓名' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="邮箱"
                                rules={[
                                    { required: true, message: '请输入邮箱' },
                                    { type: 'email', message: '请输入有效的邮箱地址' }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="phone"
                                label="手机号"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="role"
                                label="角色"
                                rules={[{ required: true, message: '请选择角色' }]}
                            >
                                <Select>
                                    <Option value={UserRoleEnum.ADMIN}>管理员</Option>
                                    <Option value={UserRoleEnum.MANAGER}>经理</Option>
                                    <Option value={UserRoleEnum.OPERATOR}>操作员</Option>
                                    <Option value={UserRoleEnum.CUSTOMER}>客户</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="状态"
                                rules={[{ required: true, message: '请选择状态' }]}
                            >
                                <Select>
                                    <Option value={UserStatusEnum.ACTIVE}>活跃</Option>
                                    <Option value={UserStatusEnum.INACTIVE}>非活跃</Option>
                                    <Option value={UserStatusEnum.SUSPENDED}>暂停</Option>
                                    <Option value={UserStatusEnum.PENDING}>待激活</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* 用户详情模态框 */}
            <Modal
                title="用户详情"
                open={isDetailModalVisible}
                onCancel={handleDetailModalCancel}
                footer={[
                    <Button key="close" onClick={handleDetailModalCancel}>
                        关闭
                    </Button>
                ]}
                width={800}
            >
                {selectedUser && (
                    <div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <p><strong>用户名:</strong> {selectedUser.username}</p>
                                <p><strong>姓名:</strong> {selectedUser.fullName}</p>
                                <p><strong>邮箱:</strong> {selectedUser.email}</p>
                                <p><strong>手机号:</strong> {selectedUser.phone || '-'}</p>
                            </Col>
                            <Col span={12}>
                                <p><strong>角色:</strong> {renderRoleTag(selectedUser.role)}</p>
                                <p><strong>状态:</strong> {renderStatusTag(selectedUser.status)}</p>
                                <p><strong>注册时间:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                                <p><strong>最后登录:</strong> {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : '-'}</p>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <p><strong>邮箱验证:</strong> {selectedUser.isEmailVerified ? '已验证' : '未验证'}</p>
                                <p><strong>手机验证:</strong> {selectedUser.isPhoneVerified ? '已验证' : '未验证'}</p>
                            </Col>
                        </Row>
                        {selectedUser.address && (
                            <div>
                                <h4>地址信息</h4>
                                <p>{selectedUser.address.street}, {selectedUser.address.city}, {selectedUser.address.state} {selectedUser.address.zipCode}, {selectedUser.address.country}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UsersPage;
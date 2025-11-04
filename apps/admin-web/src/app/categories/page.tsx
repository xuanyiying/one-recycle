'use client';

import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Switch,
    Space,
    message,
    Popconfirm,
    Image,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import IconUpload from '@/components/IconUpload';
import categoryService, { Category, CategoryQueryParams } from '../../services/categoryService';

const CategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [form] = Form.useForm();
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');

    // 获取分类数据
    useEffect(() => {
        fetchCategories();
    }, [currentPage, pageSize, searchText]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            
            const params: CategoryQueryParams = {
                page: currentPage,
                limit: pageSize,
                search: searchText || undefined,
                sortBy: 'sortOrder',
                sortOrder: 'asc',
            };

            const response = await categoryService.getCategories(params);
            setCategories(response.data);
            setTotal(response.total);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            message.error('获取分类列表失败，请检查网络连接或联系管理员');
            // 设置空数据以避免界面异常
            setCategories([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = () => {
        setEditingCategory(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        form.setFieldsValue(category);
        setIsModalVisible(true);
    };

    const handleDeleteCategory = async (id: string) => {
        try {
            await categoryService.deleteCategory(id);
            message.success('分类删除成功');
            // 重新获取数据
            fetchCategories();
        } catch (error) {
            console.error('Failed to delete category:', error);
            message.error('删除分类失败，请重试');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            
            if (editingCategory) {
                // 编辑分类
                await categoryService.updateCategory(editingCategory.id, values);
                message.success('分类更新成功');
            } else {
                // 创建分类
                await categoryService.createCategory(values);
                message.success('分类创建成功');
            }
            
            setIsModalVisible(false);
            form.resetFields();
            // 重新获取数据
            fetchCategories();
        } catch (error) {
            console.error('Failed to save category:', error);
            if (editingCategory) {
                message.error('更新分类失败，请重试');
            } else {
                message.error('创建分类失败，请重试');
            }
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    const columns = [
        {
            title: '图标',
            dataIndex: 'icon',
            key: 'icon',
            width: 80,
            render: (icon: string) => (
                icon ? (
                    <Image
                        width={40}
                        height={40}
                        src={icon}
                        alt="分类图标"
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                    />
                ) : (
                    <div style={{ width: 40, height: 40, backgroundColor: '#f5f5f5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#999' }}>
                        无图标
                    </div>
                )
            ),
        },
        {
            title: '分类名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: '单价(元/kg)',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            render: (price: number) => `¥${price}`,
        },
        {
            title: '排序',
            dataIndex: 'sortOrder',
            key: 'sortOrder',
        },
        {
            title: '状态',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => isActive ? '启用' : '禁用',
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: Category) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEditCategory(record)}
                        size="small"
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这个分类吗？"
                        onConfirm={() => handleDeleteCategory(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // 处理分页变化
    const handlePageChange = (page: number, size?: number) => {
        setCurrentPage(page);
        if (size && size !== pageSize) {
            setPageSize(size);
        }
    };

    // 处理搜索
    const handleSearch = (value: string) => {
        setSearchText(value);
        setCurrentPage(1); // 搜索时重置到第一页
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1>回收分类管理</h1>
                <Space>
                    <Input.Search
                        placeholder="搜索分类名称"
                        allowClear
                        style={{ width: 250 }}
                        onSearch={handleSearch}
                        onChange={(e) => {
                            if (!e.target.value) {
                                handleSearch('');
                            }
                        }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateCategory}>
                        添加分类
                    </Button>
                </Space>
            </div>

            <Table
                dataSource={categories}
                columns={columns}
                loading={loading}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                    onChange: handlePageChange,
                    onShowSizeChange: handlePageChange,
                }}
                rowKey="id"
            />

            <Modal
                title={editingCategory ? "编辑分类" : "添加分类"}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText="确定"
                cancelText="取消"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="分类名称"
                        rules={[{ required: true, message: '请输入分类名称' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="描述"
                    >
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item
                        name="unitPrice"
                        label="单价(元/kg)"
                        rules={[{ required: true, message: '请输入单价' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
                    </Form.Item>
                    <Form.Item
                        name="icon"
                        label="图标"
                    >
                        <IconUpload />
                    </Form.Item>
                    <Form.Item
                        name="sortOrder"
                        label="排序"
                        rules={[{ required: true, message: '请输入排序值' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                    <Form.Item
                        name="isActive"
                        label="是否启用"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoriesPage;
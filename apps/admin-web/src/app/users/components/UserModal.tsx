import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col } from 'antd';
import { UserRole, UserStatus } from '@/types/user';

const { Option } = Select;

interface UserModalProps {
  visible: boolean;
  onOk: (values: any) => void;
  onCancel: () => void;
  initialValues?: any;
  loading?: boolean;
}

const UserModal: React.FC<UserModalProps> = ({
  visible,
  onOk,
  onCancel,
  initialValues,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  return (
    <Modal
      title={initialValues ? '编辑用户' : '添加用户'}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
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
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="phone" label="手机号">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
              <Select>
                <Option value={UserRole.ADMIN}>管理员</Option>
                <Option value={UserRole.MANAGER}>经理</Option>
                <Option value={UserRole.OPERATOR}>操作员</Option>
                <Option value={UserRole.CUSTOMER}>客户</Option>
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
                <Option value={UserStatus.ACTIVE}>活跃</Option>
                <Option value={UserStatus.INACTIVE}>非活跃</Option>
                <Option value={UserStatus.SUSPENDED}>暂停</Option>
                <Option value={UserStatus.PENDING}>待激活</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default UserModal;

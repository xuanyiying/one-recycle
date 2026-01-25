import React from 'react';
import { Modal, Button, Row, Col, Tag } from 'antd';
import { User, UserRole, UserStatus } from '@/types/user';

interface UserDetailModalProps {
  visible: boolean;
  user: User | null;
  onCancel: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ visible, user, onCancel }) => {
  const renderStatusTag = (status: UserStatus) => {
    const statusConfig = {
      [UserStatus.ACTIVE]: { color: 'green', text: '活跃' },
      [UserStatus.INACTIVE]: { color: 'orange', text: '非活跃' },
      [UserStatus.SUSPENDED]: { color: 'red', text: '已暂停' },
      [UserStatus.PENDING]: { color: 'blue', text: '待激活' },
    };
    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const renderRoleTag = (role: UserRole) => {
    const roleConfig = {
      [UserRole.ADMIN]: { color: 'purple', text: '管理员' },
      [UserRole.MANAGER]: { color: 'blue', text: '经理' },
      [UserRole.OPERATOR]: { color: 'green', text: '操作员' },
      [UserRole.CUSTOMER]: { color: 'default', text: '客户' },
    };
    const config = roleConfig[role];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
    <Modal
      title="用户详情"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>,
      ]}
      width={800}
    >
      {user && (
        <div>
          <Row gutter={16}>
            <Col span={12}>
              <p>
                <strong>用户名:</strong> {user.username}
              </p>
              <p>
                <strong>姓名:</strong> {user.fullName}
              </p>
              <p>
                <strong>邮箱:</strong> {user.email}
              </p>
              <p>
                <strong>手机号:</strong> {user.phone || '-'}
              </p>
            </Col>
            <Col span={12}>
              <p>
                <strong>角色:</strong> {renderRoleTag(user.role)}
              </p>
              <p>
                <strong>状态:</strong> {renderStatusTag(user.status)}
              </p>
              <p>
                <strong>注册时间:</strong> {new Date(user.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>最后登录:</strong>{' '}
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '-'}
              </p>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <p>
                <strong>邮箱验证:</strong> {user.isEmailVerified ? '已验证' : '未验证'}
              </p>
              <p>
                <strong>手机验证:</strong> {user.isPhoneVerified ? '已验证' : '未验证'}
              </p>
            </Col>
          </Row>
          {user.address && (
            <div>
              <h4>地址信息</h4>
              <p>
                {user.address.street}, {user.address.city}, {user.address.state}{' '}
                {user.address.zipCode}, {user.address.country}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default UserDetailModal;

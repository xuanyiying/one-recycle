import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, UserRole, UserStatus } from '@/types/user';

interface UserDetailModalProps {
  visible: boolean;
  user: User | null;
  onCancel: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ visible, user, onCancel }) => {
  const renderStatusTag = (status: UserStatus) => {
    const statusConfig: Record<string, { className: string; text: string }> = {
      [UserStatus.ACTIVE]: { className: 'bg-green-100 text-green-800 hover:bg-green-100', text: '活跃' },
      [UserStatus.INACTIVE]: { className: 'bg-orange-100 text-orange-800 hover:bg-orange-100', text: '非活跃' },
      [UserStatus.SUSPENDED]: { className: 'bg-red-100 text-red-800 hover:bg-red-100', text: '已暂停' },
      [UserStatus.PENDING]: { className: 'bg-blue-100 text-blue-800 hover:bg-blue-100', text: '待激活' },
    };
    const config = statusConfig[status] || { className: 'bg-gray-100 text-gray-800', text: status };
    return <Badge variant="secondary" className={config.className}>{config.text}</Badge>;
  };

  const renderRoleTag = (role: UserRole) => {
    const roleConfig: Record<string, { className: string; text: string }> = {
      [UserRole.ADMIN]: { className: 'bg-purple-100 text-purple-800 hover:bg-purple-100', text: '管理员' },
      [UserRole.MANAGER]: { className: 'bg-blue-100 text-blue-800 hover:bg-blue-100', text: '经理' },
      [UserRole.OPERATOR]: { className: 'bg-green-100 text-green-800 hover:bg-green-100', text: '操作员' },
      [UserRole.CUSTOMER]: { className: 'bg-gray-100 text-gray-800 hover:bg-gray-100', text: '客户' },
    };
    const config = roleConfig[role] || { className: 'bg-gray-100 text-gray-800', text: role };
    return <Badge variant="secondary" className={config.className}>{config.text}</Badge>;
  };

  return (
    <Modal
      title="用户详情"
      open={visible}
      onOpenChange={(open) => !open && onCancel()}
      width={800}
      footer={
        <Button onClick={onCancel}>
          关闭
        </Button>
      }
    >
      {user && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-500">用户名</span>
                <span>{user.username}</span>
              </p>
              <p className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-500">姓名</span>
                <span>{user.fullName}</span>
              </p>
              <p className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-500">邮箱</span>
                <span>{user.email}</span>
              </p>
              <p className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-500">手机号</span>
                <span>{user.phone || '-'}</span>
              </p>
            </div>
            <div className="space-y-3">
              <p className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-500">角色</span>
                {renderRoleTag(user.role)}
              </p>
              <p className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-500">状态</span>
                {renderStatusTag(user.status)}
              </p>
              <p className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-500">注册时间</span>
                <span>{new Date(user.createdAt).toLocaleString()}</span>
              </p>
              <p className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-500">最后登录</span>
                <span>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '-'}</span>
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-500">邮箱验证</span>
                <Badge variant={user.isEmailVerified ? 'default' : 'secondary'} className={user.isEmailVerified ? 'bg-green-100 text-green-800' : ''}>
                  {user.isEmailVerified ? '已验证' : '未验证'}
                </Badge>
              </p>
              <p className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-500">手机验证</span>
                <Badge variant={user.isPhoneVerified ? 'default' : 'secondary'} className={user.isPhoneVerified ? 'bg-green-100 text-green-800' : ''}>
                  {user.isPhoneVerified ? '已验证' : '未验证'}
                </Badge>
              </p>
            </div>
          </div>

          {user.address && (
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 font-semibold text-gray-900">地址信息</h4>
              <p className="text-gray-600">
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

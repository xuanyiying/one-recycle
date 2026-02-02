import React, { useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { UserRole, UserStatus } from '@/types/user';
import { useForm } from 'react-hook-form';

interface UserFormData {
  username: string;
  password?: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
}

interface UserModalProps {
  visible: boolean;
  onOk: (values: UserFormData) => void;
  onCancel: () => void;
  initialValues?: Partial<UserFormData>;
  loading?: boolean;
}

const UserModal: React.FC<UserModalProps> = ({
  visible,
  onOk,
  onCancel,
  initialValues,
  loading,
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      username: '',
      password: '',
      fullName: '',
      email: '',
      phone: '',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    }
  });

  useEffect(() => {
    if (visible && initialValues) {
      reset({
        ...initialValues,
        password: '', // Reset password field for security
      });
    } else if (visible) {
      reset({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phone: '',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
      });
    }
  }, [visible, initialValues, reset]);

  const onSubmit = (values: UserFormData) => {
    onOk(values);
  };

  return (
    <Modal
      title={initialValues ? '编辑用户' : '添加用户'}
      open={visible}
      onOpenChange={(open) => !open && onCancel()}
      width={600}
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={loading}>
            确定
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">用户名</label>
            <Input 
              {...register('username', { required: '请输入用户名' })} 
              className={errors.username ? 'border-red-500' : ''}
            />
            {errors.username && <span className="text-xs text-red-500">{errors.username.message as string}</span>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">密码</label>
            <Input 
              type="password"
              {...register('password', { 
                required: initialValues ? false : '请输入密码',
                minLength: { value: 6, message: '密码长度至少为6位' }
              })} 
              placeholder={initialValues ? '留空表示不修改' : '请输入密码'}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && <span className="text-xs text-red-500">{errors.password.message as string}</span>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">姓名</label>
            <Input 
              {...register('fullName', { required: '请输入姓名' })} 
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && <span className="text-xs text-red-500">{errors.fullName.message as string}</span>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">手机号</label>
            <Input {...register('phone')} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">邮箱</label>
            <Input 
              {...register('email', { 
                required: '请输入邮箱',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "请输入有效的邮箱地址"
                }
              })} 
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <span className="text-xs text-red-500">{errors.email.message as string}</span>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">角色</label>
            <Select {...register('role', { required: '请选择角色' })}>
              <option value={UserRole.ADMIN}>管理员</option>
              <option value={UserRole.MANAGER}>经理</option>
              <option value={UserRole.OPERATOR}>操作员</option>
              <option value={UserRole.CUSTOMER}>客户</option>
            </Select>
            {errors.role && <span className="text-xs text-red-500">{errors.role.message as string}</span>}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;

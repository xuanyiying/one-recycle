'use client';

import React from 'react';
import { Dropdown, Avatar, Badge } from 'antd';
import { UserOutlined, BellOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const AppHeader: React.FC = () => {
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  return (
    <div
      style={{
        padding: 0,
        background: '#fff',
        position: 'fixed',
        width: '100%',
        zIndex: 1,
        height: 64,
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 24px',
          height: '100%',
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: '#1890ff' }}>回收管理系统</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Badge count={5} size="small">
            <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
          </Badge>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar style={{ cursor: 'pointer' }} icon={<UserOutlined />} />
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default AppHeader;

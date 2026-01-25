'use client';

import React from 'react';
import { Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  CarOutlined,
  NotificationOutlined,
  SettingOutlined,
  TagsOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: '/orders',
      icon: <ShoppingOutlined />,
      label: '订单管理',
    },
    {
      key: '/categories',
      icon: <TagsOutlined />,
      label: '分类管理',
    },
    {
      key: '/inventory',
      icon: <DatabaseOutlined />,
      label: '进存销管理',
    },
    {
      key: '/couriers',
      icon: <CarOutlined />,
      label: '骑手管理',
    },
    {
      key: '/notifications',
      icon: <NotificationOutlined />,
      label: '通知管理',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  const handleClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo} />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname]}
        items={menuItems}
        onClick={handleClick}
      />
    </div>
  );
};

export default Sidebar;

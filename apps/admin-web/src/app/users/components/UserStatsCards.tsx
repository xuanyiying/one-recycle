import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { TeamOutlined, UserOutlined, UserAddOutlined } from '@ant-design/icons';
import { UserStats } from '@/types/user';

interface UserStatsCardsProps {
  stats: UserStats | null;
}

const UserStatsCards: React.FC<UserStatsCardsProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic title="总用户数" value={stats.totalUsers} prefix={<TeamOutlined />} />
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
  );
};

export default UserStatsCards;

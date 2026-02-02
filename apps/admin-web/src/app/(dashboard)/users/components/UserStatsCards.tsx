import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Statistic } from '@/components/ui/statistic';
import { Users, User, UserPlus } from 'lucide-react';
import { UserStats } from '@/types/user';

interface UserStatsCardsProps {
  stats: UserStats | null;
}

const UserStatsCards: React.FC<UserStatsCardsProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <Statistic 
            title="总用户数" 
            value={stats.totalUsers} 
            prefix={<Users className="h-4 w-4 text-gray-500" />} 
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Statistic
            title="活跃用户"
            value={stats.activeUsers}
            prefix={<User className="h-4 w-4 text-green-600" />}
            valueStyle={{ color: '#3f8600' }}
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Statistic
            title="今日新增"
            value={stats.newUsersToday}
            prefix={<UserPlus className="h-4 w-4 text-blue-500" />}
            valueStyle={{ color: '#1890ff' }}
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Statistic
            title="本月新增"
            value={stats.newUsersThisMonth}
            prefix={<UserPlus className="h-4 w-4 text-purple-600" />}
            valueStyle={{ color: '#722ed1' }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStatsCards;

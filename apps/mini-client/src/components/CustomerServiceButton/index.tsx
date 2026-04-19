import React from 'react';
import { View, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './CustomerServiceButton.scss';

interface CustomerServiceButtonProps {
  unreadCount?: number;
}

const CustomerServiceButton: React.FC<CustomerServiceButtonProps> = ({
  unreadCount = 0,
}) => {
  const handleClick = () => {
    Taro.navigateTo({
      url: '/pages/customer/index',
    });
  };

  return (
    <View className="customer-button" onClick={handleClick}>
      <Image
        className="service-icon"
        src="/assets/icons/customer.png"
        mode="aspectFit"
      />
      {unreadCount > 0 && (
        <View className="unread-badge">
          {unreadCount > 99 ? '99+' : unreadCount}
        </View>
      )}
    </View>
  );
};

export default CustomerServiceButton;

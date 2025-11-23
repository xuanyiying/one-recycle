import React from 'react';
import { View, Text, Image, Switch } from '@tarojs/components';
import './JdExpressOption.scss';
interface JdExpressOptionProps {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
}

const JdExpressOption: React.FC<JdExpressOptionProps> = ({ enabled, onToggle }) => {
    return (
        <View className="jd-express-option">
            <View className="jd-express-header">
                <Image
                    src="https://cdn.jsdelivr.net/gh/one-recycle/assets/jd-express-logo.png"
                    className="jd-logo"
                />
                <Text className="jd-title">京东快递上门取件</Text>
                <Switch
                    checked={enabled}
                    onChange={(e) => onToggle(e.detail.value)}
                    color="#E32B2B"
                />
            </View>

            {enabled && (
                <View className="jd-express-details">
                    <Text className="detail-text">• 专业快递员上门取件</Text>
                    <Text className="detail-text">• 快速安全送达</Text>
                    <Text className="detail-text">• 实时跟踪订单状态</Text>
                    <Text className="note-text">注：使用京东快递服务将收取额外费用</Text>
                </View>
            )}
        </View>
    );
};

export default JdExpressOption;
import React from 'react';
import { View, Button } from '@tarojs/components';

interface QuickAction {
  type: string;
  label: string;
  data?: any;
}

interface QuickActionsProps {
  actions: QuickAction[];
  onAction: (action: QuickAction) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions, onAction }) => {
  if (actions.length === 0) return null;

  const getButtonClass = (type: string) => {
    if (type === 'transfer' || type === 'cancel_order') {
      return 'action-btn primary';
    }
    return 'action-btn';
  };

  return (
    <View className="quick-actions">
      {actions.map((action, index) => (
        <Button
          key={index}
          className={getButtonClass(action.type)}
          onClick={() => onAction(action)}
        >
          {action.label}
        </Button>
      ))}
    </View>
  );
};

export default QuickActions;

import React, { useState } from 'react';
import { View, Text, Textarea, Button } from '@tarojs/components';

interface SatisfactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback?: string) => void;
}

const SatisfactionModal: React.FC<SatisfactionModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  if (!visible) return null;

  const handleSubmit = () => {
    onSubmit(rating, feedback.trim() || undefined);
    setRating(5);
    setFeedback('');
  };

  const ratingLabels = ['非常不满意', '不满意', '一般', '满意', '非常满意'];

  return (
    <View className="satisfaction-modal">
      <View className="modal-mask" onClick={onClose} />
      <View className="modal-content">
        <Text className="modal-title">服务评价</Text>
        
        <View className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <Text
              key={star}
              className={`star ${star <= rating ? 'active' : ''}`}
              onClick={() => setRating(star)}
            >
              ⭐
            </Text>
          ))}
        </View>

        <Text className="rating-label">{ratingLabels[rating - 1]}</Text>

        <Textarea
          className="feedback-input"
          placeholder="请输入您的建议和意见（选填）"
          value={feedback}
          onInput={(e) => setFeedback(e.detail.value)}
          maxlength={200}
        />

        <Button className="submit-btn" onClick={handleSubmit}>
          提交评价
        </Button>
      </View>
    </View>
  );
};

export default SatisfactionModal;

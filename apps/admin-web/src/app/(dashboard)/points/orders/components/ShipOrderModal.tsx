'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ShipOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { logisticsNo: string; logisticsCompany: string }) => Promise<void>;
}

export default function ShipOrderModal({
  open,
  onOpenChange,
  onSubmit,
}: ShipOrderModalProps) {
  const [formData, setFormData] = useState({
    logisticsNo: '',
    logisticsCompany: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.logisticsNo || !formData.logisticsCompany) {
      alert('请填写完整物流信息');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="发货"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '提交中...' : '确定'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-4">
        <div>
          <label className="block text-sm font-medium mb-1">物流公司</label>
          <Input
            value={formData.logisticsCompany}
            onChange={(e) => setFormData({ ...formData, logisticsCompany: e.target.value })}
            placeholder="例如：顺丰速运、中通快递"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">物流单号</label>
          <Input
            value={formData.logisticsNo}
            onChange={(e) => setFormData({ ...formData, logisticsNo: e.target.value })}
            placeholder="请输入物流单号"
          />
        </div>
      </div>
    </Modal>
  );
}

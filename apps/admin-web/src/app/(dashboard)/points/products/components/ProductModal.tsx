'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PointsProduct, CreateProductDto } from '@/services/pointsService';

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateProductDto) => Promise<void>;
  initialData?: PointsProduct;
}

export default function ProductModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: ProductModalProps) {
  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    description: '',
    coverImage: '',
    images: [],
    type: 'VIRTUAL',
    points: 0,
    stock: 0,
    status: 'ACTIVE',
    sortOrder: 0,
    categoryId: undefined,
    extraData: undefined,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        coverImage: initialData.coverImage || '',
        images: initialData.images || [],
        type: initialData.type,
        points: initialData.points,
        stock: initialData.stock,
        status: initialData.status,
        sortOrder: initialData.sortOrder,
        categoryId: initialData.categoryId || undefined,
        extraData: initialData.extraData || undefined,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        coverImage: '',
        images: [],
        type: 'VIRTUAL',
        points: 0,
        stock: 0,
        status: 'ACTIVE',
        sortOrder: 0,
        categoryId: undefined,
        extraData: undefined,
      });
    }
  }, [initialData, open]);

  const handleSubmit = async () => {
    if (!formData.name || formData.points! < 1) {
      alert('请填写完整信息');
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
      title={initialData ? '编辑商品' : '新增商品'}
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
          <label className="block text-sm font-medium mb-1">商品名称 *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入商品名称"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">商品描述</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="请输入商品描述"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">封面图 URL</label>
          <Input
            value={formData.coverImage}
            onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
            placeholder="请输入封面图 URL"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">商品类型</label>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <option value="VIRTUAL">虚拟商品</option>
              <option value="PHYSICAL">实物商品</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">兑换积分 *</label>
            <Input
              type="number"
              min={1}
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">库存数量</label>
            <Input
              type="number"
              min={0}
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">排序</label>
            <Input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">状态</label>
          <Select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          >
            <option value="ACTIVE">上架</option>
            <option value="INACTIVE">下架</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">扩展数据 (JSON)</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={formData.extraData ? JSON.stringify(formData.extraData, null, 2) : ''}
            onChange={(e) => {
              try {
                setFormData({ ...formData, extraData: JSON.parse(e.target.value) });
              } catch {
                // Ignore parse error
              }
            }}
            placeholder='例如：{"code": "123456"}'
          />
        </div>
      </div>
    </Modal>
  );
}

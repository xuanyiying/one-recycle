'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { pointsProductApi, PointsProduct, CreateProductDto, UpdateProductDto } from '@/services/pointsService';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/components/ui/toast';
import { ConfirmDialog, useConfirm } from '@/components/ui/confirm-dialog';
import ProductModal from './components/ProductModal';

export default function PointsProductsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<PointsProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [type, setType] = useState<'ALL' | 'VIRTUAL' | 'PHYSICAL'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PointsProduct | null>(null);

  const { confirm: showConfirm, dialogProps } = useConfirm();

  const debouncedKeyword = useDebounce(keyword, 300);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (debouncedKeyword) params.keyword = debouncedKeyword;
      if (status !== 'ALL') params.status = status;
      if (type !== 'ALL') params.type = type;

      const response = await pointsProductApi.getProducts(params);
      setProducts(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedKeyword, status, type]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product: PointsProduct) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleUpdateStatus = async (product: PointsProduct) => {
    try {
      const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await pointsProductApi.updateProduct(Number(product.id), { status: newStatus });
      await fetchProducts();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('操作失败，请重试');
    }
  };

  const handleDelete = async (product: PointsProduct) => {
    const confirmed = await showConfirm(`确定要删除商品"${product.name}"吗？`, {
      title: '确认操作',
      type: 'danger',
      confirmText: '确定',
    });
    if (!confirmed) return;

    try {
      await pointsProductApi.deleteProduct(Number(product.id));
      await fetchProducts();
      toast.success('删除成功');
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('删除失败，请重试');
    }
  };

  const handleSubmit = async (data: CreateProductDto | UpdateProductDto) => {
    try {
      if (editingProduct) {
        await pointsProductApi.updateProduct(Number(editingProduct.id), data);
      } else {
        await pointsProductApi.createProduct(data as CreateProductDto);
      }
      setModalOpen(false);
      await fetchProducts();
      toast.success(editingProduct ? '更新成功' : '创建成功');
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('操作失败，请重试');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 头部操作栏 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">商品管理</h2>
          <Button onClick={handleCreate}>新增商品</Button>
        </div>

        {/* 筛选器 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="搜索商品名称"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="ALL">全部状态</option>
            <option value="ACTIVE">上架中</option>
            <option value="INACTIVE">已下架</option>
          </Select>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            <option value="ALL">全部类型</option>
            <option value="VIRTUAL">虚拟商品</option>
            <option value="PHYSICAL">实物商品</option>
          </Select>
        </div>
      </Card>

      {/* 商品列表 */}
      <Card>
        <Table>
          <thead>
            <tr>
              <th>商品名称</th>
              <th>类型</th>
              <th>积分</th>
              <th>库存</th>
              <th>已兑换</th>
              <th>状态</th>
              <th>排序</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <Skeleton className="h-8 w-full" />
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  暂无商品
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id.toString()}>
                  <td>
                    <div className="flex items-center gap-2">
                      {product.coverImage && (
                        <Image
                          src={product.coverImage}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.type === 'VIRTUAL' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {product.type === 'VIRTUAL' ? '虚拟' : '实物'}
                    </span>
                  </td>
                  <td className="text-red-500 font-medium">{product.points}</td>
                  <td>{product.stock}</td>
                  <td>{product.soldCount}</td>
                  <td>
                    <Switch
                      checked={product.status === 'ACTIVE'}
                      onChange={() => handleUpdateStatus(product)}
                    />
                  </td>
                  <td>{product.sortOrder}</td>
                  <td>
                    <div className="flex gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        编辑
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleDelete(product)}
                        className="text-red-500"
                      >
                        删除
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* 分页 */}
        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-gray-500">
            共 {total} 条，第 {page} 页 / 共 {Math.ceil(total / limit)} 页
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      </Card>

      {/* 新增/编辑弹窗 */}
      <ProductModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmit}
        initialData={editingProduct || undefined}
      />
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

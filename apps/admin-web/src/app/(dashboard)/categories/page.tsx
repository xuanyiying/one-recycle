'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  categoryService, 
  Category, 
  CategoryType, 
  CategoryStatus 
} from '@/services/categoryService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Search,
  GripVertical,
  Image as ImageIcon,
  UploadCloud,
  Calculator,
  Scale,
  Boxes
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils/cn';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [iconLibrary, setIconLibrary] = useState([
    { id: 'icon-1', name: '电器', url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' rx='14' fill='%23E8F1FF'/><path d='M20 22h24v20H20z' fill='%234256D0'/><rect x='26' y='26' width='12' height='12' rx='2' fill='%23FFFFFF'/></svg>" },
    { id: 'icon-2', name: '金属', url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' rx='14' fill='%23F3F4F6'/><path d='M20 40l12-20 12 20z' fill='%236B7280'/><circle cx='32' cy='40' r='6' fill='%239CA3AF'/></svg>" },
    { id: 'icon-3', name: '纸品', url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' rx='14' fill='%23FFF7ED'/><rect x='18' y='16' width='28' height='32' rx='6' fill='%23FB923C'/><path d='M24 26h16M24 32h16M24 38h10' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round'/></svg>" },
    { id: 'icon-4', name: '玻璃', url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' rx='14' fill='%23ECFEFF'/><rect x='22' y='14' width='20' height='36' rx='6' fill='%2306B6D4'/><rect x='26' y='18' width='12' height='18' rx='4' fill='%23FFFFFF' opacity='0.7'/></svg>" },
    { id: 'icon-5', name: '塑料', url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' rx='14' fill='%23F0FDF4'/><path d='M24 14h16l6 12-8 22H26l-8-22z' fill='%2322C55E'/><circle cx='32' cy='26' r='5' fill='%23BBF7D0'/></svg>" },
    { id: 'icon-6', name: '纺织', url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' rx='14' fill='%23FDF2F8'/><path d='M20 18h24v28H20z' fill='%23EC4899'/><path d='M24 22h16M24 28h16M24 34h16M24 40h10' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round'/></svg>" },
  ]);
  const [selectedIconId, setSelectedIconId] = useState<string | null>('icon-1');
  const [customIcon, setCustomIcon] = useState<string | null>(null);
  const [customIconName, setCustomIconName] = useState('');
  const [iconDraggingId, setIconDraggingId] = useState<string | null>(null);
  const [priceMode, setPriceMode] = useState<'fixed' | 'formula'>('fixed');
  const [fixedPrice, setFixedPrice] = useState('2.2');
  const [priceUnit, setPriceUnit] = useState('kg');
  const [marketPrice, setMarketPrice] = useState('3.5');
  const [discount, setDiscount] = useState('0.9');
  const [fixedFee, setFixedFee] = useState('0.2');
  const [billingMode, setBillingMode] = useState<'weight' | 'count'>('weight');
  const [tiers, setTiers] = useState([
    { id: 'tier-1', min: '0', max: '1', price: '2.0' },
    { id: 'tier-2', min: '1', max: '5', price: '1.8' },
    { id: 'tier-3', min: '5', max: '', price: '1.5' },
  ]);

  const effectiveIcon = useMemo(() => {
    if (customIcon) return customIcon;
    return iconLibrary.find((icon) => icon.id === selectedIconId)?.url || '';
  }, [customIcon, iconLibrary, selectedIconId]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategoryTree();
      setCategories(data);
    } catch (error) {
      // toast handled by service/apiClient
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const getDataUrlSize = (dataUrl: string) => {
    const base64 = dataUrl.split(',')[1] || '';
    return Math.ceil((base64.length * 3) / 4);
  };

  const compressIcon = (file: File) => {
    return new Promise<{ dataUrl: string; size: number }>((resolve, reject) => {
      const reader = new FileReader();
      const img = new Image();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error('读取失败'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas不可用'));
          return;
        }
        const scale = Math.min(size / img.width, size / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const dx = (size - drawWidth) / 2;
        const dy = (size - drawHeight) / 2;
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
        let dataUrl = canvas.toDataURL('image/png');
        let dataSize = getDataUrlSize(dataUrl);
        if (dataSize > 50 * 1024) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.72);
          dataSize = getDataUrlSize(dataUrl);
        }
        if (dataSize > 50 * 1024) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          dataSize = getDataUrlSize(dataUrl);
        }
        resolve({ dataUrl, size: dataSize });
      };
      img.onerror = () => reject(new Error('图片解析失败'));
      reader.readAsDataURL(file);
    });
  };

  const handleIconUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('仅支持图片格式');
      return;
    }
    try {
      const result = await compressIcon(file);
      if (result.size > 50 * 1024) {
        toast.error('压缩后仍超过50KB，请更换图片');
        return;
      }
      setCustomIcon(result.dataUrl);
      setCustomIconName(file.name);
      setSelectedIconId(null);
      toast.success('图标已压缩至64×64');
    } catch (error) {
      toast.error('图标处理失败');
    }
  };

  const handleIconDrop = (targetId: string) => {
    if (!iconDraggingId || iconDraggingId === targetId) return;
    const currentIndex = iconLibrary.findIndex((icon) => icon.id === iconDraggingId);
    const targetIndex = iconLibrary.findIndex((icon) => icon.id === targetId);
    if (currentIndex === -1 || targetIndex === -1) return;
    const updated = [...iconLibrary];
    const [moved] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setIconLibrary(updated);
  };

  const pricingPreview = useMemo(() => {
    if (priceMode === 'fixed') {
      return `¥${fixedPrice}/${priceUnit}`;
    }
    return `市场价 × ${discount} - ${fixedFee}`;
  }, [priceMode, fixedPrice, priceUnit, discount, fixedFee]);

  const computedFormulaPrice = useMemo(() => {
    const market = Number(marketPrice || 0);
    const ratio = Number(discount || 0);
    const fee = Number(fixedFee || 0);
    const result = market * ratio - fee;
    if (Number.isNaN(result)) return 0;
    return Math.max(result, 0).toFixed(2);
  }, [marketPrice, discount, fixedFee]);

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这个分类吗？')) {
      try {
        await categoryService.deleteCategory(id);
        toast.success('分类已删除');
        loadCategories();
      } catch (error) {
        // handled
      }
    }
  };

  const renderCategoryRow = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedRows.has(category.id);
    const isVisible = category.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Simple filtering: if search query exists, show matching rows and their parents (logic simplified here to just show matching)
    if (searchQuery && !isVisible) {
      // If has children matching, might need to show. For now simple filter.
       if (!hasChildren) return null;
       // If children match, we might want to show parent. Complex tree filtering skipped for MVP.
    }

    return (
      <React.Fragment key={category.id}>
        <TableRow>
          <TableCell className="font-medium">
            <div 
              className="flex items-center" 
              style={{ paddingLeft: `${level * 24}px` }}
            >
              {hasChildren ? (
                <button 
                  onClick={() => toggleExpand(category.id)}
                  className="mr-2 p-1 hover:bg-secondary-100 rounded"
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              ) : (
                <span className="w-6 mr-2" />
              )}
              {category.icon && (
                <img 
                  src={category.icon.url} 
                  alt={category.name} 
                  className="w-6 h-6 mr-2 rounded object-cover" 
                />
              )}
              {category.name}
            </div>
          </TableCell>
          <TableCell>
            <Badge variant={category.type === CategoryType.RECYCLE ? 'default' : 'secondary'}>
              {category.type === CategoryType.RECYCLE ? '回收' : category.type === CategoryType.SALE ? '销售' : '通用'}
            </Badge>
          </TableCell>
          <TableCell>
             {category.priceInfo.type === 'fixed' ? (
               `¥${category.priceInfo.unitPrice}/${category.priceInfo.unit}`
             ) : category.priceInfo.type === 'range' ? (
               `¥${category.priceInfo.minPrice}-${category.priceInfo.maxPrice}/${category.priceInfo.unit}`
             ) : '面议'}
          </TableCell>
          <TableCell>
            <Badge variant={category.status === CategoryStatus.ACTIVE ? 'outline' : 'secondary'}>
              {category.status === CategoryStatus.ACTIVE ? '启用' : '禁用'}
            </Badge>
          </TableCell>
          <TableCell>{category.sortOrder}</TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-error hover:text-error/90"
                onClick={() => handleDelete(category.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {hasChildren && isExpanded && category.children?.map(child => renderCategoryRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">分类管理</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新增分类
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>回收价格定义</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  className={cn(
                    'flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all',
                    priceMode === 'fixed' ? 'border-primary-600 bg-primary-50' : 'border-secondary-100 bg-white'
                  )}
                  onClick={() => setPriceMode('fixed')}
                >
                  <div>
                    <div className="text-sm font-semibold">固定单价</div>
                    <div className="text-xs text-secondary-400">每单位统一价格</div>
                  </div>
                  <Scale className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  type="button"
                  className={cn(
                    'flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all',
                    priceMode === 'formula' ? 'border-primary-600 bg-primary-50' : 'border-secondary-100 bg-white'
                  )}
                  onClick={() => setPriceMode('formula')}
                >
                  <div>
                    <div className="text-sm font-semibold">公式定价</div>
                    <div className="text-xs text-secondary-400">市场价*折扣-固定费</div>
                  </div>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {priceMode === 'fixed' ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">固定单价</label>
                    <Input value={fixedPrice} onChange={(event) => setFixedPrice(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">计价单位</label>
                    <Input value={priceUnit} onChange={(event) => setPriceUnit(event.target.value)} />
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">市场价</label>
                    <Input value={marketPrice} onChange={(event) => setMarketPrice(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">折扣系数</label>
                    <Input value={discount} onChange={(event) => setDiscount(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">固定费用</label>
                    <Input value={fixedFee} onChange={(event) => setFixedFee(event.target.value)} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border border-secondary-100 bg-secondary-50 px-4 py-3 text-sm">
                <span className="text-muted-foreground">预览</span>
                <span className="font-semibold text-foreground">
                  {pricingPreview}
                  {priceMode === 'formula' && ` ≈ ¥${computedFormulaPrice}/${priceUnit}`}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>计费策略</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  className={cn(
                    'flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all',
                    billingMode === 'weight' ? 'border-primary-600 bg-primary-50' : 'border-secondary-100 bg-white'
                  )}
                  onClick={() => setBillingMode('weight')}
                >
                  <div>
                    <div className="text-sm font-semibold">按重量计费</div>
                    <div className="text-xs text-secondary-400">单位 kg</div>
                  </div>
                  <Scale className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  type="button"
                  className={cn(
                    'flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all',
                    billingMode === 'count' ? 'border-primary-600 bg-primary-50' : 'border-secondary-100 bg-white'
                  )}
                  onClick={() => setBillingMode('count')}
                >
                  <div>
                    <div className="text-sm font-semibold">按件数计费</div>
                    <div className="text-xs text-secondary-400">单位 件</div>
                  </div>
                  <Boxes className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 text-xs text-muted-foreground">
                  <span>起始</span>
                  <span>结束</span>
                  <span>单价</span>
                  <span></span>
                </div>
                {tiers.map((tier) => (
                  <div key={tier.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3">
                    <Input
                      value={tier.min}
                      onChange={(event) =>
                        setTiers((prev) => prev.map((item) => (item.id === tier.id ? { ...item, min: event.target.value } : item)))
                      }
                      placeholder="0"
                    />
                    <Input
                      value={tier.max}
                      onChange={(event) =>
                        setTiers((prev) => prev.map((item) => (item.id === tier.id ? { ...item, max: event.target.value } : item)))
                      }
                      placeholder={tier.id === tiers[tiers.length - 1].id ? '∞' : '1'}
                    />
                    <Input
                      value={tier.price}
                      onChange={(event) =>
                        setTiers((prev) => prev.map((item) => (item.id === tier.id ? { ...item, price: event.target.value } : item)))
                      }
                      placeholder="1.8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-error"
                      onClick={() => setTiers((prev) => prev.filter((item) => item.id !== tier.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setTiers((prev) => [
                        ...prev,
                        { id: `tier-${Date.now()}`, min: '', max: '', price: '' },
                      ])
                    }
                  >
                    新增阶梯
                  </Button>
                  <span className="text-xs text-secondary-400">支持{billingMode === 'weight' ? 'kg' : '件'}阶梯计价</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>图标配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-secondary-100 bg-secondary-50">
                  {effectiveIcon ? (
                    <img src={effectiveIcon} alt="分类图标" className="h-10 w-10" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-secondary-400" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">当前图标</div>
                  <div className="text-xs text-secondary-400">64×64 · ≤50KB</div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCustomIcon(null);
                    setCustomIconName('');
                    setSelectedIconId('icon-1');
                  }}
                >
                  恢复默认
                </Button>
              </div>

              <div className="rounded-xl border-2 border-dashed px-4 py-5 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-medium">上传 SVG/PNG 图标</div>
                  <div className="text-xs text-secondary-400">自动压缩至 64×64、≤50KB</div>
                  <label className="mt-2 cursor-pointer rounded-full border px-4 py-1 text-xs font-medium text-secondary-600">
                    {customIconName || '选择文件'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleIconUpload(event.target.files)}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">图标库</div>
                  <div className="text-xs text-secondary-400">拖拽排序</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {iconLibrary.map((icon) => (
                    <div
                      key={icon.id}
                      className={cn(
                        'group flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all',
                        selectedIconId === icon.id && !customIcon ? 'border-primary-500 bg-primary-50' : 'border-secondary-100'
                      )}
                      draggable
                      onDragStart={() => setIconDraggingId(icon.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleIconDrop(icon.id)}
                      onClick={() => {
                        setSelectedIconId(icon.id);
                        setCustomIcon(null);
                        setCustomIconName('');
                      }}
                    >
                      <img src={icon.url} alt={icon.name} className="h-8 w-8 rounded-lg" />
                      <span className="flex-1 truncate text-secondary-600">{icon.name}</span>
                      <GripVertical className="h-4 w-4 text-secondary-300" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>分类列表</CardTitle>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input 
                placeholder="搜索分类..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button size="icon" variant="ghost">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>价格</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>排序</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : categories.length > 0 ? (
                categories.map(category => renderCategoryRow(category))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    暂无分类数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

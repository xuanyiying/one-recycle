'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils/cn';
import {
  Category,
  categoryService,
  CategoryType,
  PriceType,
} from '@/services/categoryService';
import {
  Boxes,
  Calculator,
  ChevronDown,
  ChevronRight,
  Edit,
  GripVertical,
  Image as ImageIcon,
  Plus,
  Scale,
  Search,
  Trash2,
  UploadCloud
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [iconLibrary, setIconLibrary] = useState<{
    name: string | undefined; id: string; url: string 
}[]>([]);
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
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryType, setCategoryType] = useState<CategoryType>(CategoryType.RECYCLE);
  const [categorySortOrder, setCategorySortOrder] = useState('0');
  const [categoryIsVisible, setCategoryIsVisible] = useState(true);
  const [categoryIsFeatured, setCategoryIsFeatured] = useState(false);
  const [categoryParentId, setCategoryParentId] = useState('');

  const effectiveIcon = useMemo(() => {
    if (customIcon) return customIcon;
    return iconLibrary.find((icon) => icon.id === selectedIconId)?.url || '';
  }, [customIcon, iconLibrary, selectedIconId]);

  const parentOptions = useMemo(() => {
    const result: { id: number; name: string; depth: number }[] = [];
    const walk = (nodes: Category[], depth: number) => {
      nodes.forEach((node) => {
        result.push({ id: node.id, name: node.name, depth });
        if (node.children && node.children.length > 0) {
          walk(node.children, depth + 1);
        }
      });
    };
    walk(categories, 0);
    return result;
  }, [categories]);

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

  const compressIconToBlob = (file: File) => {
    return new Promise<{ blob: Blob; size: number }>((resolve, reject) => {
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

        const tryBlob = (type: string, quality?: number): Promise<Blob> => {
          return new Promise((res, rej) => {
            canvas.toBlob(
              (b) => (b ? res(b) : rej(new Error('转换失败'))),
              type,
              quality
            );
          });
        };

        (async () => {
          try {
            let blob = await tryBlob('image/png');
            if (blob.size > 50 * 1024) {
              blob = await tryBlob('image/jpeg', 0.72);
            }
            if (blob.size > 50 * 1024) {
              blob = await tryBlob('image/jpeg', 0.6);
            }
            resolve({ blob, size: blob.size });
          } catch (e) {
            reject(e);
          }
        })();
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
      const result = await compressIconToBlob(file);
      if (result.size > 50 * 1024) {
        toast.error('压缩后仍超过50KB，请更换图片');
        return;
      }
      const compressedFile = new File([result.blob], file.name, {
        type: result.blob.type || 'image/png',
      });
      const uploaded = await categoryService.uploadIcon(compressedFile);
      setCustomIcon(uploaded.url);
      setCustomIconName(file.name);
      setSelectedIconId(null);
      toast.success('图标已上传');
    } catch (error) {
      toast.error('图标上传失败');
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

  const createDefaultTiers = () => ([
    { id: 'tier-1', min: '0', max: '1', price: '2.0' },
    { id: 'tier-2', min: '1', max: '5', price: '1.8' },
    { id: 'tier-3', min: '5', max: '', price: '1.5' },
  ]);

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryName('');
    setCategorySlug('');
    setCategoryDescription('');
    setCategoryType(CategoryType.RECYCLE);
    setCategorySortOrder('0');
    setCategoryIsVisible(true);
    setCategoryIsFeatured(false);
    setCategoryParentId('');
    setPriceMode('fixed');
    setFixedPrice('2.2');
    setPriceUnit('kg');
    setMarketPrice('3.5');
    setDiscount('0.9');
    setFixedFee('0.2');
    setBillingMode('weight');
    setTiers(createDefaultTiers());
    setCustomIcon(null);
    setCustomIconName('');
    setSelectedIconId('icon-1');
  };

  const resolveSlug = (value: string) => {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
  };

  const buildPricingPayload = (): {
    priceInfo: {
      type: PriceType;
      unitPrice: number;
      unit: string;
      currency: string;
    };
    pricingRule: {
      basePrice: number;
      minWeight?: number;
      maxWeight?: number;
      isActive: boolean;
      ruleJson: Record<string, any>;
    };
  } => {
    const basePrice =
      priceMode === 'fixed' ? Number(fixedPrice || 0) : Number(computedFormulaPrice || 0);
    const normalizedTiers = tiers
      .map((tier) => ({
        minWeight: Number(tier.min || 0),
        maxWeight: tier.max === '' ? undefined : Number(tier.max),
        price: Number(tier.price || 0),
      }))
      .filter((tier) => !Number.isNaN(tier.price));
    const minWeight = normalizedTiers.length > 0 ? normalizedTiers[0].minWeight : undefined;
    const lastTier = normalizedTiers[normalizedTiers.length - 1];
    const maxWeight = lastTier?.maxWeight;

    return {
      priceInfo: {
        type: PriceType.FIXED,
        unitPrice: basePrice,
        unit: priceUnit || 'kg',
        currency: 'CNY',
      },
      pricingRule: {
        basePrice,
        minWeight,
        maxWeight,
        isActive: true,
        ruleJson: {
          pricingMode: priceMode,
          basePrice,
          unit: priceUnit || 'kg',
          billingMode,
          formula: priceMode === 'formula' ? {
            marketPrice: Number(marketPrice || 0),
            discount: Number(discount || 0),
            fixedFee: Number(fixedFee || 0),
          } : undefined,
          weightTiers: normalizedTiers,
        },
      },
    };
  };

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

  const handleEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setCategorySlug(category.seo?.slug || '');
    setCategoryDescription(category.description || '');
    setCategoryType(category.type);
    setCategorySortOrder(String(category.sortOrder ?? 0));
    setCategoryIsVisible(category.isVisible ?? true);
    setCategoryIsFeatured(category.isFeatured ?? false);
    setCategoryParentId(category.parentId ? String(category.parentId) : '');

    const ruleJson = category.pricingRule?.ruleJson as Record<string, any> | undefined;
    const currentMode = ruleJson?.pricingMode === 'formula' ? 'formula' : 'fixed';
    setPriceMode(currentMode);
    const unit = ruleJson?.unit || category.priceInfo?.unit || 'kg';
    setPriceUnit(unit);
    const basePrice = category.priceInfo?.unitPrice ?? category.pricingRule?.basePrice;
    if (basePrice !== undefined) {
      setFixedPrice(String(basePrice));
    }
    const formula = ruleJson?.formula;
    setMarketPrice(String(formula?.marketPrice ?? '3.5'));
    setDiscount(String(formula?.discount ?? '0.9'));
    setFixedFee(String(formula?.fixedFee ?? '0.2'));
    setBillingMode(ruleJson?.billingMode === 'count' ? 'count' : 'weight');

    if (Array.isArray(ruleJson?.weightTiers) && ruleJson.weightTiers.length > 0) {
      setTiers(
        ruleJson.weightTiers.map((tier: any, index: number) => ({
          id: `tier-${Date.now()}-${index}`,
          min: String(tier.minWeight ?? ''),
          max: tier.maxWeight === undefined || tier.maxWeight === null ? '' : String(tier.maxWeight),
          price: String(tier.price ?? ''),
        }))
      );
    } else {
      setTiers(createDefaultTiers());
    }

    const iconUrl = category.iconUrl || '';
    const matchedIcon = iconLibrary.find((icon) => icon.url === iconUrl);
    if (matchedIcon) {
      setSelectedIconId(matchedIcon.id);
      setCustomIcon(null);
      setCustomIconName('');
    } else if (iconUrl) {
      setSelectedIconId(null);
      setCustomIcon(iconUrl);
      setCustomIconName('');
    } else {
      setSelectedIconId('icon-1');
      setCustomIcon(null);
      setCustomIconName('');
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      toast.error('请输入分类名称');
      return;
    }
    const slugValue = categorySlug.trim() || resolveSlug(categoryName);
    if (!slugValue) {
      toast.error('请输入分类标识');
      return;
    }
    const pricingPayload = buildPricingPayload();
    const payload = {
      name: categoryName.trim(),
      description: categoryDescription || undefined,
      type: categoryType,
      parentId: categoryParentId ? Number(categoryParentId) : undefined,
      iconUrl: effectiveIcon || undefined,
      sortOrder: Number(categorySortOrder || 0),
      isVisible: categoryIsVisible,
      isFeatured: categoryIsFeatured,
      seo: {
        slug: slugValue,
      },
      priceInfo: pricingPayload.priceInfo,
      pricingRule: pricingPayload.pricingRule,
    };

    console.log('[Categories] Saving category:', {
      editingCategoryId,
      payloadSize: JSON.stringify(payload).length,
      hasIconUrl: !!payload.iconUrl,
      iconUrlLength: payload.iconUrl?.length || 0,
      apiBaseURL: process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'default',
    });

    setIsSaving(true);
    try {
      const saved = editingCategoryId
        ? await categoryService.updateCategory(editingCategoryId, payload)
        : await categoryService.createCategory(payload);
      console.log('[Categories] Category saved successfully:', saved);
      toast.success(editingCategoryId ? '分类已更新' : '分类已创建');
      setEditingCategoryId(saved.id);
      setCategorySlug(saved.seo?.slug || slugValue);
      await loadCategories();
    } catch (error: any) {
      console.error('[Categories] Save failed:', {
        status: error?.response?.status,
        message: error?.message,
        data: error?.response?.data,
        isAxiosError: error?.isAxiosError,
      });
      const errorMessage = error?.response?.data?.message || error?.message || '保存失败，请检查输入信息';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
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
              {category.iconUrl && (
                <img
                  src={category.iconUrl}
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
            <Badge variant={category.isVisible ? 'outline' : 'secondary'}>
              {category.isVisible ? '显示' : '隐藏'}
            </Badge>
          </TableCell>
          <TableCell>{category.sortOrder}</TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
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
        <Button onClick={resetCategoryForm}>
          <Plus className="mr-2 h-4 w-4" />
          新增分类
        </Button>
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
                <TableHead>显示</TableHead>
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

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>分类基础信息</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {editingCategoryId ? `编辑 #${editingCategoryId}` : '新建分类'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">分类名称</label>
                  <Input
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                    onBlur={() => {
                      if (!categorySlug.trim()) {
                        setCategorySlug(resolveSlug(categoryName));
                      }
                    }}
                    placeholder="如：废旧家电"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">标识</label>
                  <Input
                    value={categorySlug}
                    onChange={(event) => setCategorySlug(event.target.value)}
                    placeholder="如：appliances"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">描述</label>
                <textarea
                  value={categoryDescription}
                  onChange={(event) => setCategoryDescription(event.target.value)}
                  className="min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-primary"
                  placeholder="可选，描述分类特征或注意事项"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">分类类型</label>
                  <Select value={categoryType} onChange={(event) => setCategoryType(event.target.value as CategoryType)}>
                    <option value={CategoryType.RECYCLE}>回收</option>
                    <option value={CategoryType.SALE}>销售</option>
                    <option value={CategoryType.BOTH}>通用</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">父级分类</label>
                  <Select value={categoryParentId} onChange={(event) => setCategoryParentId(event.target.value)}>
                    <option value="">顶级分类</option>
                    {parentOptions
                      .filter((option) => option.id !== editingCategoryId)
                      .map((option) => (
                        <option key={option.id} value={option.id}>
                          {`${'—'.repeat(option.depth)} ${option.name}`}
                        </option>
                      ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">排序</label>
                  <Input
                    value={categorySortOrder}
                    onChange={(event) => setCategorySortOrder(event.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border border-secondary-100 bg-secondary-50 px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">前台展示</div>
                    <div className="text-xs text-muted-foreground">控制是否在小程序展示</div>
                  </div>
                  <Switch checked={categoryIsVisible} onCheckedChange={setCategoryIsVisible} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-secondary-100 bg-secondary-50 px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">推荐分类</div>
                    <div className="text-xs text-muted-foreground">用于首页推荐位</div>
                  </div>
                  <Switch checked={categoryIsFeatured} onCheckedChange={setCategoryIsFeatured} />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                <div>
                  <div className="font-medium">价格预览</div>
                  <div className="text-xs text-muted-foreground">保存后同步至计价规则</div>
                </div>
                <div className="font-semibold">
                  {pricingPreview}
                  {priceMode === 'formula' && ` ≈ ¥${computedFormulaPrice}/${priceUnit}`}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={resetCategoryForm} disabled={isSaving}>
                  重置
                </Button>
                <Button onClick={handleSaveCategory} disabled={isSaving}>
                  {isSaving ? '保存中...' : editingCategoryId ? '保存更新' : '创建分类'}
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>回收价格定义</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  className={cn(
                    'flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all',
                    priceMode === 'fixed' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5'
                  )}
                  onClick={() => setPriceMode('fixed')}
                >
                  <div>
                    <div className="text-sm font-semibold">固定单价</div>
                    <div className="text-xs text-muted-foreground">每单位统一价格</div>
                  </div>
                  <Scale className={cn("h-4 w-4", priceMode === 'fixed' ? "text-primary" : "text-muted-foreground")} />
                </button>
                <button
                  type="button"
                  className={cn(
                    'flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all',
                    priceMode === 'formula' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5'
                  )}
                  onClick={() => setPriceMode('formula')}
                >
                  <div>
                    <div className="text-sm font-semibold">公式定价</div>
                    <div className="text-xs text-muted-foreground">市场价*折扣-固定费</div>
                  </div>
                  <Calculator className={cn("h-4 w-4", priceMode === 'formula' ? "text-primary" : "text-muted-foreground")} />
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
                    'flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all',
                    billingMode === 'weight' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5'
                  )}
                  onClick={() => setBillingMode('weight')}
                >
                  <div>
                    <div className="text-sm font-semibold">按重量计费</div>
                    <div className="text-xs text-muted-foreground">单位 kg</div>
                  </div>
                  <Scale className={cn("h-4 w-4", billingMode === 'weight' ? "text-primary" : "text-muted-foreground")} />
                </button>
                <button
                  type="button"
                  className={cn(
                    'flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all',
                    billingMode === 'count' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5'
                  )}
                  onClick={() => setBillingMode('count')}
                >
                  <div>
                    <div className="text-sm font-semibold">按件数计费</div>
                    <div className="text-xs text-muted-foreground">单位 件</div>
                  </div>
                  <Boxes className={cn("h-4 w-4", billingMode === 'count' ? "text-primary" : "text-muted-foreground")} />
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
                        'group flex cursor-pointer items-center gap-2 rounded-lg border-2 px-3 py-2 text-xs transition-all',
                        selectedIconId === icon.id && !customIcon ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5'
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
                      <img src={icon.url} alt={icon.name || '图标'}  className="h-8 w-8 rounded-lg" />
                      <span className={cn("flex-1 truncate", selectedIconId === icon.id && !customIcon ? "text-primary" : "text-muted-foreground")}>{icon.name || ''}</span>
                      <GripVertical className={cn("h-4 w-4", selectedIconId === icon.id && !customIcon ? "text-primary" : "text-muted-foreground/50")} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

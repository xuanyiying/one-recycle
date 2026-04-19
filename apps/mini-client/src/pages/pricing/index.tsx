import logger from '@/utils/logger'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { View, Text, Picker, Switch, Button } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { Icon } from '@/components/Icon'
import { WEIGHT_OPTIONS, PICKUP_TIME_OPTIONS } from '@/config/constants'
import { getActiveCategories, getCategoryDetail } from '@/services/category'
import { estimateItemPrices } from '@/services/pricing'
import { Category } from '@/types/category'
import { ItemCondition } from '@/types/order'
import './index.scss'

interface WeightOption {
  label: string;
  value: string;
  minWeight: number;
  maxWeight: number;
}

interface PriceRange {
  min: number;
  max: number;
}

export default function Pricing() {
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [categoryName, setCategoryName] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [weightOptions, setWeightOptions] = useState<WeightOption[]>([]);
  const [selectedWeightIndex, setSelectedWeightIndex] = useState(0);
  const [estimatedPrice, setEstimatedPrice] = useState<PriceRange>({ min: 0, max: 0 });
  const [doorToDoorService, setDoorToDoorService] = useState(true);
  const [pickupTime, setPickupTime] = useState<string>(
    PICKUP_TIME_OPTIONS[0] ?? '',
  );
  const [loading, setLoading] = useState(true);

  // 解析重量范围字符串，返回最小和最大重量
  const parseWeightRange = useCallback((weightValue: string): { min: number; max: number } => {
    if (weightValue.endsWith('+')) {
      const min = parseFloat(weightValue.replace('+', ''));
      return { min, max: min * 2 }; // 对于30+，假设最大为60
    }
    if (weightValue.includes('-')) {
      const [min, max] = weightValue.split('-').map(v => parseFloat(v));
      return { min: min || 0, max: max || min || 0 };
    }
    // 单个值（如phone, tablet等数码产品）
    return { min: 1, max: 1 };
  }, []);

  // 根据分类获取重量选项
  const getWeightOptionsByCategory = useCallback((catName?: string): WeightOption[] => {
    const baseOptions = (() => {
      if (catName?.includes('旧衣') || catName?.includes('衣物')) {
        return WEIGHT_OPTIONS.CLOTHING;
      } else if (catName?.includes('数码') || catName?.includes('电子')) {
        return WEIGHT_OPTIONS.DIGITAL;
      } else {
        return WEIGHT_OPTIONS.DEFAULT;
      }
    })();

    // 添加重量范围解析
    return baseOptions.map(option => {
      const { min, max } = parseWeightRange(option.value);
      return {
        label: option.label,
        value: option.value,
        minWeight: min,
        maxWeight: max
      };
    });
  }, [parseWeightRange]);

  // 计算价格显示文本
  const getPriceDisplayText = useCallback((): string => {
    const priceInfo = category?.priceInfo;
    if (!priceInfo) return '价格面议';

    if (priceInfo.type === 'fixed' && priceInfo.unitPrice) {
      return `¥${priceInfo.unitPrice.toFixed(2)}/${priceInfo.unit}`;
    }
    if (priceInfo.type === 'range' && priceInfo.minPrice && priceInfo.maxPrice) {
      return `¥${priceInfo.minPrice.toFixed(2)}-${priceInfo.maxPrice.toFixed(2)}/${priceInfo.unit}`;
    }
    return '价格面议';
  }, [category]);

  // 计算估价 - 使用后端API
  const calculatePrice = useCallback(async () => {
    if (!category) {
      setEstimatedPrice({ min: 0, max: 0 });
      return;
    }

    const selectedOption = weightOptions[selectedWeightIndex];
    if (!selectedOption) {
      setEstimatedPrice({ min: 0, max: 0 });
      return;
    }

    try {
      // 使用平均重量进行估算
      const avgWeight = (selectedOption.minWeight + selectedOption.maxWeight) / 2;

      // 调用后端API进行价格估算
      const pricing = await estimateItemPrices([{
        id: `temp-${Date.now()}`,
        categoryId: String(category.id),
        categoryName: category.name,
        brandModel: '',
        condition: ItemCondition.GOOD,
        weight: avgWeight,
        quantity: 1,
        photos: [],
        notes: '',
        estimatedPrice: { min: 0, max: 0, currency: 'CNY' },
        createdAt: new Date().toISOString()
      }]);

      setEstimatedPrice({
        min: pricing.totalEstimate.min,
        max: pricing.totalEstimate.max
      });
    } catch (error) {
      logger.error('价格估算失败:', error);
      // 降级方案：使用分类配置的价格信息
      const priceInfo = category.priceInfo;
      if (priceInfo.type === 'fixed' && priceInfo.unitPrice) {
        const weight = (selectedOption.minWeight + selectedOption.maxWeight) / 2;
        const price = priceInfo.unitPrice * weight;
        setEstimatedPrice({ min: price, max: price });
      } else if (priceInfo.type === 'range' && priceInfo.minPrice && priceInfo.maxPrice) {
        setEstimatedPrice({
          min: priceInfo.minPrice,
          max: priceInfo.maxPrice
        });
      } else {
        setEstimatedPrice({ min: 0, max: 0 });
      }
    }
  }, [category, weightOptions, selectedWeightIndex]);

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      const instance = getCurrentInstance();
      const { categoryId: paramCategoryId, categoryName: paramCategoryName, weight } = instance?.router?.params || {};

      try {
        const categoriesData = await getActiveCategories();

        let categoryData: Category | undefined;
        if (paramCategoryId) {
          try {
            categoryData = await getCategoryDetail(paramCategoryId);
          } catch (detailError) {
            logger.warn('获取分类详情失败，使用列表数据:', detailError);
            categoryData = categoriesData.find(cat => cat.id === parseInt(paramCategoryId));
          }
        }

        const weightOptionsData = getWeightOptionsByCategory(categoryData?.name || paramCategoryName);

        let selectedWeightIndexData = 0;
        if (weight) {
          const weightNum = parseFloat(weight);
          const foundIndex = weightOptionsData.findIndex(option => {
            return weightNum >= option.minWeight && weightNum <= option.maxWeight;
          });
          if (foundIndex !== -1) {
            selectedWeightIndexData = foundIndex;
          }
        }

        setCategoryId(paramCategoryId ? parseInt(paramCategoryId) : undefined);
        setCategoryName(paramCategoryName);
        setCategory(categoryData);
        setWeightOptions(weightOptionsData);
        setSelectedWeightIndex(selectedWeightIndexData);
        setLoading(false);
      } catch (error) {
        logger.error('获取分类数据失败:', error);
        Taro.showToast({
          title: '加载数据失败',
          icon: 'none',
          duration: 2000
        });
        setLoading(false);
      }
    };

    initializeData();
  }, [getWeightOptionsByCategory]);

  // 当分类或重量选择变化时重新计算价格
  useEffect(() => {
    if (!loading && category) {
      calculatePrice();
    }
  }, [category, selectedWeightIndex, loading, calculatePrice]);

  // 重量选择变化
  const onWeightChange = useCallback((e: any) => {
    setSelectedWeightIndex(e.detail.value);
  }, []);

  // 上门服务开关
  const onDoorToDoorChange = useCallback((e: any) => {
    setDoorToDoorService(e.target.value);
  }, []);

  // 时间选择
  const onTimeChange = useCallback((e: any) => {
    const index = Number(e.detail.value);
    const selectedTime = PICKUP_TIME_OPTIONS[index] ?? '';
    setPickupTime(selectedTime);
  }, []);

  // 提交估价
  const onSubmitEstimate = useCallback(() => {
    const selectedWeight = weightOptions[selectedWeightIndex];
    const weightValue = selectedWeight?.value || '';
    const priceText = estimatedPrice.min === estimatedPrice.max
      ? `¥${estimatedPrice.min.toFixed(2)}`
      : `¥${estimatedPrice.min.toFixed(2)}-${estimatedPrice.max.toFixed(2)}`;

    Taro.showModal({
      title: '估价结果',
      content: `${category?.name || categoryName}\n重量: ${selectedWeight?.label}\n预估价格: ${priceText}\n${doorToDoorService ? '包含上门服务' : '自送到店'}`,
      confirmText: '确认下单',
      cancelText: '重新估价',
      success: (res) => {
        if (res.confirm) {
          Taro.navigateTo({
            url: `/pages/recycle/index?categoryId=${categoryId}&category=${encodeURIComponent(category?.name || categoryName || '')}&weight=${weightValue}&estimatedPrice=${estimatedPrice.min}`
          });
        }
      }
    });
  }, [category, categoryName, weightOptions, selectedWeightIndex, estimatedPrice, doorToDoorService, categoryId]);

  // 返回首页
  const onBackToHome = useCallback(() => {
    Taro.switchTab({
      url: '/pages/index/index'
    });
  }, []);

  // 使用useMemo优化渲染性能
  const isClothingCategory = useMemo(() => {
    return (category?.name || categoryName)?.includes('旧衣') || (category?.name || categoryName)?.includes('衣物');
  }, [category?.name, categoryName]);

  const themeClass = useMemo(() => {
    return isClothingCategory ? 'clothing-theme' : 'digital-theme';
  }, [isClothingCategory]);

  const priceDisplayText = useMemo(() => getPriceDisplayText(), [getPriceDisplayText]);

  const estimatedPriceText = useMemo(() => {
    if (estimatedPrice.min === 0 && estimatedPrice.max === 0) {
      return '计算中...';
    }
    if (estimatedPrice.min === estimatedPrice.max) {
      return `¥${estimatedPrice.min.toFixed(2)}`;
    }
    return `¥${estimatedPrice.min.toFixed(2)}-${estimatedPrice.max.toFixed(2)}`;
  }, [estimatedPrice]);

  if (loading) {
    return (
      <View className='pricing-page'>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <View className={`pricing-page ${themeClass}`}>
      {/* 头部背景 */}
      <View className='header-background'>
        <View className='header'>
          <Button
            className='back-button'
            onClick={onBackToHome}
          >
            <Icon name='back' size={20} color='white' />
            <Text className='header-title'>支付宝回收</Text>
          </Button>
          <View className='header-icons'>
            <Icon name='success' size={20} color='white' />
            <Icon name='info' size={20} color='white' />
            <Icon name='warn' size={20} color='white' />
          </View>
        </View>

        {/* 分类信息 */}
        <View className='category-info'>
          <Text className='category-title'>{isClothingCategory ? '有偿回收' : '多平台一键优选'}</Text>
          <Text className='category-subtitle'>{isClothingCategory ? '美衣换钱！' : '限时1元'}</Text>
          <Text className='category-desc'>{category?.name || categoryName}</Text>
        </View>
      </View>

      {/* 内容区域 */}
      <View className='content-container'>
        {/* 回收信息卡片 */}
        <View className='recycle-info-card'>
          <Text className='info-title'>
            {isClothingCategory ? '回收价格' : '回收价格'}
          </Text>
          <Text className='info-subtitle'>
            {priceDisplayText}
          </Text>

          {/* 重量/类型选择 */}
          <View className='weight-section'>
            <Text className='section-title'>
              {isClothingCategory ? '重量范围' : '设备类型'}
            </Text>
            <Picker
              mode='selector'
              range={weightOptions}
              rangeKey='label'
              onChange={onWeightChange}
              value={selectedWeightIndex}
            >
              <View className='weight-picker'>
                <Text className='picker-text'>
                  {weightOptions[selectedWeightIndex]?.label || '请选择'}
                </Text>
                <Icon name='waiting' size={16} color='#666' />
              </View>
            </Picker>
          </View>
        </View>

        {/* 服务选项 */}
        <View className='service-options'>
          <View className='service-item'>
            <View className='service-info'>
              <Icon name='info' size={20} color='#666' />
              <Text className='service-text'>旧衣回收-上门</Text>
            </View>
            <Icon name='success' size={16} color='#666' />
          </View>

          <View className='service-item'>
            <View className='service-info'>
              <Icon name='waiting' size={20} color='#666' />
              <Text className='service-text'>订单查询</Text>
            </View>
            <Icon name='success' size={16} color='#666' />
          </View>
        </View>

        {/* 上门回收信息 */}
        <View className='pickup-info'>
          <Text className='pickup-title'>上门回收</Text>
          <Text className='pickup-subtitle'>
            {isClothingCategory ? '旧衣服变现金，环保又赚钱' : '数码产品快速变现'}
          </Text>

          <View className='pickup-details'>
            <View className='pickup-time'>
              <Text className='time-label'>上门时间</Text>
              <Picker
                mode='selector'
                range={PICKUP_TIME_OPTIONS}
                value={PICKUP_TIME_OPTIONS.indexOf(pickupTime)}
                onChange={onTimeChange}
              >
                <View className='time-picker'>
                  <Text className='time-value'>{pickupTime}</Text>
                  <Icon name='waiting' size={16} color='#666' />
                </View>
              </Picker>
            </View>

            <View className='pickup-switch'>
              <Text className='switch-label'>上门回收</Text>
              <Switch
                checked={doorToDoorService}
                onChange={onDoorToDoorChange}
              />
            </View>
          </View>
        </View>

        {/* 估价结果 */}
        <View className='estimate-result'>
          <Text className='result-label'>预估价格</Text>
          <Text className='result-price'>{estimatedPriceText}</Text>
        </View>
      </View>

      {/* 底部按钮 */}
      <View className='bottom-actions'>
        <Button
          className='estimate-button'
          onClick={onSubmitEstimate}
        >
          同意协议并立即估价
        </Button>
      </View>
    </View>
  );
}

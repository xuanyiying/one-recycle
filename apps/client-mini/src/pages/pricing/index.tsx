import { useState, useEffect, useCallback, useMemo } from 'react'
import { View, Text, Picker, Switch } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { IconFont } from '@nutui/icons-react-taro'
import { getActiveCategories, getCategoryDetail } from '@/services/category'
import { Category } from '@/types/category'
import './index.scss'
import { Button } from '@nutui/nutui-react-taro'

interface WeightOption {
  label: string;
  value: string;
  price: string;
}

export default function Pricing() {
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [categoryName, setCategoryName] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [weightOptions, setWeightOptions] = useState<WeightOption[]>([]);
  const [selectedWeightIndex, setSelectedWeightIndex] = useState(0);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [doorToDoorService, setDoorToDoorService] = useState(true);
  const [pickupTime, setPickupTime] = useState('9-12点');
  const [loading, setLoading] = useState(true);

  // 根据分类获取重量选项
  const getWeightOptionsByCategory = useCallback((categoryName?: string): WeightOption[] => {
    if (categoryName?.includes('旧衣') || categoryName?.includes('衣物')) {
      return [
        { label: '3~5kg', value: '3-5', price: '2.40-4.00' },
        { label: '5~10kg', value: '5-10', price: '4.74-7.90' },
        { label: '10~30kg', value: '10-30', price: '30-75' },
        { label: '30kg以上', value: '30+', price: '75+' }
      ];
    } else if (categoryName?.includes('数码') || categoryName?.includes('电子')) {
      return [
        { label: '手机', value: 'phone', price: '50-500' },
        { label: '平板', value: 'tablet', price: '100-800' },
        { label: '笔记本', value: 'laptop', price: '200-2000' },
        { label: '其他数码', value: 'other', price: '20-300' }
      ];
    } else {
      return [
        { label: '1kg以下', value: '0-1', price: '5-15' },
        { label: '1-5kg', value: '1-5', price: '15-50' },
        { label: '5-10kg', value: '5-10', price: '50-100' },
        { label: '10kg以上', value: '10+', price: '100+' }
      ];
    }
  }, []);

  // 计算估价
  const calculatePrice = useCallback(() => {
    const selectedOption = weightOptions[selectedWeightIndex];
    
    if (selectedOption) {
      // 简单的价格计算逻辑
      const priceRange = selectedOption.price.split('-');
      const basePrice = parseFloat(priceRange[0]) || 0;
      const unitPrice = category?.priceInfo?.unitPrice || 1;
      const estimatedPriceValue = Math.round(basePrice * unitPrice * 100) / 100;
      
      setEstimatedPrice(estimatedPriceValue);
    }
  }, [weightOptions, selectedWeightIndex, category]);

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      // 获取路由参数
      const instance = getCurrentInstance();
      const { categoryId, categoryName, weight } = instance?.router?.params || {};
      
      try {
        // 获取分类数据
        const categoriesData = await getActiveCategories();
        
        let categoryData: Category | undefined;
        if (categoryId) {
          // 优先使用API获取详细分类信息
          try {
            categoryData = await getCategoryDetail(categoryId);
          } catch (detailError) {
            console.warn('获取分类详情失败，使用列表数据:', detailError);
            categoryData = categoriesData.find(cat => cat.id === parseInt(categoryId));
          }
        }

        // 根据分类设置重量选项和价格
        const weightOptionsData = getWeightOptionsByCategory(categoryData?.name || categoryName);
        
        // 如果传入了重量参数，找到对应的重量选项索引
        let selectedWeightIndexData = 0;
        if (weight) {
          const weightNum = parseFloat(weight);
          const foundIndex = weightOptionsData.findIndex(option => {
            const optionWeight = parseFloat(option.value);
            return Math.abs(optionWeight - weightNum) < 0.1; // 允许0.1kg的误差
          });
          if (foundIndex !== -1) {
            selectedWeightIndexData = foundIndex;
          }
        }
        
        setCategoryId(categoryId ? parseInt(categoryId) : undefined);
        setCategoryName(categoryName);
        setCategory(categoryData);
        setWeightOptions(weightOptionsData);
        setSelectedWeightIndex(selectedWeightIndexData);
        setLoading(false);
        
        // 计算价格
        setTimeout(() => {
          calculatePrice();
        }, 0);
      } catch (error) {
        console.error('获取分类数据失败:', error);
        Taro.showToast({
          title: '加载数据失败',
          icon: 'none',
          duration: 2000
        });
        setLoading(false);
      }
    };

    initializeData().then(r => console.log(r));
  }, [getWeightOptionsByCategory, calculatePrice]);

  // 重量选择变化
  const onWeightChange = useCallback((e: any) => {
    setSelectedWeightIndex(e.detail.value);
    // 延迟计算价格以确保状态更新
    setTimeout(() => {
      calculatePrice();
    }, 0);
  }, [calculatePrice]);

  // 上门服务开关
  const onDoorToDoorChange = useCallback((e: any) => {
    setDoorToDoorService(e.target.value);
  }, []);

  // 时间选择
  const timeOptions = ['9-12点', '12-15点', '15-18点', '18-21点'];
  const onTimeChange = useCallback((e: any) => {
    const selectedTime = timeOptions[e.detail.value];
    setPickupTime(selectedTime);
  }, []);

  // 提交估价
  const onSubmitEstimate = useCallback(() => {
    const selectedWeight = weightOptions[selectedWeightIndex];
    const weightValue = selectedWeight?.value || '';
    
    Taro.showModal({
      title: '估价结果',
      content: `${category?.name || categoryName}\n重量: ${selectedWeight?.label}\n预估价格: ¥${estimatedPrice}\n${doorToDoorService ? '包含上门服务' : '自送到店'}`,
      confirmText: '确认下单',
      cancelText: '重新估价',
      success: (res) => {
        if (res.confirm) {
          // 跳转到回收表单页面，携带估价信息
          Taro.navigateTo({
            url: `/pages/recycle/index?categoryId=${categoryId}&category=${encodeURIComponent(category?.name || categoryName || '')}&weight=${weightValue}&estimatedPrice=${estimatedPrice}`
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
            <IconFont name='back' size={20} color='white' />
            <Text className='header-title'>支付宝回收</Text>
          </Button>
          <View className='header-icons'>
            <IconFont name='success' size={20} color='white' />
            <IconFont name='info' size={20} color='white' />
            <IconFont name='warn' size={20} color='white' />
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
            {isClothingCategory ? '还可得 ¥2.40-4.00/kg' : '还可得 ¥50-500/件'}
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
                <Text className='picker-price'>
                  ¥{weightOptions[selectedWeightIndex]?.price || '0'}
                </Text>
                <IconFont name='waiting' size={16} color='#666' />
              </View>
            </Picker>
          </View>
        </View>

        {/* 服务选项 */}
        <View className='service-options'>
          <View className='service-item'>
            <View className='service-info'>
              <IconFont name='info' size={20} color='#666' />
              <Text className='service-text'>旧衣回收-上门</Text>
            </View>
            <IconFont name='success' size={16} color='#666' />
          </View>
          
          <View className='service-item'>
            <View className='service-info'>
              <IconFont name='download' size={20} color='#666' />
              <Text className='service-text'>旧衣回收-到店</Text>
            </View>
            <IconFont name='success' size={16} color='#666' />
          </View>
          
          <View className='service-item'>
            <View className='service-info'>
              <IconFont name='waiting' size={20} color='#666' />
              <Text className='service-text'>订单查询</Text>
            </View>
            <IconFont name='success' size={16} color='#666' />
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
                range={timeOptions}
                value={timeOptions.indexOf(pickupTime)}
                onChange={onTimeChange}
              >
                <View className='time-picker'>
                  <Text className='time-value'>{pickupTime}</Text>
                  <IconFont name='waiting' size={16} color='#666' />
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
          <Text className='result-price'>¥{estimatedPrice.toFixed(2)}</Text>
        </View>
      </View>

      {/* 底部按钮 */}
      <View className='bottom-actions'>
        <Button 
          className='estimate-button'
          color='primary'
          size='large'
          block
          onClick={onSubmitEstimate}
        >
          同意协议并立即估价
        </Button>
      </View>
    </View>
  );
}
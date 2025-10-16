import { useState, useEffect, useCallback } from 'react'
import { View, Text, Input, Textarea, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useAuth } from '../../../hooks/useAuth'
import { getAllCategories } from '../../../services/category'
import { createOrder } from '../../../services/order'
import CategorySelector from '../../../components/CategorySelector'
import ImageUploader from '../../../components/ImageUploader'
import AddressSelector from '../../../components/AddressSelector'
import TimeSelector from '../../../components/TimeSelector'
import PriceEstimator from '../../../components/PriceEstimator'
import AuthGuard from '../../../components/AuthGuard'
import './index.scss'

interface FormData {
  category: string
  description: string
  weight: string
  images: string[]
  pickupAddress: string
  addressId?: number
  pickupTime: string
  contactPhone: string
  remarks: string
}

export default function RecycleForm() {
  const router = useRouter()
  const { isLoggedIn, requireAuth } = useAuth()
  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState<FormData>({
    category: '',
    description: '',
    weight: '',
    images: [],
    pickupAddress: '',
    pickupTime: '',
    contactPhone: '',
    remarks: ''
  })
  const [loading, setLoading] = useState(false)

  // 初始化数据
  useEffect(() => {
    initPageData()
  }, [])

  // 从路由参数获取预选分类
  useEffect(() => {
    const { category } = router.params
    if (category) {
      setFormData(prev => ({
        ...prev,
        category: decodeURIComponent(category)
      }))
    }
  }, [router.params])

  const initPageData = async () => {
    try {
      const categories = await getAllCategories()
      setCategories(categories || [])
    } catch (error) {
      console.error('初始化数据失败:', error)
      Taro.showToast({
        title: '数据加载失败',
        icon: 'none'
      })
    }
  }

  // 处理表单输入
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  // 监听地址选择事件
  useEffect(() => {
    const handleAddressSelected = (data: { address: string; addressId?: number }) => {
      setFormData(prev => ({
        ...prev,
        pickupAddress: data.address,
        addressId: data.addressId
      }))
    }
    
    Taro.eventCenter.on('addressSelected', handleAddressSelected)
    
    return () => {
      Taro.eventCenter.off('addressSelected', handleAddressSelected)
    }
  }, [])

  // 表单验证
  const validateForm = useCallback(() => {
    if (!formData.category) {
      Taro.showToast({ title: '请选择回收分类', icon: 'none' })
      return false
    }
    if (!formData.description.trim()) {
      Taro.showToast({ title: '请填写物品描述', icon: 'none' })
      return false
    }
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      Taro.showToast({ title: '请填写正确的重量', icon: 'none' })
      return false
    }
    if (!formData.pickupAddress.trim()) {
      Taro.showToast({ title: '请选择上门地址', icon: 'none' })
      return false
    }
    if (!formData.pickupTime) {
      Taro.showToast({ title: '请选择上门时间', icon: 'none' })
      return false
    }
    if (!formData.contactPhone.trim()) {
      Taro.showToast({ title: '请填写联系电话', icon: 'none' })
      return false
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(formData.contactPhone)) {
      Taro.showToast({ title: '请填写正确的手机号', icon: 'none' })
      return false
    }
    
    return true
  }, [formData])

  // 提交表单
  const handleSubmit = useCallback(async () => {
    if (!isLoggedIn) {
      requireAuth()
      return
    }

    if (!validateForm()) return

    setLoading(true)
      
    try {
      // 获取选中的分类ID
      const selectedCategory = categories.find(cat => cat.name === formData.category)
      if (!selectedCategory) {
        throw new Error('请选择回收分类')
      }

      // 检查是否选择了地址
      if (!formData.addressId) {
        Taro.showToast({
          title: '请选择取件地址',
          icon: 'none'
        })
        return
      }

      // 构造RecycleFormData格式的数据
      const recycleFormData = {
        categoryId: selectedCategory.id,
        items: [{
          name: formData.category,
          description: formData.description,
          estimatedWeight: parseFloat(formData.weight) || 0,
          photos: formData.images,
          condition: 'good' // 默认状态
        }],
        addressId: formData.addressId,
        appointmentTime: formData.pickupTime,
        notes: formData.remarks,
        doorToDoorService: true
      }

      const result = await createOrder(recycleFormData)

      if (result.success && result.data) {
        Taro.showToast({
          title: '提交成功',
          icon: 'success'
        })
        
        // 跳转到订单确认页
        setTimeout(() => {
          Taro.navigateTo({
            url: `/pages/order/confirm/index?data=${encodeURIComponent(JSON.stringify({
              ...formData,
              orderId: result.data!.id
            }))}`
          })
        }, 1500)
      } else {
        throw new Error(result.message || '提交失败')
      }
    } catch (error) {
      console.error('提交订单失败:', error)
      Taro.showToast({
        title: error instanceof Error ? error.message : '提交失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }, [formData, validateForm, requireAuth, categories, isLoggedIn])

  return (
    <AuthGuard>
      <View className='recycle-form-page'>
      {/* 页面标题 */}
      <View className='page-header'>
        <Text className='page-title'>回收物信息</Text>
        <Text className='page-subtitle'>请详细填写回收物品信息</Text>
      </View>

      <View className='form-container'>
        {/* 分类选择 */}
        <View className='form-section'>
          <CategorySelector
            categories={categories}
            value={formData.category}
            onChange={(category) => handleInputChange('category', category)}
            placeholder='请选择回收分类'
            required={true}
          />
        </View>

        {/* 物品描述 */}
        <View className='form-section'>
          <Text className='section-title'>物品描述 *</Text>
          <Textarea
            className='textarea-input'
            placeholder='请详细描述物品的品牌、型号、新旧程度等信息'
            value={formData.description}
            onInput={(e) => handleInputChange('description', e.detail.value)}
            maxlength={200}
          />
          <Text className='char-count'>{formData.description.length}/200</Text>
        </View>

        {/* 重量输入和价格估算 */}
        <View className='form-section'>
          <PriceEstimator
            categories={categories}
            category={formData.category}
            weight={formData.weight}
            onWeightChange={(weight) => handleInputChange('weight', weight)}
            title='预估重量'
            required={true}
          />
        </View>

        {/* 图片上传 */}
        <View className='form-section'>
          <ImageUploader
            images={formData.images}
            onChange={(images) => setFormData(prev => ({ ...prev, images }))}
            maxCount={6}
            title='物品照片'
            description='上传物品照片有助于更准确的估价'
          />
        </View>

        {/* 上门地址 */}
        <View className='form-section'>
          <AddressSelector
            value={formData.pickupAddress}
            onChange={(address, addressId) => {
              setFormData(prev => ({ 
                ...prev, 
                pickupAddress: address,
                addressId: addressId 
              }))
            }}
            placeholder='请选择上门地址'
            required={true}
          />
        </View>

        {/* 上门时间 */}
        <View className='form-section'>
          <TimeSelector
            value={formData.pickupTime}
            onChange={(time) => handleInputChange('pickupTime', time)}
            placeholder='请选择上门时间'
            required={true}
            title='上门时间'
          />
        </View>

        {/* 联系电话 */}
        <View className='form-section'>
          <Text className='section-title'>联系电话 *</Text>
          <Input
            className='phone-input'
            type='number'
            placeholder='请输入联系电话'
            value={formData.contactPhone}
            onInput={(e) => handleInputChange('contactPhone', e.detail.value)}
            maxlength={11}
          />
        </View>

        {/* 备注 */}
        <View className='form-section'>
          <Text className='section-title'>备注信息</Text>
          <Textarea
            className='textarea-input'
            placeholder='其他需要说明的信息（选填）'
            value={formData.remarks}
            onInput={(e) => handleInputChange('remarks', e.detail.value)}
            maxlength={100}
          />
          <Text className='char-count'>{formData.remarks.length}/100</Text>
        </View>
      </View>

      {/* 底部提交按钮 */}
      <View className='submit-container'>
        <Button 
          className='submit-btn' 
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
        >
          {loading ? '提交中...' : '提交回收申请'}
        </Button>
      </View>
      </View>
    </AuthGuard>
  )
}
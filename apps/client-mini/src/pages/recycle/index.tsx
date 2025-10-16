import { useState, useEffect, useCallback } from 'react'
import { View, Text, Button, Input, Picker, Switch } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Icon } from '@taroify/icons'
import { useAppContext } from '../../store'
import { createOrder, createJdExpressOrder } from '../../services/order'
import { getUserAddresses } from '../../services/user'
import { getActiveCategories } from '../../services/category'  // 导入分类服务
import './index.scss'


interface Category {
    id: number
    name: string
}
interface Address {
    id: number
    detail: string
}

interface PickupTimeOption {
    value: string
    label: string
}

export default function Recycle() {
    const { state } = useAppContext()
    
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0)
    const [weight, setWeight] = useState('')
    const [description, setDescription] = useState('')
    const [addresses, setAddresses] = useState<Address[]>([])
    const [selectedAddressId, setSelectedAddressId] = useState(0)
    const [pickupTimeOptions, setPickupTimeOptions] = useState<PickupTimeOption[]>([])

    // 生成动态的预约时间选项
    const generatePickupTimeOptions = useCallback(() => {
        const options: PickupTimeOption[] = []
        const now = new Date()
        const currentHour = now.getHours()
        
        // 时间段配置
        const timeSlots = [
            { start: 9, end: 11, label: '09:00-11:00' },
            { start: 14, end: 16, label: '14:00-16:00' },
            { start: 16, end: 18, label: '16:00-18:00' }
        ]
        
        // 生成接下来7天的时间选项
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const targetDate = new Date(now)
            targetDate.setDate(now.getDate() + dayOffset)
            
            const year = targetDate.getFullYear()
            const month = String(targetDate.getMonth() + 1).padStart(2, '0')
            const day = String(targetDate.getDate()).padStart(2, '0')
            const dateStr = `${year}-${month}-${day}`
            
            timeSlots.forEach(slot => {
                // 如果是今天，只显示当前时间之后的时间段
                if (dayOffset === 0 && currentHour >= slot.start) {
                    return
                }
                
                // 如果是今天且当前时间已经过了最早的预约时间（9点），则跳过当天的早班
                if (dayOffset === 0 && currentHour >= 9 && slot.start === 9) {
                    return
                }
                
                const isoDateTime = `${dateStr}T${String(slot.start).padStart(2, '0')}:00:00Z`
                const label = `${dateStr} ${slot.label}`
                
                options.push({
                    value: isoDateTime,
                    label: label
                })
            })
        }
        
        return options
    }, [])

    // 初始化预约时间选项
    useEffect(() => {
        const options = generatePickupTimeOptions()
        setPickupTimeOptions(options)
    }, [])
    const [selectedPickupTimeIndex, setSelectedPickupTimeIndex] = useState(0)
    const [useJdExpress, setUseJdExpress] = useState(false)

    const loadCategories = useCallback(async () => {
        try {
            const categories = await getActiveCategories()
            setCategories(categories.map((cat: any) => ({
                id: cat.id,
                name: cat.name
            })))
        } catch (error) {
            console.error('获取分类失败:', error)
        }
    }, [])

    const loadUserAddresses = useCallback(async () => {
        try {
            if (state.user?.id) {
                const addresses = await getUserAddresses(state.user.id)
                setAddresses(addresses)
                setSelectedAddressId(addresses.length > 0 ? addresses[0].id : 0)
            }
        } catch (error) {
            console.error('获取地址失败:', error)
        }
    }, [state.user?.id])

    useEffect(() => {
        loadUserAddresses()
        loadCategories()
    }, [loadUserAddresses, loadCategories])

    const onCategoryChange = useCallback((e) => {
        setSelectedCategoryIndex(e.detail.value)
    }, [])

    const onWeightChange = useCallback((e) => {
        setWeight(e.detail.value)
    }, [])

    const onDescriptionChange = useCallback((e) => {
        setDescription(e.detail.value)
    }, [])

    const onAddressChange = useCallback((e) => {
        setSelectedAddressId(e.detail.value)
    }, [])

    const onPickupTimeChange = useCallback((e) => {
        setSelectedPickupTimeIndex(e.detail.value)
    }, [])

    const onJdExpressToggle = useCallback((enabled: boolean) => {
        setUseJdExpress(enabled)
    }, [])

    const onSubmit = useCallback(async () => {
        // 检查用户是否已登录
        const token = Taro.getStorageSync('token')
        if (!token) {
            Taro.showToast({
                title: '请先登录',
                icon: 'none'
            })
            return
        }

        // 获取用户ID
        const userId = state.user?.id
        if (!userId) {
            Taro.showToast({
                title: '用户信息异常',
                icon: 'none'
            })
            return
        }
        try {
            // 构造订单数据
            const orderData = {
                userId: userId,
                addressId: selectedAddressId,
                items: [
                    {
                        categoryId: categories[selectedCategoryIndex].id,
                        category: categories[selectedCategoryIndex],
                        weight: parseFloat(weight) || 0,
                        description,
                        estimatedWeight: parseFloat(weight) || 0,
                        unitPrice: 10, // 实际应用中应从定价规则中获取
                        quantity: 1
                    }
                ],
                expectPickupTime: pickupTimeOptions[selectedPickupTimeIndex].value,
                channel: useJdExpress ? 'jd-express' : 'platform',
                remark: description
            };

            // 调用后端 API 提交订单
            let result
            if (useJdExpress) {
                result = await createJdExpressOrder(orderData)
            } else {
                result = await createOrder(orderData)
            }

            console.log('提交订单成功:', result)

            Taro.showToast({
                title: '提交成功',
                icon: 'success'
            })

            // 延迟跳转到订单页面
            setTimeout(() => {
                Taro.switchTab({
                    url: '/pages/order/list/index'
                })
            }, 1500)
        } catch (error) {
            console.error('提交订单失败:', error)
            Taro.showToast({
                title: '提交失败: ' + (error.message || '未知错误'),
                icon: 'none'
            })
        }
    }, [state.user?.id, categories, selectedCategoryIndex, weight, description, selectedAddressId, pickupTimeOptions, selectedPickupTimeIndex, useJdExpress])

    return (
        <View className='recycle-page'>
            <View className='form-section'>
                <View className='form-item'>
                    <Text className='label'>物品分类</Text>
                    <Picker
                        mode='selector'
                        range={categories}
                        rangeKey='name'
                        onChange={onCategoryChange}
                    >
                        <View className='picker'>
                            <Icon name='tag' size='16' color='#00B894'></Icon>
                            <Text style={{ marginLeft: '8px' }}>{categories[selectedCategoryIndex]?.name || '请选择分类'}</Text>
                        </View>
                    </Picker>
                </View>

                <View className='form-item'>
                    <Text className='label'>预估重量</Text>
                    <Input
                        className='input'
                        type='digit'
                        placeholder='请输入预估重量(kg)'
                        value={weight}
                        onInput={onWeightChange}
                    />
                </View>

                <View className='form-item'>
                    <Text className='label'>物品描述</Text>
                    <Input
                        className='input'
                        placeholder='请输入物品描述'
                        value={description}
                        onInput={onDescriptionChange}
                    />
                </View>

                <View className='form-item'>
                    <Text className='label'>上门地址</Text>
                    <Picker
                        mode='selector'
                        range={addresses}
                        rangeKey='detail'
                        onChange={onAddressChange}
                    >
                        <View className='picker'>
                            <Icon name='location' size='16' color='#00B894'></Icon>
                            <Text style={{ marginLeft: '8px' }}>
                                {addresses.length > 0 ?
                                    addresses.find(addr => addr.id === selectedAddressId)?.detail || '请选择地址' :
                                    '暂无地址'}
                            </Text>
                        </View>
                    </Picker>
                </View>

                <View className='form-item'>
                    <Text className='label'>预约时间</Text>
                    <Picker
                        mode='selector'
                        range={pickupTimeOptions}
                        rangeKey='label'
                        onChange={onPickupTimeChange}
                    >
                        <View className='picker'>
                            <Icon name='clock' size='16' color='#00B894'></Icon>
                            <Text style={{ marginLeft: '8px' }}>
                                {pickupTimeOptions[selectedPickupTimeIndex]?.label || '请选择时间'}
                            </Text>
                        </View>
                    </Picker>
                </View>
            </View>

            {/* 京东快递选项 */}
            <View className='jd-express-section'>
                <View className='jd-express-header'>
                    <Icon name='delivery' size='18' color='#E32B2B'></Icon>
                    <Text className='jd-title' style={{ marginLeft: '8px' }}>京东快递上门取件</Text>
                    <Switch
                        checked={useJdExpress}
                        onChange={(e) => onJdExpressToggle(e.detail.value)}
                        color='#E32B2B'
                    />
                </View>

                {useJdExpress && (
                    <View className='jd-express-details'>
                        <Text className='detail-text'>• 专业快递员上门取件</Text>
                        <Text className='detail-text'>• 快速安全送达</Text>
                        <Text className='detail-text'>• 实时跟踪订单状态</Text>
                        <Text className='note-text'>注：使用京东快递服务将收取额外费用</Text>
                    </View>
                )}
            </View>

            <Button
                className='submit-btn'
                type='primary'
                onClick={onSubmit}
            >
                提交订单
            </Button>
        </View>
    )
}
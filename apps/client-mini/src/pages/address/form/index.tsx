import { useState, useEffect } from 'react'
import { View, Text, Input, Button, Picker } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { IconFont } from '@nutui/icons-react-taro'
import { createAddress, updateAddress, getUserAddresses } from '@/services/user'
import { useAppContext } from '@/store'
import AuthGuard from '@/components/AuthGuard'
import './index.scss'

// 中国省市区数据（简化版，实际项目中应使用完整的地区数据）
const REGIONS = {
    provinces: [
        { code: '110000', name: '北京市' },
        { code: '120000', name: '天津市' },
        { code: '310000', name: '上海市' },
        { code: '500000', name: '重庆市' },
        { code: '130000', name: '河北省' },
        { code: '140000', name: '山西省' },
        { code: '210000', name: '辽宁省' },
        { code: '220000', name: '吉林省' },
        { code: '230000', name: '黑龙江省' },
        { code: '320000', name: '江苏省' },
        { code: '330000', name: '浙江省' },
        { code: '340000', name: '安徽省' },
        { code: '350000', name: '福建省' },
        { code: '360000', name: '江西省' },
        { code: '370000', name: '山东省' },
        { code: '410000', name: '河南省' },
        { code: '420000', name: '湖北省' },
        { code: '430000', name: '湖南省' },
        { code: '440000', name: '广东省' },
        { code: '450000', name: '广西壮族自治区' },
        { code: '460000', name: '海南省' },
        { code: '510000', name: '四川省' },
        { code: '520000', name: '贵州省' },
        { code: '530000', name: '云南省' },
        { code: '610000', name: '陕西省' },
        { code: '620000', name: '甘肃省' },
        { code: '630000', name: '青海省' },
        { code: '640000', name: '宁夏回族自治区' },
        { code: '650000', name: '新疆维吾尔自治区' },
    ],
    cities: {
        '110000': [{ code: '110100', name: '北京市' }],
        '120000': [{ code: '120100', name: '天津市' }],
        '310000': [{ code: '310100', name: '上海市' }],
        '500000': [{ code: '500100', name: '重庆市' }],
        '440000': [
            { code: '440100', name: '广州市' },
            { code: '440300', name: '深圳市' },
            { code: '440400', name: '珠海市' },
            { code: '440500', name: '汕头市' },
            { code: '440600', name: '佛山市' },
            { code: '440700', name: '江门市' },
            { code: '440800', name: '湛江市' },
            { code: '440900', name: '茂名市' },
            { code: '441200', name: '肇庆市' },
            { code: '441300', name: '惠州市' },
            { code: '441400', name: '梅州市' },
            { code: '441500', name: '汕尾市' },
            { code: '441600', name: '河源市' },
            { code: '441700', name: '阳江市' },
            { code: '441800', name: '清远市' },
            { code: '441900', name: '东莞市' },
            { code: '442000', name: '中山市' },
            { code: '445100', name: '潮州市' },
            { code: '445200', name: '揭阳市' },
            { code: '445300', name: '云浮市' },
        ],
        '320000': [
            { code: '320100', name: '南京市' },
            { code: '320200', name: '无锡市' },
            { code: '320300', name: '徐州市' },
            { code: '320400', name: '常州市' },
            { code: '320500', name: '苏州市' },
            { code: '320600', name: '南通市' },
            { code: '320700', name: '连云港市' },
            { code: '320800', name: '淮安市' },
            { code: '320900', name: '盐城市' },
            { code: '321000', name: '扬州市' },
            { code: '321100', name: '镇江市' },
            { code: '321200', name: '泰州市' },
            { code: '321300', name: '宿迁市' },
        ],
    },
    districts: {
        '440100': [
            { code: '440103', name: '荔湾区' },
            { code: '440104', name: '越秀区' },
            { code: '440105', name: '海珠区' },
            { code: '440106', name: '天河区' },
            { code: '440111', name: '白云区' },
            { code: '440112', name: '黄埔区' },
            { code: '440113', name: '番禺区' },
            { code: '440114', name: '花都区' },
            { code: '440115', name: '南沙区' },
            { code: '440117', name: '从化区' },
            { code: '440118', name: '增城区' },
        ],
        '440300': [
            { code: '440303', name: '罗湖区' },
            { code: '440304', name: '福田区' },
            { code: '440305', name: '南山区' },
            { code: '440306', name: '宝安区' },
            { code: '440307', name: '龙岗区' },
            { code: '440308', name: '盐田区' },
            { code: '440309', name: '龙华区' },
            { code: '440310', name: '坪山区' },
            { code: '440311', name: '光明区' },
        ],
        '320100': [
            { code: '320102', name: '玄武区' },
            { code: '320104', name: '秦淮区' },
            { code: '320105', name: '建邺区' },
            { code: '320106', name: '鼓楼区' },
            { code: '320111', name: '浦口区' },
            { code: '320113', name: '栖霞区' },
            { code: '320114', name: '雨花台区' },
            { code: '320115', name: '江宁区' },
            { code: '320116', name: '六合区' },
            { code: '320117', name: '溧水区' },
            { code: '320118', name: '高淳区' },
        ],
    },
}

interface AddressFormData {
    consignee: string
    mobile: string
    province: string
    city: string
    district: string
    detail: string
    isDefault: boolean
}

const AddressFormPage = () => {
    const router = useRouter()
    const { state } = useAppContext()
    const addressId = router.params.id ? parseInt(router.params.id) : null

    const [formData, setFormData] = useState<AddressFormData>({
        consignee: '',
        mobile: '',
        province: '',
        city: '',
        district: '',
        detail: '',
        isDefault: false,
    })

    const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({})
    const [loading, setLoading] = useState(false)
    const [provinceIndex, setProvinceIndex] = useState(0)
    const [cityIndex, setCityIndex] = useState(0)
    const [districtIndex, setDistrictIndex] = useState(0)

    // 获取当前选中省份的城市列表
    const getCities = () => {
        const provinceCode = REGIONS.provinces[provinceIndex]?.code
        return REGIONS.cities[provinceCode] || []
    }

    // 获取当前选中城市的区县列表
    const getDistricts = () => {
        const cities = getCities()
        const cityCode = cities[cityIndex]?.code
        return REGIONS.districts[cityCode] || []
    }

    // 加载地址数据（编辑模式）
    useEffect(() => {
        if (addressId && state.user?.id) {
            loadAddressData()
        }
    }, [addressId, state.user?.id])

    const loadAddressData = async () => {
        try {
            const addresses = await getUserAddresses(state.user!.id)
            const address = addresses.find((addr: any) => addr.id === addressId)

            if (address) {
                setFormData({
                    consignee: address.consignee || '',
                    mobile: address.mobile || '',
                    province: address.province || '',
                    city: address.city || '',
                    district: address.district || '',
                    detail: address.detail || '',
                    isDefault: address.isDefault || false,
                })

                // 设置选择器索引
                const pIndex = REGIONS.provinces.findIndex(p => p.name === address.province)
                if (pIndex >= 0) {
                    setProvinceIndex(pIndex)

                    const cities = REGIONS.cities[REGIONS.provinces[pIndex].code] || []
                    const cIndex = cities.findIndex(c => c.name === address.city)
                    if (cIndex >= 0) {
                        setCityIndex(cIndex)

                        const districts = REGIONS.districts[cities[cIndex].code] || []
                        const dIndex = districts.findIndex(d => d.name === address.district)
                        if (dIndex >= 0) {
                            setDistrictIndex(dIndex)
                        }
                    }
                }
            }
        } catch (error) {
            console.error('加载地址失败:', error)
            Taro.showToast({
                title: '加载地址失败',
                icon: 'none',
            })
        }
    }

    // 验证手机号
    const validateMobile = (mobile: string): boolean => {
        const mobileRegex = /^1[3-9]\d{9}$/
        return mobileRegex.test(mobile)
    }

    // 验证表单字段
    const validateField = (field: keyof AddressFormData, value: string): string => {
        switch (field) {
            case 'consignee':
                if (!value.trim()) {
                    return '请输入收货人姓名'
                }
                if (value.trim().length < 2 || value.trim().length > 20) {
                    return '姓名长度应在2-20个字符之间'
                }
                return ''

            case 'mobile':
                if (!value.trim()) {
                    return '请输入手机号'
                }
                if (!validateMobile(value.trim())) {
                    return '请输入正确的手机号'
                }
                return ''

            case 'province':
            case 'city':
            case 'district':
                if (!value.trim()) {
                    return '请选择完整的地区信息'
                }
                return ''

            case 'detail':
                if (!value.trim()) {
                    return '请输入详细地址'
                }
                if (value.trim().length < 5 || value.trim().length > 100) {
                    return '详细地址长度应在5-100个字符之间'
                }
                return ''

            default:
                return ''
        }
    }

    // 处理输入变化
    const handleInputChange = (field: keyof AddressFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))

        // 实时验证
        const error = validateField(field, value)
        setErrors(prev => ({ ...prev, [field]: error }))
    }

    // 处理省份选择
    const handleProvinceChange = (e: any) => {
        const index = e.detail.value
        setProvinceIndex(index)
        setCityIndex(0)
        setDistrictIndex(0)

        const provinceName = REGIONS.provinces[index].name
        setFormData(prev => ({
            ...prev,
            province: provinceName,
            city: '',
            district: '',
        }))
        setErrors(prev => ({ ...prev, province: '', city: '', district: '' }))
    }

    // 处理城市选择
    const handleCityChange = (e: any) => {
        const index = e.detail.value
        setCityIndex(index)
        setDistrictIndex(0)

        const cities = getCities()
        const cityName = cities[index]?.name || ''
        setFormData(prev => ({
            ...prev,
            city: cityName,
            district: '',
        }))
        setErrors(prev => ({ ...prev, city: '', district: '' }))
    }

    // 处理区县选择
    const handleDistrictChange = (e: any) => {
        const index = e.detail.value
        setDistrictIndex(index)

        const districts = getDistricts()
        const districtName = districts[index]?.name || ''
        setFormData(prev => ({
            ...prev,
            district: districtName,
        }))
        setErrors(prev => ({ ...prev, district: '' }))
    }

    // 验证所有字段
    const validateAll = (): boolean => {
        const newErrors: Partial<Record<keyof AddressFormData, string>> = {}
        let isValid = true

        // 验证必填字段
        const requiredFields: (keyof AddressFormData)[] = [
            'consignee',
            'mobile',
            'province',
            'city',
            'district',
            'detail',
        ]

        requiredFields.forEach(field => {
            const error = validateField(field, formData[field] as string)
            if (error) {
                newErrors[field] = error
                isValid = false
            }
        })

        setErrors(newErrors)
        return isValid
    }

    // 提交表单
    const handleSubmit = async () => {
        if (!validateAll()) {
            Taro.showToast({
                title: '请填写完整信息',
                icon: 'none',
            })
            return
        }

        if (!state.user?.id) {
            Taro.showToast({
                title: '请先登录',
                icon: 'none',
            })
            return
        }

        setLoading(true)

        try {
            const addressData = {
                userId: state.user.id,
                consignee: formData.consignee.trim(),
                mobile: formData.mobile.trim(),
                province: formData.province,
                city: formData.city,
                district: formData.district,
                detail: formData.detail.trim(),
                isDefault: formData.isDefault,
            }

            if (addressId) {
                // 更新地址
                await updateAddress(addressId, addressData)
                Taro.showToast({
                    title: '更新成功',
                    icon: 'success',
                })
            } else {
                // 创建新地址
                await createAddress(addressData)
                Taro.showToast({
                    title: '添加成功',
                    icon: 'success',
                })
            }

            // 延迟返回，让用户看到成功提示
            setTimeout(() => {
                Taro.navigateBack()
            }, 1500)
        } catch (error) {
            console.error('保存地址失败:', error)
            Taro.showToast({
                title: addressId ? '更新失败' : '添加失败',
                icon: 'none',
            })
        } finally {
            setLoading(false)
        }
    }

    const cities = getCities()
    const districts = getDistricts()

    return (
        <AuthGuard>
            <View className='address-form-page'>
                <View className='form-container'>
                    {/* 收货人 */}
                    <View className='form-item'>
                        <View className='form-label'>
                            <IconFont name='user' size='16' color='#666' />
                            <Text className='label-text'>收货人</Text>
                            <Text className='required'>*</Text>
                        </View>
                        <Input
                            className='form-input'
                            placeholder='请输入收货人姓名'
                            value={formData.consignee}
                            maxlength={20}
                            onInput={(e) => handleInputChange('consignee', e.detail.value)}
                        />
                        {errors.consignee && (
                            <Text className='error-text'>{errors.consignee}</Text>
                        )}
                    </View>

                    {/* 手机号 */}
                    <View className='form-item'>
                        <View className='form-label'>
                            <IconFont name='phone' size='16' color='#666' />
                            <Text className='label-text'>手机号</Text>
                            <Text className='required'>*</Text>
                        </View>
                        <Input
                            className='form-input'
                            type='number'
                            placeholder='请输入11位手机号'
                            value={formData.mobile}
                            maxlength={11}
                            onInput={(e) => handleInputChange('mobile', e.detail.value)}
                        />
                        {errors.mobile && (
                            <Text className='error-text'>{errors.mobile}</Text>
                        )}
                    </View>

                    {/* 所在地区 */}
                    <View className='form-item'>
                        <View className='form-label'>
                            <IconFont name='location' size='16' color='#666' />
                            <Text className='label-text'>所在地区</Text>
                            <Text className='required'>*</Text>
                        </View>

                        <View className='region-picker-group'>
                            {/* 省份选择 */}
                            <Picker
                                mode='selector'
                                range={REGIONS.provinces.map(p => p.name)}
                                value={provinceIndex}
                                onChange={handleProvinceChange}
                            >
                                <View className='picker-item'>
                                    <Text className={formData.province ? 'selected' : 'placeholder'}>
                                        {formData.province || '请选择省份'}
                                    </Text>
                                    <IconFont name='arrow-down' size='12' color='#999' />
                                </View>
                            </Picker>

                            {/* 城市选择 */}
                            <Picker
                                mode='selector'
                                range={cities.map(c => c.name)}
                                value={cityIndex}
                                onChange={handleCityChange}
                                disabled={!formData.province}
                            >
                                <View className={`picker-item ${!formData.province ? 'disabled' : ''}`}>
                                    <Text className={formData.city ? 'selected' : 'placeholder'}>
                                        {formData.city || '请选择城市'}
                                    </Text>
                                    <IconFont name='arrow-down' size='12' color='#999' />
                                </View>
                            </Picker>

                            {/* 区县选择 */}
                            <Picker
                                mode='selector'
                                range={districts.map(d => d.name)}
                                value={districtIndex}
                                onChange={handleDistrictChange}
                                disabled={!formData.city}
                            >
                                <View className={`picker-item ${!formData.city ? 'disabled' : ''}`}>
                                    <Text className={formData.district ? 'selected' : 'placeholder'}>
                                        {formData.district || '请选择区县'}
                                    </Text>
                                    <IconFont name='arrow-down' size='12' color='#999' />
                                </View>
                            </Picker>
                        </View>

                        {(errors.province || errors.city || errors.district) && (
                            <Text className='error-text'>
                                {errors.province || errors.city || errors.district}
                            </Text>
                        )}
                    </View>

                    {/* 详细地址 */}
                    <View className='form-item'>
                        <View className='form-label'>
                            <IconFont name='location' size='16' color='#666' />
                            <Text className='label-text'>详细地址</Text>
                            <Text className='required'>*</Text>
                        </View>
                        <Input
                            className='form-input textarea'
                            placeholder='请输入详细地址，如街道、门牌号等'
                            value={formData.detail}
                            maxlength={100}
                            onInput={(e) => handleInputChange('detail', e.detail.value)}
                        />
                        {errors.detail && (
                            <Text className='error-text'>{errors.detail}</Text>
                        )}
                    </View>

                    {/* 设为默认地址 */}
                    <View className='form-item default-switch'>
                        <View className='form-label'>
                            <IconFont name='star' size='16' color='#666' />
                            <Text className='label-text'>设为默认地址</Text>
                        </View>
                        <View
                            className={`switch ${formData.isDefault ? 'active' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, isDefault: !prev.isDefault }))}
                        >
                            <View className='switch-handle' />
                        </View>
                    </View>
                </View>

                {/* 提交按钮 */}
                <View className='submit-container'>
                    <Button
                        className='submit-btn'
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={loading}
                    >
                        {loading ? '保存中...' : '保存地址'}
                    </Button>
                </View>
            </View>
        </AuthGuard>
    )
}

export default AddressFormPage

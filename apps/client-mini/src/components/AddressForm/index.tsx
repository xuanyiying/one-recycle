/**
 * AddressForm Component
 * Modal form for adding or editing addresses with NutUI Address component
 */

import { useState, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Address, AddressLabel, AddressFormData } from '@/types/order'
import './index.scss'
import { Input, Button, Cascader, TextArea } from '@nutui/nutui-react-taro'
import { cascaderOptions as addressData } from '@/utils/regionTreeData'

// ============================================================================
// Types
// ============================================================================

interface AddressFormProps {
    initialData?: Address
    onSave: (data: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
    onCancel: () => void
    isLoading: boolean
    errors: Record<string, string>
}

// ============================================================================
// Label Options
// ============================================================================

const LABEL_OPTIONS: Array<{ value: AddressLabel; label: string }> = [
    { value: AddressLabel.HOME, label: '家' },
    { value: AddressLabel.WORK, label: '工作' },
    { value: AddressLabel.SCHOOL, label: '学校' },
    { value: AddressLabel.OTHER, label: '其他' },
]

// ============================================================================
// Component
// ============================================================================

export default function AddressForm({
    initialData,
    onSave,
    onCancel,
    isLoading,
    errors,
}: AddressFormProps) {
    // Form state
    const [formData, setFormData] = useState<AddressFormData>({
        recipientName: initialData?.recipientName || '',
        phoneNumber: initialData?.phoneNumber || '',
        region: initialData?.region || '',
        detailedAddress: initialData?.detailedAddress || '',
        label: initialData?.label || AddressLabel.HOME,
    })

    const [isDefault, setIsDefault] = useState(initialData?.isDefault || false)
    const [showLabelPicker, setShowLabelPicker] = useState(false)
    const [showAddressPicker, setShowAddressPicker] = useState(false)
    const [selectedRegion, setSelectedRegion] = useState<string[]>([])
    const [coordinates, setCoordinates] = useState(initialData?.coordinates)

    // ============================================================================
    // Location Handlers
    // ============================================================================

    const handleGetLocation = useCallback(async () => {
        try {
            Taro.showLoading({ title: '定位中...' })

            // Get current location
            const location = await Taro.getLocation({
                type: 'gcj02', // 国测局坐标系
            })

            setCoordinates({
                latitude: location.latitude,
                longitude: location.longitude,
            })

            // Reverse geocoding to get address
            // In production, call a geocoding API here
            Taro.showToast({
                title: '定位成功',
                icon: 'success',
            })

            // Open address picker after getting location
            setShowAddressPicker(true)
        } catch (error) {
            console.error('定位失败:', error)
            Taro.showToast({
                title: '定位失败，请手动选择',
                icon: 'none',
            })
            // Still allow manual selection
            setShowAddressPicker(true)
        } finally {
            Taro.hideLoading()
        }
    }, [])

    // ============================================================================
    // Form Handlers
    // ============================================================================

    const handleRecipientNameChange = useCallback((value: string) => {
        setFormData((prev) => ({
            ...prev,
            recipientName: value,
        }))
    }, [])

    const handlePhoneNumberChange = useCallback((value: string) => {
        setFormData((prev) => ({
            ...prev,
            phoneNumber: value,
        }))
    }, [])

    const handleAddressChange = useCallback((value: any, params?: any) => {
        console.log('Address changed - value:', value, 'params:', params)

        // params contains the selected address data
        if (params && params.selectedOptions) {
            const selectedOptions = params.selectedOptions
            // Use label instead of text for NutUI Cascader
            const regionParts = selectedOptions.map((item: any) => item.label || item.text).filter(Boolean)
            const region = regionParts.join(' ')

            console.log('Selected region:', region)

            setFormData((prev) => ({
                ...prev,
                region,
            }))

            setSelectedRegion(value)
        }
        setShowAddressPicker(false)
    }, [])

    const handleDetailedAddressChange = useCallback((value: string) => {
        setFormData((prev) => ({
            ...prev,
            detailedAddress: value,
        }))
    }, [])

    const handleLabelChange = useCallback((label: AddressLabel) => {
        setFormData((prev) => ({
            ...prev,
            label,
        }))
        setShowLabelPicker(false)
    }, [])

    const handleDefaultChange = useCallback(() => {
        setIsDefault((prev) => !prev)
    }, [])

    // ============================================================================
    // Form Submission
    // ============================================================================

    const handleSubmit = useCallback(async () => {
        await onSave({
            ...formData,
            isDefault,
            coordinates,
        })
    }, [formData, isDefault, coordinates, onSave])

    // ============================================================================
    // Render
    // ============================================================================

    const labelDisplay = LABEL_OPTIONS.find((opt) => opt.value === formData.label)?.label || '其他'

    return (
        <ScrollView className='address-form' scrollY>
            <View className='address-form-container'>
                {/* Header */}
                <View className='form-header'>
                    <Text className='form-title'>
                        {initialData ? '编辑地址' : '添加新地址'}
                    </Text>
                </View>

                {/* Form Fields */}
                <View className='form-section'>
                    {/* Recipient Name */}
                    <View className='form-field'>
                        <Text className='field-label'>
                            取件人 <Text className='required'>*</Text>
                        </Text>
                        <Input
                            value={formData.recipientName}
                            onChange={(value) => handleRecipientNameChange(value)}
                            placeholder='请输入取件人姓名'
                            maxLength={50}
                        />
                        {errors.recipientName && (
                            <Text className='error-message'>{errors.recipientName}</Text>
                        )}
                    </View>

                    {/* Phone Number */}
                    <View className='form-field'>
                        <Text className='field-label'>
                            电话号码 <Text className='required'>*</Text>
                        </Text>
                        <Input
                            value={formData.phoneNumber}
                            onChange={(value) => handlePhoneNumberChange(value)}
                            placeholder='请输入电话号码'
                            type='tel'
                            maxLength={20}
                        />
                        {errors.phoneNumber && (
                            <Text className='error-message'>{errors.phoneNumber}</Text>
                        )}
                    </View>

                    {/* Region Selection */}
                    <View className='form-field'>
                        <Text className='field-label'>
                            所在地区 <Text className='required'>*</Text>
                        </Text>
                        <View className='region-selector-wrapper'>
                            <View
                                className='region-selector'
                                onClick={() => {
                                    console.log('Opening address picker')
                                    console.log('addressData:', addressData)
                                    console.log('selectedRegion:', selectedRegion)
                                    setShowAddressPicker(true)
                                }}
                            >
                                <Text className={`region-value ${!formData.region ? 'placeholder' : ''}`}>
                                    {formData.region || '请选择省/市/区'}
                                </Text>
                                <Text className='selector-arrow'>›</Text>
                            </View>
                            <Button
                                className='location-btn'
                                size='small'
                                onClick={handleGetLocation}
                            >
                                📍 定位
                            </Button>
                        </View>
                        {errors.region && (
                            <Text className='error-message'>{errors.region}</Text>
                        )}
                    </View>

                    {/* Detailed Address */}
                    <View className='form-field'>
                        <Text className='field-label'>
                            详细地址 <Text className='required'>*</Text>
                        </Text>
                        <TextArea
                            value={formData.detailedAddress}
                            onChange={(value) => handleDetailedAddressChange(value)}
                            placeholder='请输入街道、门牌号等详细地址'
                            maxLength={200}
                            rows={3}
                            showCount
                        />
                        {errors.detailedAddress && (
                            <Text className='error-message'>{errors.detailedAddress}</Text>
                        )}
                    </View>

                    {/* Address Label */}
                    <View className='form-field'>
                        <Text className='field-label'>地址标签</Text>
                        <View
                            className='label-selector'
                            onClick={() => setShowLabelPicker(!showLabelPicker)}
                        >
                            <Text className='label-value'>{labelDisplay}</Text>
                            <Text className='label-arrow'>›</Text>
                        </View>

                        {showLabelPicker && (
                            <View className='label-picker'>
                                {LABEL_OPTIONS.map((option) => (
                                    <View
                                        key={option.value}
                                        className={`label-option ${formData.label === option.value ? 'selected' : ''
                                            }`}
                                        onClick={() => handleLabelChange(option.value)}
                                    >
                                        <Text>{option.label}</Text>
                                        {formData.label === option.value && (
                                            <Text className='checkmark'>✓</Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Default Address Checkbox */}
                    <View className='form-field checkbox-field'>
                        <View className='checkbox-wrapper' onClick={handleDefaultChange}>
                            <View className={`checkbox ${isDefault ? 'checked' : ''}`}>
                                {isDefault && <Text className='checkmark'>✓</Text>}
                            </View>
                            <Text className='checkbox-label'>设为默认地址</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className='form-actions'>
                    <Button
                        className='btn-secondary'
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        取消
                    </Button>
                    <Button
                        className='btn-primary'
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? '保存中...' : '保存地址'}
                    </Button>
                </View>
            </View>

            {/* Cascader 级联选择器 */}
            {showAddressPicker && (
                <Cascader
                    visible={showAddressPicker}
                    value={selectedRegion}
                    title="选择所在地区"
                    options={addressData}
                    onClose={() => {
                        console.log('Cascader closed')
                        setShowAddressPicker(false)
                    }}
                    onChange={handleAddressChange}
                    onLoad={() => {
                        console.log('Cascader loaded')
                    }}
                />
            )}
        </ScrollView>
    )
}

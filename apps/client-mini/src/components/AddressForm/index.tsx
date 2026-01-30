/**
 * AddressForm Component
 * Modal form for adding or editing addresses with NutUI Address component
 */

import { useState, useCallback, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { Address, AddressFormData } from '@/types/address'
import './index.scss'
import { Input, Button, Switch } from '@nutui/nutui-react-taro'
import AddressPicker from '../AddressPicker'

// ============================================================================
// Types
// ============================================================================

interface AddressFormProps {
    initialData?: Address
    onSave: (data: AddressFormData & { isDefault: boolean, coordinates?: any }) => Promise<void>
    onCancel: () => void
    isLoading: boolean
    errors: Record<string, string>
}

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
        name: initialData?.name || '',
        mobile: initialData?.mobile || '',
        province: initialData?.province || '',
        city: initialData?.city || '',
        district: initialData?.district || '',
        detail: initialData?.detail || '',
        zipCode: initialData?.zipCode || '',
    })

    const [isDefault, setIsDefault] = useState(initialData?.isDefault || false)
    const [coordinates, setCoordinates] = useState(initialData?.coordinates)
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({})

    // Auto-save draft
    useEffect(() => {
        if (!initialData) { // Only save for new address forms
            Taro.setStorage({
                key: 'address_form_draft',
                data: { formData, isDefault, coordinates }
            })
        }
    }, [formData, isDefault, coordinates, initialData])

    // Restore draft
    useEffect(() => {
        if (!initialData) {
            Taro.getStorage({
                key: 'address_form_draft',
                success: (res) => {
                    if (res.data) {
                        setFormData(res.data.formData)
                        setIsDefault(res.data.isDefault)
                        setCoordinates(res.data.coordinates)
                    }
                }
            })
        }
    }, [initialData])

    // Validation
    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.name.trim()) newErrors.name = '请输入取件人姓名'
        if (!formData.mobile.trim()) {
            newErrors.mobile = '请输入电话号码'
        } else if (!/^1[3-9]\d{9}$/.test(formData.mobile)) {
            newErrors.mobile = '请输入有效的手机号码'
        }
        if (!formData.province || !formData.city) newErrors.region = '请完整选择所在地区'
        if (!formData.detail.trim()) {
            newErrors.detail = '请输入详细地址'
        } else if (formData.detail.length < 5) {
            newErrors.detail = '详细地址不能少于5个字符'
        }

        if (formData.zipCode && !/^\d{6}$/.test(formData.zipCode)) {
            newErrors.zipCode = '请输入有效的6位邮政编码'
        }

        setLocalErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // ============================================================================
    // Form Handlers
    // ============================================================================

    const handleNameChange = useCallback((value: string) => {
        setFormData((prev) => ({
            ...prev,
            name: value,
        }))
        if (localErrors.name) {
            setLocalErrors(prev => ({ ...prev, name: '' }))
        }
    }, [localErrors])

    const handleMobileChange = useCallback((value: string) => {
        setFormData((prev) => ({
            ...prev,
            mobile: value,
        }))
        if (localErrors.mobile) {
            setLocalErrors(prev => ({ ...prev, mobile: '' }))
        }
    }, [localErrors])

    const handleAddressPickerChange = useCallback((address: Partial<Address>) => {
        setFormData((prev) => ({
            ...prev,
            province: address.province || prev.province,
            city: address.city || prev.city,
            district: address.district || prev.district,
            street: address.street || prev.street || '',
            detail: address.detail || prev.detail,
        }))
        if (address.coordinates) {
            setCoordinates(address.coordinates)
        }
        if (localErrors.region || localErrors.detail) {
            setLocalErrors(prev => ({ ...prev, region: '', detail: '' }))
        }
    }, [localErrors])

    const handleZipCodeChange = useCallback((value: string) => {
        setFormData((prev) => ({
            ...prev,
            zipCode: value,
        }))
    }, [])

    // ============================================================================
    // Form Submission
    // ============================================================================

    const executeSave = useCallback(async () => {
        await onSave({
            ...formData,
            isDefault,
            coordinates,
        })

        // Clear draft on success
        if (!initialData) {
            Taro.removeStorage({ key: 'address_form_draft' })
        }
    }, [formData, isDefault, coordinates, onSave, initialData])

    const handleSubmit = useCallback(async () => {
        if (!validate()) {
            Taro.showToast({ title: '请完善地址信息', icon: 'none' })
            return
        }

        // // 业务规则校验：配送范围
        // try {
        //     const rangeCheck = await AddressService.checkDeliveryRange({
        //         province: formData.province,
        //         city: formData.city,
        //         district: formData.district,
        //         coordinates
        //     })

        //     if (rangeCheck.success && rangeCheck.data && !rangeCheck.data.inRange) {
        //         Taro.showModal({
        //             title: '超出服务范围',
        //             content: rangeCheck.data.message || '该地址暂时无法提供上门回收服务，是否仍要保存？',
        //             confirmText: '仍要保存',
        //             cancelText: '取消',
        //             success: async (res) => {
        //                 if (res.confirm) {
        //                     await executeSave()
        //                 }
        //             }
        //         })
        //         return
        //     }
        // } catch (e) {
        //     console.error('Delivery range check failed', e)
        //     // 校验失败时不阻断流程，允许尝试保存
        // }

        await executeSave()
    }, [formData, isDefault, coordinates, validate, executeSave])

    // ============================================================================
    // Render
    // ============================================================================

    const combinedErrors = { ...errors, ...localErrors }

    return (
        <ScrollView className='address-form' scrollY>
            <View className='address-form-container'>
                {/* Header */}
                <View className='form-header'>
                    <Text className='form-title'>
                        {initialData ? '编辑地址' : '添加新地址'}
                    </Text>
                    <Text className='form-subtitle'>请确保地址准确，以便我们上门取件</Text>
                </View>

                {/* Form Fields */}
                <View className='form-section'>
                    {/* Recipient Name */}
                    <View className='form-field'>
                        <View className='field-header'>
                            <Text className='field-label'>取件人</Text>
                            <Text className='required-mark'>*</Text>
                        </View>
                        <Input
                            value={formData.name}
                            onChange={(value) => handleNameChange(value)}
                            placeholder='请输入取件人姓名'
                            maxLength={20}
                            className={combinedErrors.name ? 'error' : ''}
                        />
                        {combinedErrors.name && (
                            <Text className='error-text'>{combinedErrors.name}</Text>
                        )}
                    </View>

                    {/* Phone Number */}
                    <View className='form-field'>
                        <View className='field-header'>
                            <Text className='field-label'>电话号码</Text>
                            <Text className='required-mark'>*</Text>
                        </View>
                        <Input
                            value={formData.mobile}
                            onChange={(value) => handleMobileChange(value)}
                            placeholder='请输入电话号码'
                            type='tel'
                            maxLength={11}
                            className={combinedErrors.mobile ? 'error' : ''}
                        />
                        {combinedErrors.mobile && (
                            <Text className='error-text'>{combinedErrors.mobile}</Text>
                        )}
                    </View>

                    {/* Address Selection with Unified Picker */}
                    <View className='form-field no-label'>
                        <AddressPicker 
                            value={formData}
                            onChange={handleAddressPickerChange}
                            errors={combinedErrors}
                        />
                    </View>

                    {/* Postal Code */}
                    <View className='form-field'>
                        <View className='field-header'>
                            <Text className='field-label'>邮政编码</Text>
                        </View>
                        <Input
                            value={formData.zipCode}
                            onChange={(value) => handleZipCodeChange(value)}
                            placeholder='请输入邮政编码'
                            type='number'
                            maxLength={6}
                            className={combinedErrors.zipCode ? 'error' : ''}
                        />
                        {combinedErrors.zipCode && (
                            <Text className='error-text'>{combinedErrors.zipCode}</Text>
                        )}
                    </View>

                    {/* Set Default */}
                    <View className='form-field inline'>
                        <Text className='field-label'>设为默认地址</Text>
                        <Switch 
                            checked={isDefault} 
                            onChange={(val: boolean) => setIsDefault(val)}
                        />
                    </View>
                </View>

                {/* Actions */}
                <View className='form-actions'>
                    <Button 
                        className='btn-cancel' 
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        取消
                    </Button>
                    <Button 
                        className='btn-save' 
                        type='primary' 
                        onClick={handleSubmit}
                        loading={isLoading}
                    >
                        保存地址
                    </Button>
                </View>
            </View>
        </ScrollView>
    )
}

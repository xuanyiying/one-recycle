/**
 * AddressSelection Component (Step 2 of Order Creation Flow)
 * Allows users to select a delivery address or add a new one
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { useState, useCallback, useEffect } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Address } from '@/types/order'
import { AddressLabel, AddressFormData } from '@/types/address'
import { validateAddress, validateAddressInServiceArea } from '../../../utils/orderValidation'
import { useOrderStore } from '../../../store/orderStore'
import AddressCard from './AddressCard'
import AddressForm from '@/components/AddressForm'
import './index.scss'
import { AddressService } from '@/services/address'

// ============================================================================
// Types
// ============================================================================

interface AddressSelectionProps {
    onNext: (address: Address) => void
    onBack: () => void
    initialAddress?: Address
    serviceAreaBoundary?: any
}

// ============================================================================
// Component
// ============================================================================

export default function AddressSelection({
    onNext,
    onBack,
    initialAddress,
    serviceAreaBoundary,
}: AddressSelectionProps) {
    // State management
    const { state, selectAddress, addAddress, updateAddress } = useOrderStore()
    const [selectedAddressId, setSelectedAddressId] = useState<string | number | undefined>(
        initialAddress?.id ?? state.selectedAddressId
    )
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [editingAddressId, setEditingAddressId] = useState<string | number | undefined>()
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Get addresses from store
    const addresses = state.addresses

    // ============================================================================
    // Effects
    // ============================================================================

    // Load addresses from API on mount
    useEffect(() => {
        const loadAddresses = async () => {
            try {
                const response = await AddressService.getUserAddresses()
                if (response.success && response.data) {
                    // Add addresses to store
                    response.data.forEach(addr => addAddress(addr))
                }
            } catch (error) {
                console.error('Failed to load addresses:', error)
            }
        }

        // Only load if store is empty
        if (addresses.length === 0) {
            loadAddresses()
        }
    }, []) // Run once on mount

    // If no addresses exist, show form automatically
    useEffect(() => {
        if (addresses.length === 0 && !showAddressForm) {
            setShowAddressForm(true)
        }
    }, [addresses.length, showAddressForm])

    // ============================================================================
    // Address Selection Handlers
    // ============================================================================

    const handleSelectAddress = useCallback((addressId: string | number) => {
        setSelectedAddressId(addressId)
        selectAddress(addressId)
        setErrors({})
    }, [selectAddress])

    const handleAddNewAddress = useCallback(() => {
        setEditingAddressId(undefined)
        setShowAddressForm(true)
    }, [])

    const handleEditAddress = useCallback((addressId: string) => {
        setEditingAddressId(addressId)
        setShowAddressForm(true)
    }, [])

    const handleImportFromWechat = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await Taro.chooseAddress()
            
            // Map WeChat address to our format
            const newAddress: AddressFormData = {
                recipientName: res.userName,
                phoneNumber: res.telNumber,
                province: res.provinceName,
                city: res.cityName,
                district: res.countyName,
                detailedAddress: res.detailInfo,
                region: `${res.provinceName} ${res.cityName} ${res.countyName}`,
                label: AddressLabel.OTHER,
                isDefault: false
            }

            // Save the address
            const response = await AddressService.createAddress(newAddress)
            if (response.success && response.data) {
                addAddress(response.data)
                const addressId = String(response.data.id)
                setSelectedAddressId(addressId)
                selectAddress(addressId)
                Taro.showToast({ title: '导入成功', icon: 'success' })
            }
        } catch (error: any) {
            // Check if user denied permission or canceled
            if (error.errMsg?.includes('cancel')) return
            
            // If native fails, fallback to manual form with a hint
            Taro.showModal({
                title: '微信导入失败',
                content: '无法获取微信地址，是否切换到手动添加？',
                confirmText: '手动添加',
                success: (modalRes) => {
                    if (modalRes.confirm) {
                        handleAddNewAddress()
                    }
                }
            })
            console.error('WeChat Address Import Error:', error)
        } finally {
            setIsLoading(false)
        }
    }, [addAddress, selectAddress, handleAddNewAddress])

    const handleDeleteAddress = useCallback(async (addressId: string) => {
        Taro.showModal({
            title: '删除地址',
            content: '确定要删除这个地址吗？',
            confirmText: '删除',
            cancelText: '取消',
            success: async (res) => {
                if (res.confirm) {
                    try {
                        const response = await AddressService.deleteAddress(addressId)

                        if (response.success) {
                            // Clear selection if deleted address was selected
                            if (selectedAddressId === addressId) {
                                setSelectedAddressId(undefined)
                            }
                            // Toast already shown by service
                        } else {
                            throw new Error(response.error || '删除失败')
                        }
                    } catch (error) {
                        console.error('Error deleting address:', error)
                        Taro.showToast({
                            title: error instanceof Error ? error.message : '删除失败，请重试',
                            icon: 'none',
                        })
                    }
                }
            },
        })
    }, [addresses, selectedAddressId])

    // ============================================================================
    // Address Form Handlers
    // ============================================================================

    const handleSaveAddress = useCallback(
        async (formData: AddressFormData) => {
            // formData comes from AddressForm which uses AddressFormData & { isDefault: boolean, coordinates?: any }
            
            // Validate address
            const addressToValidate = {
                ...formData,
                id: editingAddressId || 'temp',
            }
            
            const addressErrors = validateAddress(addressToValidate as Address)

            if (addressErrors.length > 0) {
                const errorMap: Record<string, string> = {}
                addressErrors.forEach((error) => {
                    errorMap[error.field] = error.message
                })
                setErrors(errorMap)
                return
            }

            // Validate address is within service area
            const isInServiceArea = validateAddressInServiceArea(
                addressToValidate as Address,
                serviceAreaBoundary
            )

            if (!isInServiceArea) {
                setErrors({
                    detailedAddress: '该地址不在我们的服务范围内',
                })
                Taro.showToast({
                    title: '地址不在服务范围内',
                    icon: 'none',
                })
                return
            }

            setIsLoading(true)
            try {
                // Prepare data for API - matches Address model
                const addressData: Omit<Address, 'id'> = {
                    recipientName: formData.recipientName,
                    phoneNumber: formData.phoneNumber,
                    province: formData.province,
                    city: formData.city,
                    district: formData.district,
                    detailedAddress: formData.detailedAddress,
                    isDefault: formData.isDefault,
                    label: formData.label,
                    coordinates: formData.coordinates
                }

                let response: any
                if (editingAddressId) {
                    // Update existing address via API
                    response = await AddressService.updateAddress(editingAddressId, addressData)
                } else {
                    // Create new address via API
                    response = await AddressService.createAddress(addressData)
                }

                if (response.success && response.data) {
                    // response.data is already transformed by AddressService to unified Address format
                    const savedAddress: Address = {
                        ...response.data,
                        id: String(response.data.id)
                    }

                    if (editingAddressId) {
                        // Update in store
                        updateAddress(savedAddress)
                    } else {
                        // Add to store
                        addAddress(savedAddress)
                        setSelectedAddressId(savedAddress.id as string)
                        selectAddress(savedAddress.id as string)
                    }

                    setShowAddressForm(false)
                    setEditingAddressId(undefined)
                    setErrors({})
                } else {
                    throw new Error(response.error || '保存地址失败')
                }
            } catch (error) {
                console.error('Error saving address:', error)
                Taro.showToast({
                    title: error instanceof Error ? error.message : '保存失败，请重试',
                    icon: 'none',
                })
            } finally {
                setIsLoading(false)
            }
        },
        [editingAddressId, addresses, addAddress, updateAddress, selectAddress, serviceAreaBoundary]
    )

    const handleCloseForm = useCallback(() => {
        setShowAddressForm(false)
        setEditingAddressId(undefined)
        setErrors({})
    }, [])

    // ============================================================================
    // Form Submission
    // ============================================================================

    const handleNext = useCallback(async () => {
        // Validate address is selected
        if (!selectedAddressId) {
            Taro.showToast({
                title: '请选择一个地址',
                icon: 'none',
            })
            return
        }

        // Get selected address
        const selected = addresses.find((addr) => addr.id === selectedAddressId)
        if (!selected) {
            Taro.showToast({
                title: '地址不存在',
                icon: 'none',
            })
            return
        }

        // Proceed to next step (no API call needed here)
        onNext(selected)
    }, [selectedAddressId, addresses, onNext])

    // ============================================================================
    // Render
    // ============================================================================

    // Show address form if editing or adding
    if (showAddressForm) {
        const editingAddress = editingAddressId
            ? addresses.find((addr) => addr.id === editingAddressId)
            : undefined

        return (
            <AddressForm
                initialData={editingAddress}
                onSave={handleSaveAddress}
                onCancel={handleCloseForm}
                isLoading={isLoading}
                errors={errors}
            />
        )
    }

    // Show address list
    return (
        <ScrollView className='address-selection' scrollY>
            <View className='address-selection-container'>
                {/* Header */}
                <View className='form-header'>
                    <Text className='form-title'>选择取件地址</Text>
                    <Text className='form-subtitle'>第2步，共4步</Text>
                </View>

                {/* No Addresses State */}
                {addresses.length === 0 && (
                    <View className='empty-state'>
                        <Text className='empty-icon'>📍</Text>
                        <Text className='empty-title'>还没有保存的地址</Text>
                        <Text className='empty-description'>请添加一个取件地址以继续</Text>
                        <Button className='btn-primary' onClick={handleAddNewAddress}>
                            添加取件地址
                        </Button>
                    </View>
                )}

                {/* Addresses List */}
                {addresses.length > 0 && (
                    <View className='form-section'>
                        <Text className='section-title'>已保存的地址</Text>

                        <View className='addresses-list'>
                            {addresses.map((address) => (
                                <AddressCard
                                    key={String(address.id)}
                                    address={address}
                                    isSelected={selectedAddressId === String(address.id)}
                                    onSelect={() => handleSelectAddress(String(address.id))}
                                    onEdit={() => handleEditAddress(String(address.id))}
                                    onDelete={() => handleDeleteAddress(String(address.id))}
                                />
                            ))}
                        </View>

                        {/* Add New Address Button */}
                        <View className='add-address-section'>
                            <Button className='btn-secondary' onClick={handleAddNewAddress}>
                                + 手动添加
                            </Button>
                            <Button className='btn-wechat' onClick={handleImportFromWechat}>
                                <Text className='icon'>📱</Text> 微信导入
                            </Button>
                        </View>
                    </View>
                )}

                {/* Action Buttons */}
                {addresses.length > 0 && (
                    <View className='form-actions'>
                        <Button className='btn-secondary' onClick={onBack} disabled={isLoading}>
                            返回
                        </Button>
                        <Button
                            className='btn-primary'
                            onClick={handleNext}
                            disabled={isLoading || !selectedAddressId}
                        >
                            {isLoading ? '提交中...' : '下一步'}
                        </Button>
                    </View>
                )}
            </View>
        </ScrollView>
    )
}

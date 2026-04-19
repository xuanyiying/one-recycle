/**
 * AddressSelection Component (Step 2 of Order Creation Flow)
 * Allows users to select a delivery address or add a new one
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { useState, useCallback, useEffect } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AddressService } from '@/services/address'
import { logger } from '@/utils/logger'
import AddressForm from '@/components/AddressForm'
import { useAddresses } from '@/hooks/useAddresses'
import { Address } from '@/types/order'
import { AddressFormData } from '@/types/address'
import { validateAddress, validateAddressInServiceArea } from '../../../utils/orderValidation'
import { useOrderStore } from '../../../store/orderStore'
import AddressCard from '../../AddressCard'
import './index.scss'

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
    const { state, setAddresses, selectAddress, addAddress, updateAddress } = useOrderStore()
    // Get addresses from store
    const addresses = state.addresses

    const normalizeAddressId = (id?: string | number) => (id !== undefined && id !== null ? String(id) : undefined)
    const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(
        normalizeAddressId(initialAddress?.id ?? state.selectedAddressId)
    )
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [editingAddressId, setEditingAddressId] = useState<string | number | undefined>()
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Use custom hook for address loading logic
    const { isLoading: isInitialLoading, hasFetched } = useAddresses({ 
        addresses, 
        setAddresses 
    })

    const isLoading = isInitialLoading || isSubmitting


    // ============================================================================
    // Effects
    // ============================================================================

    // Auto-select default address or validate current selection
    useEffect(() => {
        if (addresses.length === 0) return
        
        const normalizedSelectedId = normalizeAddressId(selectedAddressId)
        // Check if current selection is valid (exists in the list)
        const hasSelected = normalizedSelectedId && addresses.some((addr) => String(addr.id) === normalizedSelectedId)
        
        // If we have a valid selection, we don't need to do anything
        if (hasSelected) return

        // If no valid selection, find default or first available
        const defaultAddr = addresses.find((addr) => addr.isDefault) || addresses[0]
        if (defaultAddr && defaultAddr.id !== undefined) {
            const id = String(defaultAddr.id)
            // Update both local state and store
            setSelectedAddressId(id)
            selectAddress(id)
        }
    }, [addresses, selectedAddressId, selectAddress])

    // If no addresses exist after fetch, show form automatically
    useEffect(() => {
        if (!isLoading && hasFetched && addresses.length === 0 && !showAddressForm) {
            setShowAddressForm(true)
        }
    }, [isLoading, hasFetched, addresses.length, showAddressForm])

    // ============================================================================
    // Address Selection Handlers
    // ============================================================================

    const handleSelectAddress = useCallback((addressId: string | number) => {
        const normalizedId = String(addressId)
        setSelectedAddressId(normalizedId)
        selectAddress(normalizedId)
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
                        logger.error('Error deleting address:', error)
                        Taro.showToast({
                            title: error instanceof Error ? error.message : '删除失败，请重试',
                            icon: 'none',
                        })
                    }
                }
            },
        })
    }, [selectedAddressId])

    // ============================================================================
    // Address Form Handlers
    // ============================================================================

    const handleSaveAddress = useCallback(
        async (formData: AddressFormData) => {            
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
                    detail: '该地址不在我们的服务范围内',
                })
                Taro.showToast({
                    title: '地址不在服务范围内',
                    icon: 'none',
                })
                return
            }

            setIsSubmitting(true)
            try {
                // Prepare data for API - matches Address model
                const addressData: Omit<Address, 'id'> = {
                    name: formData.name,
                    mobile: formData.mobile,
                    province: formData.province,
                    city: formData.city,
                    district: formData.district,
                    detail: formData.detail,
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
                logger.error('Error saving address:', error)
                Taro.showToast({
                    title: error instanceof Error ? error.message : '保存失败，请重试',
                    icon: 'none',
                })
            } finally {
                setIsSubmitting(false)
            }
        },
        [editingAddressId, addAddress, updateAddress, selectAddress, serviceAreaBoundary]
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
        const selected = addresses.find((addr) => String(addr.id) === String(selectedAddressId))
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

    // Show loading state
    if (isLoading && addresses.length === 0) {
        return (
            <View className='address-selection loading'>
                <View className='loading-spinner' />
                <Text>正在加载地址...</Text>
            </View>
        )
    }

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
                    <Text className='form-subtitle'>第2步，共3步</Text>
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

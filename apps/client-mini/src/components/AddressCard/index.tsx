/**
 * AddressCard Component
 * Displays a single address with selection, edit, and delete options
 */

import { View, Text } from '@tarojs/components'
import { Address, AddressLabel } from '../../types/order'
import './index.scss'

// ============================================================================
// Types
// ============================================================================

interface AddressCardProps {
    address: Address
    isSelected: boolean
    onSelect: () => void
    onEdit: () => void
    onDelete: () => void
}

// ============================================================================
// Label Display Mapping
// ============================================================================

const LABEL_DISPLAY: Record<AddressLabel, string> = {
    [AddressLabel.HOME]: '家',
    [AddressLabel.WORK]: '工作',
    [AddressLabel.SCHOOL]: '学校',
    [AddressLabel.OTHER]: '其他',
}

// ============================================================================
// Helper Functions
// ============================================================================

const formatPhoneNumber = (phone: string) => {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
    }
    return phone
}

// ============================================================================
// Component
// ============================================================================

export default function AddressCard({
    address,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
}: AddressCardProps) {
    return (
        <View
            className={`address-card ${isSelected ? 'selected' : ''}`}
            onClick={onSelect}
        >
            {/* Radio Button */}
            <View className='card-radio'>
                <View className={`radio-circle ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <View className='radio-dot' />}
                </View>
            </View>

            {/* Address Content */}
            <View className='card-content'>
                {/* Header with Label and Default Badge */}
                <View className='card-header'>
                    <View className='header-left'>
                        <Text className='address-label'>{address.label ? LABEL_DISPLAY[address.label] : '其他'}</Text>
                        {address.isDefault && <Text className='default-badge'>默认</Text>}
                    </View>
                    <Text className='recipient-name'>{address.name}</Text>
                </View>

                {/* Phone Number */}
                <Text className='phone-number'>{formatPhoneNumber(address.mobile)}</Text>

                {/* Address Details */}
                <View className='address-details'>
                    <Text className='full-address'>
                        {`${address.province}${address.city}${address.district}${address.street || ''} ${address.detail}`}
                    </Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View className='card-actions' onClick={(e) => e.stopPropagation()}>
                <Text className='action-btn edit-btn' onClick={onEdit}>
                    编辑
                </Text>
                <Text className='action-btn delete-btn' onClick={onDelete}>
                    删除
                </Text>
            </View>
        </View>
    )
}

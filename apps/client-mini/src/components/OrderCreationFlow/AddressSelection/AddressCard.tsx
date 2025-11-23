/**
 * AddressCard Component
 * Displays a single address with selection, edit, and delete options
 */

import { View, Text } from '@tarojs/components'
import { Address, AddressLabel } from '../../../types/order'
import './AddressCard.scss'

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
                        <Text className='address-label'>{LABEL_DISPLAY[address.label]}</Text>
                        {address.isDefault && <Text className='default-badge'>默认</Text>}
                    </View>
                    <Text className='recipient-name'>{address.recipientName}</Text>
                </View>

                {/* Phone Number */}
                <Text className='phone-number'>{address.phoneNumber}</Text>

                {/* Address Details */}
                <View className='address-details'>
                    <Text className='region'>{address.region}</Text>
                    <Text className='detailed-address'>{address.detailedAddress}</Text>
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

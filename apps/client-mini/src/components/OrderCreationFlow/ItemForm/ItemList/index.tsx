/**
 * ItemList Sub-component
 * Displays list of added items with edit/remove functionality
 * 
 * Requirements: 1.5
 */

import { View, Text, Image, Button } from '@tarojs/components'
import { Item } from '../../../../types/order'
import { formatPriceRange } from '../../../../utils/priceCalculation'
import './index.scss'

// ============================================================================
// Types
// ============================================================================

interface ItemListProps {
    items: Item[]
    onEdit: (itemId: string) => void
    onRemove: (itemId: string) => void
}

// ============================================================================
// Component
// ============================================================================

export default function ItemList({ items, onEdit, onRemove }: ItemListProps) {
    if (!items || items.length === 0) {
        return (
            <View className='item-list-empty'>
                <Text className='empty-message'>还没有添加物品</Text>
            </View>
        )
    }

    return (
        <View className='item-list'>
            {items.map((item, index) => (
                <View key={item.id} className='item-card'>
                    {/* Item Header */}
                    <View className='item-header'>
                        <View className='item-info'>
                            <Text className='item-number'>物品 {index + 1}</Text>
                            <Text className='item-category'>{item.categoryName}</Text>
                        </View>
                        <Text className='item-price'>{formatPriceRange(item.estimatedPrice)}</Text>
                    </View>

                    {/* Item Photos */}
                    {item.photos && item.photos.length > 0 && (
                        <View className='item-photos'>
                            {item.photos.slice(0, 3).map((photo, photoIndex) => (
                                <Image
                                    key={photoIndex}
                                    className='photo-thumbnail'
                                    src={photo}
                                    mode='aspectFill'
                                />
                            ))}
                            {item.photos.length > 3 && (
                                <View className='photo-more'>
                                    <Text className='more-count'>+{item.photos.length - 3}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Item Details */}
                    <View className='item-details'>
                        <View className='detail-row'>
                            <Text className='detail-label'>品牌/型号：</Text>
                            <Text className='detail-value'>{item.brandModel}</Text>
                        </View>
                        <View className='detail-row'>
                            <Text className='detail-label'>状况：</Text>
                            <Text className='detail-value'>
                                {item.condition === 'new' ? '全新' : item.condition === 'good' ? '良好' : '一般'}
                            </Text>
                        </View>
                        <View className='detail-row'>
                            <Text className='detail-label'>重量/数量：</Text>
                            <Text className='detail-value'>
                                {item.weight}kg × {item.quantity}
                            </Text>
                        </View>
                        {item.notes && (
                            <View className='detail-row'>
                                <Text className='detail-label'>备注：</Text>
                                <Text className='detail-value'>{item.notes}</Text>
                            </View>
                        )}
                    </View>

                    {/* Item Actions */}
                    <View className='item-actions'>
                        <Button
                            className='btn-edit'
                            size='mini'
                            onClick={() => onEdit(item.id)}
                        >
                            编辑
                        </Button>
                        <Button
                            className='btn-remove'
                            size='mini'
                            onClick={() => onRemove(item.id)}
                        >
                            移除
                        </Button>
                    </View>
                </View>
            ))}
        </View>
    )
}

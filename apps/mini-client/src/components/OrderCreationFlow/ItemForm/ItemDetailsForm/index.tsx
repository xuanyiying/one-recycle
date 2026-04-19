/**
 * ItemDetailsForm Sub-component
 * Displays category-specific fields for item details
 * 
 * Requirements: 1.2, 1.4
 */

import { View, Text, Input, Picker } from '@tarojs/components'
import { ItemCondition } from '../../../../types/order'
import './index.scss'

// ============================================================================
// Types
// ============================================================================

interface ItemDetailsFormProps {
    formData: {
        categoryId: string
        categoryName: string
        categorySlug?: string
        brandModel: string
        condition: ItemCondition
        weight: number
        quantity: number
        photos: string[]
        notes?: string
    }
    errors: Record<string, string>
    onBrandModelChange: (value: string) => void
    onConditionChange: (condition: ItemCondition) => void
    onWeightChange: (value: string) => void
    onQuantityChange: (value: string) => void
    onNotesChange: (value: string) => void
}

// ============================================================================
// Constants
// ============================================================================

const CONDITIONS = [
    { label: '全新', value: ItemCondition.NEW },
    { label: '良好', value: ItemCondition.GOOD },
    { label: '一般', value: ItemCondition.FAIR },
]

// 分类特定的字段配置
const CATEGORY_FIELD_CONFIG: Record<string, {
    requiresBrandModel: boolean
    requiresCondition: boolean
    requiresWeight: boolean
    requiresQuantity: boolean
    brandModelPlaceholder: string
}> = {
    'electronics': {
        requiresBrandModel: true,
        requiresCondition: true,
        requiresWeight: true,
        requiresQuantity: true,
        brandModelPlaceholder: '例如：iPhone 13 Pro'
    },
    'clothing': {
        requiresBrandModel: false,
        requiresCondition: true,
        requiresWeight: true,
        requiresQuantity: true,
        brandModelPlaceholder: '例如：T恤、牛仔裤'
    },
    'books': {
        requiresBrandModel: false,
        requiresCondition: true,
        requiresWeight: true,
        requiresQuantity: true,
        brandModelPlaceholder: '例如：书名、作者'
    },
    'furniture': {
        requiresBrandModel: false,
        requiresCondition: true,
        requiresWeight: true,
        requiresQuantity: false,
        brandModelPlaceholder: '例如：沙发、书桌'
    },
    'appliances': {
        requiresBrandModel: true,
        requiresCondition: true,
        requiresWeight: true,
        requiresQuantity: false,
        brandModelPlaceholder: '例如：洗衣机、冰箱'
    },
    'other': {
        requiresBrandModel: false,
        requiresCondition: false,
        requiresWeight: true,
        requiresQuantity: true,
        brandModelPlaceholder: '请描述物品'
    }
}

// ============================================================================
// Component
// ============================================================================

export default function ItemDetailsForm({
    formData,
    errors,
    onBrandModelChange,
    onConditionChange,
    onWeightChange,
    onQuantityChange,
    onNotesChange,
}: ItemDetailsFormProps) {
    const handleConditionChange = (e: any) => {
        const selectedCondition = CONDITIONS[e.detail.value]
        if (selectedCondition) {
            onConditionChange(selectedCondition.value)
        }
    }

    // 获取当前分类的字段配置
    const defaultConfig =
      CATEGORY_FIELD_CONFIG.other ?? {
        requiresBrandModel: false,
        requiresCondition: false,
        requiresWeight: true,
        requiresQuantity: true,
        brandModelPlaceholder: '请描述物品',
      }

    const config =
      CATEGORY_FIELD_CONFIG[formData.categorySlug || ''] ?? defaultConfig

    return (
        <View className='item-details-form'>
            {/* Brand/Model Field - 根据分类决定是否显示 */}
            {config.requiresBrandModel && (
                <View className='form-field'>
                    <Text className='field-label'>
                        品牌/型号 <Text className='required'>*</Text>
                    </Text>
                    <Input
                      className={`field-input ${errors.brandModel ? 'error' : ''}`}
                      type='text'
                      placeholder={config.brandModelPlaceholder}
                      value={formData.brandModel}
                      onInput={(e: any) => onBrandModelChange(e.detail.value)}
                      maxlength={100}
                    />
                    {errors.brandModel && <Text className='error-message'>{errors.brandModel}</Text>}
                </View>
            )}

            {/* Condition Field - 根据分类决定是否显示 */}
            {config.requiresCondition && (
                <View className='form-field'>
                    <Text className='field-label'>
                        物品状况 <Text className='required'>*</Text>
                    </Text>
                    <Picker
                      mode='selector'
                      range={CONDITIONS.map((c) => c.label)}
                      value={CONDITIONS.findIndex((c) => c.value === formData.condition)}
                      onChange={handleConditionChange}
                    >
                        <View className='picker-item'>
                            <Text className='selected'>
                                {CONDITIONS.find((c) => c.value === formData.condition)?.label}
                            </Text>
                            <Text className='arrow'>▼</Text>
                        </View>
                    </Picker>
                </View>
            )}

            {/* Weight Field - 根据分类决定是否显示 */}
            {config.requiresWeight && (
                <View className='form-field'>
                    <Text className='field-label'>
                        重量 (kg) <Text className='required'>*</Text>
                    </Text>
                    <View className='input-with-unit'>
                        <Input
                          className={`field-input ${errors.weight ? 'error' : ''}`}
                          type='digit'
                          placeholder='0.0'
                          value={formData.weight > 0 ? formData.weight.toString() : ''}
                          onInput={(e: any) => onWeightChange(e.detail.value)}
                        />
                        <Text className='unit'>kg</Text>
                    </View>
                    {errors.weight && <Text className='error-message'>{errors.weight}</Text>}
                </View>
            )}

            {/* Quantity Field - 根据分类决定是否显示 */}
            {config.requiresQuantity && (
                <View className='form-field'>
                    <Text className='field-label'>
                        数量 <Text className='required'>*</Text>
                    </Text>
                    <Input
                      className={`field-input ${errors.quantity ? 'error' : ''}`}
                      type='number'
                      placeholder='1'
                      value={formData.quantity > 0 ? formData.quantity.toString() : ''}
                      onInput={(e: any) => onQuantityChange(e.detail.value)}
                    />
                    {errors.quantity && <Text className='error-message'>{errors.quantity}</Text>}
                </View>
            )}

            {/* Notes Field - 始终显示，但可选 */}
            <View className='form-field'>
                <Text className='field-label'>备注（可选）</Text>
                <Input
                  className='field-input field-textarea'
                  type='text'
                  placeholder='例如：有轻微划痕，但功能正常'
                  value={formData.notes}
                  onInput={(e: any) => onNotesChange(e.detail.value)}
                  maxlength={200}
                />
                <Text className='field-hint'>{formData.notes?.length || 0}/200</Text>
            </View>
        </View>
    )
}

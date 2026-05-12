/**
 * ItemForm Component (Step 1 of Order Creation Flow)
 * Allows users to select recyclable items, provide details, upload photos, and manage item list
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { useState, useCallback, useEffect } from 'react'
import { View, Text, Button, ScrollView, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Item, ItemCondition, PriceRange } from '../../../types/order'
import { validateItem } from '../../../utils/orderValidation'
import { logger } from '@/utils/logger'
import CategorySelector from '../../CategorySelector'
import ImageUploader from '../../ImageUploader'
import PriceEstimate from '../PriceEstimate'
import ItemList from './ItemList'
import ItemDetailsForm from './ItemDetailsForm'
import './index.scss'

// ============================================================================
// Imports
// ============================================================================

import { getActiveCategories } from '../../../services/category'
import { estimateItemPrices } from '../../../services/pricing'
import { uploadOrderPhotos } from '../../../services/upload'
import { Category } from '../../../types/category'

interface ItemFormProps {
    onNext: (items: Item[]) => void
    onBack?: () => void
    initialItems?: Item[]
    initialCategory?: string
}

interface FormData {
    categoryId: string
    categoryName: string
    categorySlug: string
    brandModel: string
    condition: ItemCondition
    weight: number
    quantity: number
    photos: string[]
    notes?: string
}

// ============================================================================
// Component
// ============================================================================

export default function ItemForm({ onNext, onBack, initialItems = [], initialCategory }: ItemFormProps) {
    // State management
    const [items, setItems] = useState<Item[]>(initialItems)
    const [categories, setCategories] = useState<Category[]>([])
    const [loadingCategories, setLoadingCategories] = useState(true)
    const [formData, setFormData] = useState<FormData>({
        categoryId: '',
        categoryName: '',
        categorySlug: '',
        brandModel: '',
        condition: ItemCondition.GOOD,
        weight: 0,
        quantity: 1,
        photos: [],
        notes: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isUploading, setIsUploading] = useState(false)

    // ============================================================================
    // Effects
    // ============================================================================

    useEffect(() => {
        loadCategories()
    }, [])

    const handleCategoryChange = useCallback((categoryId: string) => {
        const category = categories.find(cat => String(cat.id) === categoryId)
        if (category) {
            setFormData((prev) => ({
                ...prev,
                categoryId: String(category.id),
                categoryName: category.name,
                categorySlug: category.seo?.slug || ''
            }))
            // Clear errors for category field
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors.categoryId
                return newErrors
            })
        }
    }, [categories])

    useEffect(() => {
        if (initialCategory && categories.length > 0 && !formData.categoryId) {
            // 首先尝试用 id 匹配（从首页传递的是 categoryId）
            let category = categories.find(cat => String(cat.id) === initialCategory)
            // 如果没有找到，再尝试用 slug 匹配
            if (!category) {
                category = categories.find(cat => cat.seo?.slug === initialCategory)
            }
            if (category) {
                handleCategoryChange(String(category.id))
            }
        }
    }, [initialCategory, categories, formData.categoryId, handleCategoryChange])

    const loadCategories = async () => {
        try {
            setLoadingCategories(true)
            const categoriesData = await getActiveCategories()

            setCategories(categoriesData)
        } catch (error) {
            logger.error('Failed to load categories:', error)
            Taro.showToast({
                title: '加载分类失败',
                icon: 'none',
            })
        } finally {
            setLoadingCategories(false)
        }
    }

    // ============================================================================
    // Form Data Handlers
    // ============================================================================

    const handleBrandModelChange = useCallback((value: string) => {
        setFormData((prev) => ({
            ...prev,
            brandModel: value,
        }))
    }, [])

    const handleConditionChange = useCallback((condition: ItemCondition) => {
        setFormData((prev) => ({
            ...prev,
            condition,
        }))
    }, [])

    const handleWeightChange = useCallback((value: string) => {
        const weight = parseFloat(value) || 0
        setFormData((prev) => ({
            ...prev,
            weight: Math.max(0, weight),
        }))
    }, [])

    const handleQuantityChange = useCallback((value: string) => {
        const quantity = parseInt(value) || 1
        setFormData((prev) => ({
            ...prev,
            quantity: Math.max(1, quantity),
        }))
    }, [])

    const handlePhotosChange = useCallback((photos: string[]) => {
        setFormData((prev) => ({
            ...prev,
            photos,
        }))
        // Clear photo errors
        setErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors.photos
            return newErrors
        })
    }, [])

    const handleNotesChange = useCallback((value: string) => {
        setFormData((prev) => ({
            ...prev,
            notes: value,
        }))
    }, [])

    // ============================================================================
    // Item Management
    // ============================================================================

    const validateFormData = useCallback((): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.categoryId) {
            newErrors.categoryId = '请选择分类'
        }

        // 根据分类配置验证字段
        const CATEGORY_FIELD_CONFIG: Record<string, {
            requiresBrandModel: boolean
            requiresCondition: boolean
            requiresWeight: boolean
            requiresQuantity: boolean
        }> = {
            'electronics': { requiresBrandModel: true, requiresCondition: true, requiresWeight: true, requiresQuantity: true },
            'clothing': { requiresBrandModel: false, requiresCondition: true, requiresWeight: true, requiresQuantity: true },
            'books': { requiresBrandModel: false, requiresCondition: true, requiresWeight: true, requiresQuantity: true },
            'furniture': { requiresBrandModel: false, requiresCondition: true, requiresWeight: true, requiresQuantity: false },
            'appliances': { requiresBrandModel: true, requiresCondition: true, requiresWeight: true, requiresQuantity: false },
            'other': { requiresBrandModel: false, requiresCondition: false, requiresWeight: true, requiresQuantity: true }
        }

        const defaultConfig =
            CATEGORY_FIELD_CONFIG.other ?? {
                requiresBrandModel: false,
                requiresCondition: false,
                requiresWeight: true,
                requiresQuantity: true,
            }

        const config = CATEGORY_FIELD_CONFIG[formData.categorySlug] ?? defaultConfig

        if (config.requiresBrandModel && (!formData.brandModel || formData.brandModel.trim() === '')) {
            newErrors.brandModel = '请输入品牌/型号'
        }

        if (config.requiresWeight && formData.weight <= 0) {
            newErrors.weight = '重量必须大于0'
        }

        if (config.requiresQuantity && formData.quantity <= 0) {
            newErrors.quantity = '数量必须大于0'
        }

        if (formData.photos.length === 0) {
            newErrors.photos = '请至少上传一张照片'
        }

        if (formData.photos.length > 6) {
            newErrors.photos = '最多只能上传6张照片'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [formData])

    const handleAddItem = useCallback(async () => {
        if (!validateFormData()) {
            Taro.showToast({
                title: '请填写完整信息',
                icon: 'none',
            })
            return
        }

        setIsUploading(true)
        Taro.showLoading({ title: '上传照片中...', mask: true })
        let photoStorageIds: string[] = []
        try {
            photoStorageIds = await uploadOrderPhotos(formData.photos)
        } catch (error) {
            Taro.hideLoading()
            setIsUploading(false)
            Taro.showToast({
                title: error instanceof Error ? error.message : '照片上传失败',
                icon: 'none',
            })
            return
        }

        const selectedCategory = categories.find(cat => String(cat.id) === formData.categoryId)
        const basePrice =
            selectedCategory?.pricingRule?.basePrice ??
            selectedCategory?.priceInfo?.unitPrice ??
            0

        // 调用后端API获取价格估算
        let estimatedPrice: PriceRange = { min: 0, max: 0, currency: 'CNY' }
        try {
            const pricing = await estimateItemPrices([{
                id: `temp-${Date.now()}`,
                categoryId: formData.categoryId,
                categoryName: formData.categoryName,
                brandModel: formData.brandModel,
                condition: formData.condition,
                weight: formData.weight,
                quantity: formData.quantity,
                photos: formData.photos,
                notes: formData.notes,
                estimatedPrice: { min: 0, max: 0, currency: 'CNY' },
                createdAt: new Date().toISOString(),
            }])
            estimatedPrice = pricing.totalEstimate
        } catch (error) {
            logger.warn('价格估算API调用失败，使用本地降级方案:', error)
            // 降级方案：使用分类基础价格计算
            const useWeight = formData.weight > 0
            const weightFactor = useWeight ? 1 + (formData.weight - 1) * 0.1 : 1
            const conditionMultiplier = formData.condition === ItemCondition.NEW ? 1.2 :
                formData.condition === ItemCondition.GOOD ? 1.0 : 0.7
            const unitPrice = basePrice * conditionMultiplier * Math.min(weightFactor, 2.0)
            const totalPrice = useWeight ? unitPrice * formData.weight : unitPrice * formData.quantity
            const variance = totalPrice * 0.2
            estimatedPrice = {
                min: Math.max(Math.round((totalPrice - variance) * 100) / 100, 0),
                max: Math.round((totalPrice + variance) * 100) / 100,
                currency: 'CNY',
            }
        }

        const newItem: Item = {
            id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            categoryId: formData.categoryId,
            categoryName: formData.categoryName,
            categorySlug: formData.categorySlug,
            categoryBasePrice: basePrice,
            brandModel: formData.brandModel,
            condition: formData.condition,
            weight: formData.weight,
            quantity: formData.quantity,
            photos: formData.photos,
            photoStorageIds,
            notes: formData.notes,
            estimatedPrice,
            createdAt: new Date().toISOString(),
        }

        setItems((prev) => [...prev, newItem])

        // Reset form (keep category if fixed)
        setFormData(prev => ({
            categoryId: initialCategory ? prev.categoryId : '',
            categoryName: initialCategory ? prev.categoryName : '',
            categorySlug: initialCategory ? prev.categorySlug : '',
            brandModel: '',
            condition: ItemCondition.GOOD,
            weight: 0,
            quantity: 1,
            photos: [],
            notes: '',
        }))
        setErrors({})
        Taro.hideLoading()
        setIsUploading(false)

        Taro.showToast({
            title: '物品已添加',
            icon: 'success',
        })
    }, [formData, initialCategory, validateFormData, categories])

    const handleRemoveItem = useCallback((itemId: string) => {
        setItems((prev) => prev.filter((item) => item.id !== itemId))
        Taro.showToast({
            title: '物品已移除',
            icon: 'success',
        })
    }, [])

    const handleEditItem = useCallback((itemId: string) => {
        const item = items.find((i) => i.id === itemId)
        if (item) {
            setFormData({
                categoryId: item.categoryId,
                categoryName: item.categoryName,
                categorySlug: item.categorySlug || '',
                brandModel: item.brandModel,
                condition: item.condition,
                weight: item.weight,
                quantity: item.quantity,
                photos: item.photos,
                notes: item.notes,
            })
            handleRemoveItem(itemId)
            // Scroll to top to show form
            Taro.pageScrollTo({ scrollTop: 0, duration: 300 })
        }
    }, [items, handleRemoveItem])

    // ============================================================================
    // Form Submission
    // ============================================================================

    const handleNext = useCallback(async () => {
        // Validate items list
        if (items.length === 0) {
            Taro.showToast({
                title: '请至少添加一个物品',
                icon: 'none',
            })
            return
        }

        // Validate all items
        const allValid = items.every((item) => {
            const itemErrors = validateItem(item)
            return itemErrors.length === 0
        })

        if (!allValid) {
            Taro.showToast({
                title: '请检查物品信息',
                icon: 'none',
            })
            return
        }

        // Proceed to next step (no API call needed here, items are validated locally)
        onNext(items)
    }, [items, onNext])

    // ============================================================================
    // Helper Functions
    // ============================================================================

    const getPageTitle = useCallback(() => {
        let title = '添加回收物品'

        if (formData.categoryName) {
            title = formData.categoryName
        } else if (initialCategory && categories.length > 0) {
            const normalizedInitial = String(initialCategory)
            const category = categories.find(cat => String(cat.id) === normalizedInitial)
            if (category) {
                title = category.name
            }
        }

        // Append '回收' if not present and title is not default
        if (title !== '添加回收物品' && !title.endsWith('回收')) {
            return `${title}回收`
        }

        return title
    }, [formData.categoryName, initialCategory, categories])

    // ============================================================================
    // Render
    // ============================================================================

    return (
        <ScrollView className='item-form' scrollY>
            <View className='item-form-container'>
                {/* Header */}
                <View className='form-header'>
                    <Text className='form-title'>
                        {getPageTitle()}
                    </Text>
                    <Text className='form-subtitle'>第1步，共3步</Text>
                </View>

                {/* Item Form Section */}
                <View className='form-section'>
                    <Text className='section-title'>物品信息</Text>

                    {/* Category Selection Area */}
                    {formData.categoryId ? (
                        <View className='current-category-section'>
                            <View className='category-info'>
                                <Text className='label'>当前选择分类：</Text>
                                <Text className='value'>{formData.categoryName}</Text>
                            </View>
                            <Picker
                                mode='selector'
                                range={categories.map(cat => cat.name)}
                                onChange={(e: any) => {
                                    const selectedIndex = Number(e.detail.value)
                                    const category = categories[selectedIndex]
                                    if (category) {
                                        handleCategoryChange(String(category.id))
                                    }
                                }}
                            >
                                <View className='modify-btn'>修改</View>
                            </Picker>
                        </View>
                    ) : (
                        <View className='form-field'>
                            {loadingCategories ? (
                                <View className='loading-categories'>
                                    <Text>加载分类中...</Text>
                                </View>
                            ) : (
                                <CategorySelector
                                    categories={categories.map(cat => ({ id: cat.id, name: cat.name }))}
                                    value={formData.categoryId}
                                    onChange={handleCategoryChange}
                                    required
                                />
                            )}
                            {errors.categoryId && <Text className='error-message'>{errors.categoryId}</Text>}
                        </View>
                    )}

                    {/* Item Details Form */}
                    <ItemDetailsForm
                        formData={formData}
                        errors={errors}
                        onBrandModelChange={handleBrandModelChange}
                        onConditionChange={handleConditionChange}
                        onWeightChange={handleWeightChange}
                        onQuantityChange={handleQuantityChange}
                        onNotesChange={handleNotesChange}
                    />

                    {/* Photo Uploader */}
                    <View className='form-field'>
                        <ImageUploader
                            images={formData.photos}
                            onChange={handlePhotosChange}
                            maxCount={6}
                            title='物品照片'
                            description='上传物品照片有助于更准确的估价（最多6张）'
                        />
                        {errors.photos && <Text className='error-message'>{errors.photos}</Text>}
                    </View>

                    {/* Add Item Button */}
                    <View className='form-field'>
                        <Button
                            className='btn-primary'
                            onClick={handleAddItem}
                            disabled={isUploading}
                        >
                            添加物品
                        </Button>
                    </View>
                </View>

                {/* Items List Section */}
                {items.length > 0 && (
                    <View className='form-section'>
                        <Text className='section-title'>已添加物品 ({items.length})</Text>
                        <ItemList
                            items={items}
                            onEdit={handleEditItem}
                            onRemove={handleRemoveItem}
                        />
                    </View>
                )}

                {/* Price Estimate Section */}
                {items.length > 0 && (
                    <View className='form-section'>
                        <PriceEstimate
                            items={items}
                            showBreakdown
                            showDisclaimer
                        />
                    </View>
                )}

                {/* Action Buttons */}
                <View className='form-actions'>
                    {onBack && (
                        <Button className='btn-secondary' onClick={onBack}>
                            返回
                        </Button>
                    )}
                    <Button
                        className='btn-primary'
                        onClick={handleNext}
                        disabled={items.length === 0}
                    >
                        下一步
                    </Button>
                </View>
            </View>
        </ScrollView>
    )
}

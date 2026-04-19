import { useEffect, useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { SearchBar, Switch } from '@nutui/nutui-react-taro'
import { Icon } from '@/components/Icon'
import { getActiveCategories } from "@/services/category"
import { Category } from "@/types"
import { convertServiceToUICategories } from "@/utils/category"
import { IconButton } from '@/components/IconButton'
import './index.scss'

const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeRootId, setActiveRootId] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isMultiSelect, setIsMultiSelect] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const serviceCategories = await getActiveCategories()
        const uiCategories = convertServiceToUICategories(serviceCategories)
        setCategories(uiCategories)
        if (uiCategories.length > 0) {
          setActiveRootId(uiCategories[0]!.id)
        }
        
        // Load initial selection from router
        const instance = Taro.getCurrentInstance()
        const categoryId = instance.router?.params?.categoryId
        if (categoryId) {
          setSelectedIds([Number(categoryId)])
          // Find root of this category to activate it
          const root = uiCategories.find(c => c.id === Number(categoryId) || c.subCategories?.some(sub => sub.id === Number(categoryId)))
          if (root) setActiveRootId(root.id)
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
    
    Taro.setNavigationBarTitle({ title: '回收分类' })
  }, [])

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchText) return categories
    
    return categories.map(root => {
      // Check if root matches
      const rootMatches = root.name.includes(searchText)
      // Check if any child matches
      const matchingChildren = root.subCategories?.filter(sub => sub.name.includes(searchText)) || []
      
      if (rootMatches || matchingChildren.length > 0) {
        return {
          ...root,
          // If root matches, show all children? Or just matching? 
          // Better to show all if root matches, or just matching children if root doesn't.
          // Let's filter children if root doesn't match directly, but if root matches keep all?
          // Strategy: Only show matching items.
          subCategories: rootMatches ? root.subCategories : matchingChildren
        }
      }
      return null
    }).filter(Boolean) as Category[]
  }, [categories, searchText])

  const activeRoot = useMemo(() => {
    return filteredCategories.find(c => c.id === activeRootId) || filteredCategories[0]
  }, [filteredCategories, activeRootId])

  const handleRootClick = (id: number) => {
    setActiveRootId(id)
  }

  const handleSubCategoryClick = (subId: number) => {
    if (isMultiSelect) {
      setSelectedIds(prev => {
        if (prev.includes(subId)) {
          return prev.filter(id => id !== subId)
        } else {
          return [...prev, subId]
        }
      })
    } else {
      setSelectedIds([subId])
      // Navigate immediately for single select
      Taro.navigateTo({
        url: `/pages/recycle/index?categoryId=${subId}`
      })
    }
  }

  const handleConfirm = () => {
    if (selectedIds.length === 0) {
      Taro.showToast({ title: '请至少选择一项', icon: 'none' })
      return
    }
    // Pass multiple categories. Since target page might strictly expect one, 
    // we might need to adjust logic. For now, pass the first one or a combined string.
    // Assuming target page handles one, we pick first.
    // Ideally we pass IDs via EventChannel or Store.
    // Here we maintain backward compatibility roughly.
    Taro.navigateTo({
      url: `/pages/recycle/index?categoryId=${selectedIds.join(',')}`
    })
  }

  if (loading) {
    return (
      <View className="category-page ios-page-padding">
        <View className="ios-section-spacing">加载中...</View>
      </View>
    )
  }

  return (
    <View className='category-page ios-page-padding'>
      <View className='header-section ios-section-spacing'>
        <SearchBar
          className='search-bar'
          placeholder='搜索回收品类'
          value={searchText}
          onChange={(val) => setSearchText(val)}
          left={<Icon name="search" size={18} />}
        />
        <View className='mode-switch'>
           <Text className='switch-label'>多选模式</Text>
           <Switch checked={isMultiSelect} onChange={setIsMultiSelect} />
        </View>
      </View>

      <View className='content-container'>
        {/* Sidebar */}
        <ScrollView scrollY className='sidebar'>
          {filteredCategories.map(root => (
            <View
              key={root.id}
              className={`sidebar-item ${activeRoot?.id === root.id ? 'active' : ''}`}
              onClick={() => handleRootClick(root.id)}
            >
              <View className='indicator' />
              <Text className='root-name'>{root.name}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Main Content */}
        <ScrollView scrollY className='main-content'>
          {activeRoot ? (
            <View className='subcategory-grid'>
              {activeRoot.subCategories?.map(sub => {
                const isSelected = selectedIds.includes(sub.id)
                return (
                  <View
                    key={sub.id}
                    className={`subcategory-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSubCategoryClick(sub.id)}
                  >
                    <View className='card-content'>
                       <Text className='sub-name'>{sub.name}</Text>
                       <Text className='sub-price'>¥{sub.basePrice}起</Text>
                    </View>
                    {isSelected && (
                      <View className='check-mark'>
                        <Icon name='check' size={16} color='#fff' />
                      </View>
                    )}
                  </View>
                )
              })}
              {(activeRoot.subCategories?.length ?? 0) === 0 && (
                <View className='empty-tip'>该分类下暂无细项</View>
              )}
            </View>
          ) : (
            <View className='empty-state'>未找到相关分类</View>
          )}
        </ScrollView>
      </View>

      {/* Footer for Multi-select */}
      {isMultiSelect && (
        <View className='footer-actions ios-safe-area-bottom'>
          <View className='selection-info'>
            已选 <Text className='count'>{selectedIds.length}</Text> 项
          </View>
          <IconButton
            icon={<Icon name='arrow-right' />}
            variant='primary'
            onClick={handleConfirm}
            className='confirm-btn'
          >
            确认选择
          </IconButton>
        </View>
      )}
    </View>
  )
}

export default CategoryPage

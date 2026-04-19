import { View, Text, Picker } from '@tarojs/components'
import './index.scss'

interface Category {
  id: number | string
  name: string
}

interface CategorySelectorProps {
  categories: Category[]
  value: string // category id or name
  onChange: (categoryId: string) => void
  placeholder?: string
  required?: boolean
}

export default function CategorySelector({
  categories,
  value,
  onChange,
  placeholder = '请选择分类',
  required = false
}: CategorySelectorProps) {
  const handleChange = (e: any) => {
    const selectedCategory = categories[e.detail.value]
    if (selectedCategory) {
      onChange(String(selectedCategory.id))
    }
  }

  // Find selected category by id or name
  const selectedIndex = categories.findIndex(
    cat => String(cat.id) === value || cat.name === value
  )
  const selectedCategory = selectedIndex >= 0 ? categories[selectedIndex] : null

  return (
    <View className='category-selector'>
      <Text className='section-title'>
        回收分类 {required && <Text className='required'>*</Text>}
      </Text>
      <Picker
        mode='selector'
        range={categories.map(cat => cat.name)}
        value={selectedIndex >= 0 ? selectedIndex : 0}
        onChange={handleChange}
      >
        <View className='picker-item'>
          <Text className={selectedCategory ? 'selected' : 'placeholder'}>
            {selectedCategory?.name || placeholder}
          </Text>
          <Text className='arrow'>▼</Text>
        </View>
      </Picker>
    </View>
  )
}
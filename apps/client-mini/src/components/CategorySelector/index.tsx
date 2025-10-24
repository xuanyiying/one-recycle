import { View, Text, Picker } from '@tarojs/components'
import './index.scss'
interface Category {
  id: number
  name: string
}

interface CategorySelectorProps {
  categories: Category[]
  value: string
  onChange: (category: string) => void
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
      onChange(selectedCategory.name)
    }
  }

  return (
    <View className='category-selector'>
      <Text className='section-title'>
        回收分类 {required && <Text className='required'>*</Text>}
      </Text>
      <Picker
        mode='selector'
        range={categories.map(cat => cat.name)}
        value={categories.findIndex(cat => cat.name === value)}
        onChange={handleChange}
      >
        <View className='picker-item'>
          <Text className={value ? 'selected' : 'placeholder'}>
            {value || placeholder}
          </Text>
          <Text className='arrow'>▼</Text>
        </View>
      </Picker>
    </View>
  )
}
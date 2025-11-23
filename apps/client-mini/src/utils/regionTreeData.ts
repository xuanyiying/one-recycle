// 中国行政区域树形数据工具
// 将 region.json 数据转换为树形结构，便于在程序中使用

// 导入区域数据
import regionData from '@/data/region.json'

// 定义树节点接口 (NutUI Cascader 格式)
export interface RegionTreeNode {
  value: string
  text: string
  children?: RegionTreeNode[]
}

// NutUI Cascader 需要的格式
export interface CascaderOption {
  value: string
  label: string
  children?: CascaderOption[]
}

// 转换 region.json 数据为树形结构
export const convertRegionDataToTree = (): RegionTreeNode[] => {
  // 获取省份数据 (key为'00')
  const provinces = regionData['00'] || {}
  
  // 构建树形结构
  return Object.entries(provinces).map(([provinceId, provinceName]) => {
    // 获取该省对应的城市数据
    const cities = regionData[provinceId] || {}
    
    return {
      value: provinceId,
      text: provinceName as string,
      children: Object.entries(cities).map(([cityId, cityName]) => ({
        value: cityId,
        text: cityName as string,
        children: [] // 当前数据结构只到市级，没有区级数据
      }))
    }
  })
}

// 导出转换后的树形数据
export const regionTreeData: RegionTreeNode[] = convertRegionDataToTree()

// 转换为 NutUI Cascader 格式
export const convertToCascaderOptions = (nodes: RegionTreeNode[]): CascaderOption[] => {
  return nodes.map(node => ({
    value: node.value,
    label: node.text,
    children: node.children && node.children.length > 0 
      ? convertToCascaderOptions(node.children)
      : undefined
  }))
}

// 导出 NutUI Cascader 格式的数据
export const cascaderOptions: CascaderOption[] = convertToCascaderOptions(regionTreeData)

// 根据值查找节点路径
export const findNodePath = (value: string, nodes: RegionTreeNode[]): RegionTreeNode[] | null => {
  for (const node of nodes) {
    if (node.value === value) {
      return [node]
    }
    
    if (node.children) {
      const childPath = findNodePath(value, node.children)
      if (childPath) {
        return [node, ...childPath]
      }
    }
  }
  
  return null
}

// 根据值查找完整路径（文本形式）
export const findTextPath = (value: string): string[] | null => {
  const path = findNodePath(value, regionTreeData)
  return path ? path.map(node => node.text) : null
}

// 根据省份ID获取城市列表
export const getCitiesByProvinceId = (provinceId: string): RegionTreeNode[] => {
  const province = regionTreeData.find(p => p.value === provinceId)
  return province?.children || []
}

// 获取所有省份
export const getAllProvinces = (): RegionTreeNode[] => {
  return regionTreeData
}

// 根据省市ID获取完整地址文本
export const getAddressText = (provinceId: string, cityId: string): string => {
  const province = regionTreeData.find(p => p.value === provinceId)
  if (!province) return ''
  
  const city = province.children?.find(c => c.value === cityId)
  if (!city) return province.text
  
  return `${province.text}${city.text}`
}

// 调试：打印数据结构
console.log('Region tree data loaded:', regionTreeData.length, 'provinces')
if (regionTreeData.length > 0) {
  console.log('First province:', regionTreeData[0])
}
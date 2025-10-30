// 地址数据管理工具

// 定义地址相关类型接口
export interface RegionData {
  name?: string
  id?: string
  [key: string]: any
}

// 导入中国行政区域数据
import chinaRegionsData from '@/data/chinaRegions.json'

// 定义区域数据接口
// 从JSON数据中提取省份数据
export const provinceData: RegionData[] = chinaRegionsData.provinces.map(province => ({
  name: province.name,
  id: province.id
}))

// 从JSON数据中提取城市数据
export const cityData: { [key: string]: RegionData[] } = {}
chinaRegionsData.provinces.forEach(province => {
  cityData[province.id] = province.cities.map(city => ({
    name: city.name,
    id: city.id
  }))
})

// 从JSON数据中提取区县数据
export const countryData: { [key: string]: RegionData[] } = {}
chinaRegionsData.provinces.forEach(province => {
  province.cities.forEach(city => {
    countryData[city.id] = city.districts.map(district => ({
      name: district.name,
      id: district.id
    }))
  })
})

// 模拟街道数据（保持原有的街道数据结构）
export const townData: { [key: string]: RegionData[] } = {
  '110101': [
    { name: '东华门街道', id: '110101001' },
    { name: '景山街道', id: '110101002' },
    { name: '交道口街道', id: '110101003' },
    { name: '安定门街道', id: '110101004' },
    { name: '北新桥街道', id: '110101005' }
  ],
  '110102': [
    { name: '西长安街街道', id: '110102001' },
    { name: '新街口街道', id: '110102002' },
    { name: '月坛街道', id: '110102003' },
    { name: '展览路街道', id: '110102004' }
  ],
  '110105': [
    { name: '建国门外街道', id: '110105001' },
    { name: '朝外街道', id: '110105002' },
    { name: '呼家楼街道', id: '110105003' },
    { name: '三里屯街道', id: '110105004' },
    { name: '左家庄街道', id: '110105005' }
  ],
  '110108': [
    { name: '万寿路街道', id: '110108001' },
    { name: '永定路街道', id: '110108002' },
    { name: '羊坊店街道', id: '110108003' },
    { name: '甘家口街道', id: '110108004' },
    { name: '中关村街道', id: '110108005' }
  ],
  '310101': [
    { name: '南京东路街道', id: '310101001' },
    { name: '外滩街道', id: '310101002' },
    { name: '半淞园路街道', id: '310101003' },
    { name: '小东门街道', id: '310101004' }
  ],
  '310104': [
    { name: '天平路街道', id: '310104001' },
    { name: '湖南路街道', id: '310104002' },
    { name: '斜土路街道', id: '310104003' },
    { name: '枫林路街道', id: '310104004' }
  ],
  '440103': [
    { name: '沙面街道', id: '440103001' },
    { name: '岭南街道', id: '440103002' },
    { name: '华林街道', id: '440103003' },
    { name: '多宝街道', id: '440103004' }
  ],
  '440106': [
    { name: '沙河街道', id: '440106001' },
    { name: '五山街道', id: '440106002' },
    { name: '员村街道', id: '440106003' },
    { name: '车陂街道', id: '440106004' },
    { name: '石牌街道', id: '440106005' }
  ],
  '440303': [
    { name: '桂园街道', id: '440303001' },
    { name: '黄贝街道', id: '440303002' },
    { name: '东门街道', id: '440303003' },
    { name: '南湖街道', id: '440303004' }
  ],
  '440304': [
    { name: '园岭街道', id: '440304001' },
    { name: '南园街道', id: '440304002' },
    { name: '福田街道', id: '440304003' },
    { name: '沙头街道', id: '440304004' }
  ]
}

// 地址列表数据存储key
const ADDRESS_LIST_KEY = 'user_address_list'

// 地址数据接口
export interface UserAddress {
  id: string | number
  provinceName: string
  cityName: string
  countyName: string
  townName: string
  addressDetail: string
  selectedAddress: boolean
  name?: string
  phone?: string
}

// 获取用户地址列表
export const getUserAddressList = (): UserAddress[] => {
  try {
    const addressList = localStorage.getItem(ADDRESS_LIST_KEY)
    return addressList ? JSON.parse(addressList) : []
  } catch (error) {
    console.error('获取地址列表失败:', error)
    return []
  }
}

// 保存用户地址列表
export const saveUserAddressList = (addressList: UserAddress[]): void => {
  try {
    localStorage.setItem(ADDRESS_LIST_KEY, JSON.stringify(addressList))
  } catch (error) {
    console.error('保存地址列表失败:', error)
  }
}

// 添加新地址
export const addUserAddress = (address: Omit<UserAddress, 'id'>): UserAddress => {
  const addressList = getUserAddressList()
  const newAddress: UserAddress = {
    ...address,
    id: Date.now().toString()
  }
  
  // 如果设置为默认地址，取消其他地址的默认状态
  if (newAddress.selectedAddress) {
    addressList.forEach(addr => {
      addr.selectedAddress = false
    })
  }
  
  addressList.push(newAddress)
  saveUserAddressList(addressList)
  return newAddress
}

// 更新地址
export const updateUserAddress = (id: string | number, updates: Partial<UserAddress>): void => {
  const addressList = getUserAddressList()
  const index = addressList.findIndex(addr => addr.id === id)
  
  if (index !== -1) {
    // 如果设置为默认地址，取消其他地址的默认状态
    if (updates.selectedAddress) {
      addressList.forEach(addr => {
        addr.selectedAddress = false
      })
    }
    
    addressList[index] = { ...addressList[index], ...updates }
    saveUserAddressList(addressList)
  }
}

// 删除地址
export const deleteUserAddress = (id: string | number): void => {
  const addressList = getUserAddressList()
  const filteredList = addressList.filter(addr => addr.id !== id)
  saveUserAddressList(filteredList)
}

// 设置默认地址
export const setDefaultAddress = (id: string | number): void => {
  const addressList = getUserAddressList()
  addressList.forEach(addr => {
    addr.selectedAddress = addr.id === id
  })
  saveUserAddressList(addressList)
}

// 获取默认地址
// 根据ID获取地址
export const getUserAddressById = (id: string | number): UserAddress | null => {
  const addressList = getUserAddressList()
  return addressList.find(addr => addr.id === id) || null
}

// 根据ID获取完整的地址路径
export const getAddressPath = (regionId: string): {
  province?: RegionData
  city?: RegionData
  country?: RegionData
  town?: RegionData
} => {
  const result: {
    province?: RegionData
    city?: RegionData
    country?: RegionData
    town?: RegionData
  } = {}

  // 查找省份
  for (const province of chinaRegionsData.provinces) {
    if (province.id === regionId) {
      result.province = { name: province.name, id: province.id }
      return result
    }

    // 查找城市
    for (const city of province.cities) {
      if (city.id === regionId) {
        result.province = { name: province.name, id: province.id }
        result.city = { name: city.name, id: city.id }
        return result
      }

      // 查找区县
      for (const district of city.districts) {
        if (district.id === regionId) {
          result.province = { name: province.name, id: province.id }
          result.city = { name: city.name, id: city.id }
          result.country = { name: district.name, id: district.id }
          return result
        }
      }
    }
  }

  // 查找街道
  for (const [countryId, towns] of Object.entries(townData)) {
    for (const town of towns) {
      if (town.id === regionId) {
        const addressPath = getAddressPath(countryId)
        result.province = addressPath.province
        result.city = addressPath.city
        result.country = addressPath.country
        result.town = { name: town.name, id: town.id }
        return result
      }
    }
  }

  return result
}
// 初始化默认地址数据（用于演示）
export const initDefaultAddresses = (): void => {
  const existingAddresses = getUserAddressList()
  if (existingAddresses.length === 0) {
    const defaultAddresses: UserAddress[] = [
      {
        id: '1',
        provinceName: '北京市',
        cityName: '北京市',
        countyName: '朝阳区',
        townName: '建国门外街道',
        addressDetail: '国贸大厦A座1001室',
        selectedAddress: true,
        name: '张三',
        phone: '13800138000'
      },
      {
        id: '2',
        provinceName: '广东省',
        cityName: '深圳市',
        countyName: '南山区',
        townName: '',
        addressDetail: '科技园南区深南大道9999号',
        selectedAddress: false,
        name: '李四',
        phone: '13900139000'
      }
    ]
    saveUserAddressList(defaultAddresses)
  }
}
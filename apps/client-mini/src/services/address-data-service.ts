import Taro from '@tarojs/taro'
import { get } from '../utils/request'

export interface RegionNode {
  code: string
  name: string
  pinyin?: string
  children?: RegionNode[]
}


export class AddressDataService {
  /**
   * Helper to load region data dynamically
   */
  private static async getRegionData(): Promise<any> {
    try {
      const data = await import('../data/region.json')
      return data.default || data
    } catch (e) {
      console.error('Failed to load region data:', e)
      return null
    }
  }

  /**
   * Get provinces (prioritize static data)
   */
  static async getProvinces(): Promise<RegionNode[]> {
    try {
      const regionData = await this.getRegionData()
      if (regionData && regionData['000000']) {
        return Object.entries(regionData['000000']).map(([code, data]: [string, any]) => ({
          code,
          name: data.name,
          pinyin: data.pinyin,
        }))
      }
    } catch (e) {
      console.warn('Local region data loading failed, falling back to API')
    }
    // Fallback to API if local data is missing or incomplete
    // Pass '000000' as parentCode explicitly to fetch provinces from API
    return this.getAreas('000000', '1')
  }

  /**
   * Get areas (cities/districts/streets) by parent code
   * Implements mixed data strategy: Static -> Cache -> API
   */
  static async getAreas(parentCode: string, level?: string): Promise<RegionNode[]> {
    if (!parentCode) {
        return []
    }
    
    // 1. Try local static data first (Only for Level 1 & 2)
    try {
      const regionData = await this.getRegionData()
      if (regionData && regionData[parentCode]) {
        return Object.entries(regionData[parentCode]).map(([code, data]: [string, any]) => ({
          code,
          name: data.name,
          pinyin: data.pinyin,
          abbr: data.abbr
        }))
      }
    } catch (e) {}

    // 2. Try Local Storage Cache (For Level 3 & 4)
    const cacheKey = `regions_cache_${parentCode}`
    const cached = Taro.getStorageSync(cacheKey)
    // Only cache if level is provided and is 3 or 4
    if (level && (level === '3' || level === '4') && cached && Date.now() - cached.timestamp < 86400000 * 30) {
      return cached.data
    }
    // 3. Request from Backend API (Level 3 & 4)
    try {
      // Use standard GET request to backend regions API
      const response = await get(`/addresses/regions/${parentCode}`)
      
      // Handle both direct array and object wrapper response formats
      const list = Array.isArray(response) ? response : (response?.data || [])
      
      if (Array.isArray(list) && list.length > 0) {
        const nodes = list.map((item: any) => ({
          code: item.code, // Keep full code length to support street level (9-12 digits)
          name: item.name,
          pinyin: item.pinyin || '',
        }))
        
        // Save to cache
        Taro.setStorage({
          key: cacheKey,
          data: { data: nodes, timestamp: Date.now() }
        })
        
        return nodes
      }
    } catch (e) {
      console.error('API loading failed for regions:', e)
    }

    return []
  }

  /**
   * Get street/town level data (Level 4)
   * Always fetched on-demand via API
   */
  static async getStreets(districtCode: string): Promise<RegionNode[]> {
    return this.getAreas('4', districtCode)
  }

  /**
   * Search areas by keyword (supports name, pinyin, abbr)
   */
  static async searchAreas(keyword: string): Promise<RegionNode[]> {
    if (!keyword) return []
    const lowerKeyword = keyword.toLowerCase()
    const results: RegionNode[] = []
    
    try {
      const regionData = await this.getRegionData()
      if (!regionData) return []
      
      Object.values(regionData).forEach((levelData: any) => {
        if (!levelData || typeof levelData !== 'object') return
        
        Object.entries(levelData).forEach(([code, data]: [string, any]) => {
          if (!data || typeof data !== 'object') return
          
          const name = data.name || ''
          const pinyin = data.pinyin || ''
          const abbr = data.abbr || ''
          
          if (
            name.includes(keyword) || 
            pinyin.toLowerCase().includes(lowerKeyword) || 
            abbr.toLowerCase().includes(lowerKeyword) ||
            code.includes(keyword)
          ) {
            results.push({
              code,
              name,
              pinyin,
            })
          }
        })
      })
    } catch (e) {
      console.error('Local search failed:', e)
    }
    
    return results.slice(0, 20) // Limit results
  }

  /**
   * Preload core provinces to improve UX
   */
  static preloadCoreProvinces() {
    const coreProvinces = ['110000000000', '310000000000', '440000000000', '330000000000'] // Beijing, Shanghai, Guangdong, Zhejiang
    coreProvinces.forEach(code => {
      this.getAreas('2', code) // Preload cities for these provinces
    })
  }
}

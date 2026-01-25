import Taro from '@tarojs/taro'
import { get } from '../utils/request'

export interface RegionNode {
  code: string
  name: string
  pinyin?: string
  abbr?: string
  children?: RegionNode[]
}


export class AddressDataService {
  /**
   * Helper to load region data dynamically
   */
  private static async getRegionData(): Promise<any> {
    try {
      // Use dynamic import to split region.json into its own chunk
      // This ensures it only loads when needed and stays out of the main bundle
      // Note: Taro supports dynamic imports for code splitting
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
          abbr: data.abbr
        }))
      }
    } catch (e) {
      console.warn('Local region data loading failed, falling back to API')
    }
    return this.getAreas('1', '000000')
  }

  /**
   * Get areas (cities/districts/streets) by parent code
   * Implements mixed data strategy: Static -> Cache -> API
   */
  static async getAreas(level: string, parentCode: string): Promise<RegionNode[]> {
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
    if (cached && Date.now() - cached.timestamp < 86400000 * 30) {
      return cached.data
    }

    // 3. Request from Backend API (Level 3 & 4)
    try {
      // Use standard GET request to backend regions API
      const response = await get(`/addresses/regions/${parentCode}`)
      if (response && Array.isArray(response)) {
        const nodes = response.map((item: any) => ({
          code: item.code.substring(0, 6), // Mini program uses 6-digit codes
          name: item.name,
          pinyin: item.pinyin || '',
          abbr: item.abbr || ''
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
              abbr
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
    const coreProvinces = ['110000', '310000', '440000', '330000'] // Beijing, Shanghai, Guangdong, Zhejiang
    coreProvinces.forEach(code => {
      this.getAreas('2', code) // Preload cities for these provinces
    })
  }
}

import { describe, it, expect, vi, beforeEach } from 'vitest'
import Taro from '@tarojs/taro'
import { LocationService } from './location'
import * as requestUtils from '../utils/request'

// Mock Taro
vi.mock('@tarojs/taro', () => ({
  default: {
    getSetting: vi.fn(),
    showModal: vi.fn(),
    openSetting: vi.fn(),
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
    getLocation: vi.fn(),
    setStorage: vi.fn(),
    getStorageSync: vi.fn(),
    chooseLocation: vi.fn(),
  },
}))

// Mock request utility
vi.mock('../utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
}))

describe('LocationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurrentCoordinates', () => {
    it('should return coordinates when permission is granted', async () => {
      const mockCoords = { latitude: 30.123, longitude: 120.456 }
      vi.mocked(Taro.getSetting).mockResolvedValue({
        authSetting: { 'scope.userLocation': true },
      } as any)
      vi.mocked(Taro.getLocation).mockResolvedValue({
        ...mockCoords,
        errMsg: 'ok',
      } as any)

      const result = await LocationService.getCurrentCoordinates()

      expect(result).toEqual(mockCoords)
      expect(Taro.getLocation).toHaveBeenCalledWith(expect.objectContaining({
        type: 'gcj02',
        isHighAccuracy: true,
      }))
    })

    it('should show modal and guide to settings when permission is denied', async () => {
      vi.mocked(Taro.getSetting).mockResolvedValue({
        authSetting: { 'scope.userLocation': false },
      } as any)
      vi.mocked(Taro.showModal).mockResolvedValue({ confirm: true, cancel: false } as any)

      await expect(LocationService.getCurrentCoordinates()).rejects.toThrow('定位权限未开启')
      expect(Taro.showModal).toHaveBeenCalled()
      expect(Taro.openSetting).toHaveBeenCalled()
    })

    it('should fallback to cache when positioning fails', async () => {
      const cachedCoords = { latitude: 31.0, longitude: 121.0 }
      vi.mocked(Taro.getSetting).mockResolvedValue({
        authSetting: { 'scope.userLocation': true },
      } as any)
      vi.mocked(Taro.getLocation).mockRejectedValue(new Error('GPS Error'))
      vi.mocked(Taro.getStorageSync).mockReturnValue({
        coordinates: cachedCoords,
        timestamp: Date.now(),
      })

      const result = await LocationService.getCurrentCoordinates()

      expect(result).toEqual(cachedCoords)
    })
  })

  describe('reverseGeocode', () => {
    it('should call reverse-geocode API and return location info', async () => {
      const mockInfo = { province: 'Zhejiang', city: 'Hangzhou', district: 'Xihu', name: 'Alibaba' }
      vi.mocked(requestUtils.get).mockResolvedValue(mockInfo)

      const result = await LocationService.reverseGeocode({ latitude: 30, longitude: 120 })

      expect(result).toEqual(mockInfo)
      expect(requestUtils.get).toHaveBeenCalledWith('/api/location/reverse-geocode', { lat: 30, lng: 120 })
    })
  })

  describe('chooseLocation', () => {
    it('should return address from Taro.chooseLocation', async () => {
      const mockRes = { name: 'Park', address: 'Street 1', latitude: 30, longitude: 120 }
      vi.mocked(Taro.chooseLocation).mockResolvedValue(mockRes as any)

      const result = await LocationService.chooseLocation()

      expect(result).toEqual({
        detailedAddress: 'Park',
        coordinates: {
          latitude: 30,
          longitude: 120
        }
      })
      expect(Taro.chooseLocation).toHaveBeenCalledWith({})
    })

    it('should pass initial coordinates to Taro.chooseLocation', async () => {
      const initialCoords = { latitude: 31, longitude: 121 }
      const mockRes = { name: 'Office', address: 'Street 2', latitude: 31.5, longitude: 121.5 }
      vi.mocked(Taro.chooseLocation).mockResolvedValue(mockRes as any)

      const result = await LocationService.chooseLocation(initialCoords)

      expect(result.coordinates).toEqual({ latitude: 31.5, longitude: 121.5 })
      expect(Taro.chooseLocation).toHaveBeenCalledWith({
        latitude: 31,
        longitude: 121
      })
    })

    it('should handle cancel', async () => {
      vi.mocked(Taro.chooseLocation).mockRejectedValue({ errMsg: 'chooseLocation:fail cancel' })

      await expect(LocationService.chooseLocation()).rejects.toThrow('CANCELED')
    })
  })
})

import { useState, useCallback, useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'
import { AddressService } from '@/services/address'
import { Address } from '@/types/order'

interface UseAddressesProps {
  addresses: Address[]
  setAddresses: (addresses: Address[]) => void
}

export const useAddresses = ({ addresses, setAddresses }: UseAddressesProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)
  // Use ref to track if a fetch has been initiated to prevent duplicate requests in strict mode
  const fetchInitiatedRef = useRef(false)

  const loadAddresses = useCallback(async (force = false) => {
    // Avoid duplicate loading
    if (fetchInitiatedRef.current && !force) return
    
    // If we already have addresses and not forcing reload, just return
    if (addresses.length > 0 && !force) {
        setHasFetched(true)
        return
    }

    try {
      setIsLoading(true)
      fetchInitiatedRef.current = true
      
      const response = await AddressService.getUserAddresses()
      
      if (response.success && response.data) {
        setAddresses(response.data)
      } else {
        throw new Error(response.message || '获取地址失败')
      }
    } catch (error) {
      console.error('Failed to load addresses:', error)
      Taro.showToast({
        title: '获取地址列表失败',
        icon: 'none'
      })
      // Reset ref on error to allow retrying
      fetchInitiatedRef.current = false
    } finally {
      setIsLoading(false)
      setHasFetched(true)
    }
  }, [addresses.length, setAddresses])

  // Initial load
  useEffect(() => {
    if (addresses.length === 0 && !fetchInitiatedRef.current) {
      loadAddresses()
    } else if (addresses.length > 0 && !hasFetched) {
        // If data exists in store but local state doesn't know yet
        setHasFetched(true)
        fetchInitiatedRef.current = true
    }
  }, [addresses.length, hasFetched, loadAddresses])

  return {
    isLoading,
    hasFetched,
    loadAddresses
  }
}

import { useEffect } from 'react'
import Taro from '@tarojs/taro'

export default function Order() {
  useEffect(() => {
    // 直接跳转到订单列表页面
    Taro.redirectTo({
      url: '/pages/order/list/index'
    })
  }, [])

  return null
}
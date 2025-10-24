import { View, Text, ScrollView, Picker } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import accountService from '../../../services/account'
import type { Transaction } from '../../../types/account'
import AuthGuard from '../../../components/AuthGuard'
import './index.scss'
import { ArrowDown, Minus, Plus, Received } from '@nutui/icons-react-taro'

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [timeFilter, setTimeFilter] = useState(0) // 0: 全部, 1: 本月, 2: 近3个月

  const timeRanges = ['全部', '本月', '近3个月']

  const getTimeRange = (filterIndex: number) => {
    const now = new Date()
    switch (filterIndex) {
      case 1: // 本月
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        return {
          startDate: startOfMonth.toISOString(),
          endDate: now.toISOString(),
        }
      case 2: // 近3个月
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        return {
          startDate: threeMonthsAgo.toISOString(),
          endDate: now.toISOString(),
        }
      default:
        return {}
    }
  }

  const loadTransactions = async (pageNum: number = 1, append: boolean = false) => {
    if (loading) return

    try {
      setLoading(true)
      const timeRange = getTimeRange(timeFilter)
      const { transactions: data, total: totalCount } = await accountService.getMyTransactions({
        ...timeRange,
        page: pageNum,
        limit: 20,
      })

      if (append) {
        setTransactions([...transactions, ...data])
      } else {
        setTransactions(data)
      }

      setHasMore((append ? transactions.length : 0) + data.length < totalCount)
    } catch (error) {
      Taro.showToast({
        title: '加载失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    loadTransactions(1)
  }, [timeFilter])

  usePullDownRefresh(() => {
    setPage(1)
    loadTransactions(1).finally(() => {
      Taro.stopPullDownRefresh()
    })
  })

  useReachBottom(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      loadTransactions(nextPage, true)
    }
  })

  const handleTimeFilterChange = (e) => {
    setTimeFilter(e.detail.value)
  }

  const handleOrderClick = (orderId: string) => {
    if (orderId) {
      Taro.navigateTo({
        url: `/pages/order/detail?id=${orderId}`,
      })
    }
  }

  const getTransactionIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      ORDER_INCOME: Plus, // 订单收入
      WITHDRAWAL_FREEZE: Minus, // 提现冻结
      WITHDRAWAL_SUCCESS: Minus, // 提现成功
      WITHDRAWAL_FAILED: Minus, // 提现失败
      WITHDRAWAL_UNFREEZE: Plus, // 提现解冻
      REFUND: Minus, // 退款
    }
    return iconMap[type] || ArrowDown
  }

  return (
    <AuthGuard>
      <View className="transaction-list-page">
        {/* Time Filter */}
        <View className="filter-section">
          <Picker mode="selector" range={timeRanges} value={timeFilter} onChange={handleTimeFilterChange}>
            <View className="filter-picker">
              <Text className="filter-text">{timeRanges[timeFilter]}</Text>
              <ArrowDown />
            </View>
          </Picker>
        </View>

        {transactions.length === 0 && !loading ? (
          <View className="empty-state">
            <Text className="empty-text">暂无交易记录</Text>
          </View>
        ) : (
          <ScrollView className="transaction-list" scrollY>
            {transactions.map((transaction) => {
              const IconComponent = getTransactionIcon(transaction.type)
              return (
                <View
                  key={transaction.id}
                  className="transaction-item"
                  onClick={() => transaction.orderId && handleOrderClick(transaction.orderId)}
                >
                  <View className="item-left">
                    <View className={`item-icon icon-${accountService.getTransactionTypeColor(transaction.type)}`}>
                      <IconComponent />
                    </View>
                    <View className="item-info">
                      <Text className="item-title">
                        {accountService.getTransactionTypeText(transaction.type)}
                      </Text>
                      <Text className="item-time">
                        {new Date(transaction.createdAt).toLocaleString('zh-CN')}
                      </Text>
                      {transaction.orderId && (
                        <Text className="item-order">订单号：{transaction.orderId}</Text>
                      )}
                    </View>
                  </View>
                  <View className="item-right">
                    <Text className={`item-amount amount-${accountService.getTransactionTypeColor(transaction.type)}`}>
                      {accountService.getTransactionAmountSign(transaction.type)}
                      {accountService.formatAmount(transaction.amount)}
                    </Text>
                  </View>
                </View>
              )
            })}
            {loading && (
              <View className="loading-more">
                <Text>加载中...</Text>
              </View>
            )}
            {!hasMore && transactions.length > 0 && (
              <View className="no-more">
                <Text>没有更多了</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </AuthGuard>
  )
}

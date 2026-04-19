import { View, Text, ScrollView, Picker } from '@tarojs/components'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import accountService from '@/services/account'
import type { Transaction } from '@/types/account'
import AuthGuard from '@/components/AuthGuard'
import { Icon } from '@/components/Icon'
import './index.scss'

export default function TransactionList() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [timeFilter, setTimeFilter] = useState(0)
  const [typeFilter, setTypeFilter] = useState('all')
  const [showFilter, setShowFilter] = useState(false)
  const [pendingTypeFilter, setPendingTypeFilter] = useState('all')
  
  // Use ref to track transactions for loadTransactions to avoid dependency cycle
  const transactionsRef = useRef(transactions)
  useEffect(() => {
      transactionsRef.current = transactions
  }, [transactions])

  const timeRanges = ['全部', '本月', '近3个月']
  const typeOptions = [
    { key: 'all', label: '全部' },
    { key: 'income', label: '收入' },
    { key: 'withdrawal', label: '提现' },
    { key: 'refund', label: '退款' },
  ]

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

  const loadTransactions = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (loading || !user) return

    try {
      setLoading(true)
      const timeRange = getTimeRange(timeFilter)
      const { transactions: data, total: totalCount } = await accountService.getMyTransactions({
        ...timeRange,
        page: pageNum,
        limit: 20,
      })
      const safeData = Array.isArray(data) ? data : []

      if (append) {
        setTransactions(prev => [...prev, ...safeData])
      } else {
        setTransactions(safeData)
      }

      setHasMore((append ? transactionsRef.current.length : 0) + safeData.length < totalCount)
    } catch (error) {
      Taro.showToast({
        title: '加载失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }, [loading, user, timeFilter])

  useEffect(() => {
    setPage(1)
    loadTransactions(1)
  }, [timeFilter, loadTransactions])

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

  const handleTimeFilterChange = (e: any) => {
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
    const iconMap: Record<string, string> = {
      ORDER_INCOME: 'plus', // 订单收入
      WITHDRAWAL_FREEZE: 'minus', // 提现冻结
      WITHDRAWAL_SUCCESS: 'minus', // 提现成功
      WITHDRAWAL_FAILED: 'minus', // 提现失败
      WITHDRAWAL_UNFREEZE: 'plus', // 提现解冻
      REFUND: 'minus', // 退款
    }
    return iconMap[type] || 'arrow-down'
  }

  const getTransactionCategory = (type: string) => {
    if (type.startsWith('WITHDRAWAL')) return 'withdrawal'
    if (type === 'REFUND') return 'refund'
    if (type === 'ORDER_INCOME' || type === 'WITHDRAWAL_UNFREEZE') return 'income'
    return accountService.getTransactionAmountSign(type) === '+' ? 'income' : 'expense'
  }

  const filteredTransactions = useMemo(() => {
    const source = Array.isArray(transactions) ? transactions : []
    if (typeFilter === 'all') return source
    return source.filter((transaction) => getTransactionCategory(transaction.type) === typeFilter)
  }, [transactions, typeFilter])

  const summary = useMemo(() => {
    const totalIncome = filteredTransactions.reduce((sum, transaction) => {
      return accountService.getTransactionAmountSign(transaction.type) === '+' ? sum + transaction.amount : sum
    }, 0)
    const totalExpense = filteredTransactions.reduce((sum, transaction) => {
      return accountService.getTransactionAmountSign(transaction.type) === '-' ? sum + transaction.amount : sum
    }, 0)
    return {
      totalIncome,
      totalExpense,
      count: filteredTransactions.length,
    }
  }, [filteredTransactions])

  return (
    <AuthGuard>
      <View className="transaction-list-page">
        <View className="page-header">
          <View className="header-content">
            <View className="back-btn" onClick={() => Taro.navigateBack()}>
              <Text>返回</Text>
            </View>
            <Text className="header-title">交易记录</Text>
            <View
              className="filter-btn"
              onClick={() => {
                setPendingTypeFilter(typeFilter)
                setShowFilter(true)
              }}
            >
              <Text>筛选</Text>
            </View>
          </View>
        </View>

        <View className="filter-section">
          <Picker mode="selector" range={timeRanges} value={timeFilter} onChange={handleTimeFilterChange}>
            <View className="filter-picker">
              <Text className="filter-text">{timeRanges[timeFilter]}</Text>
              <Icon name="arrow-down" size={24} style={{ color: '#4CAF50' }} /> 
            </View>
          </Picker>
        </View>

        <View className="stats-section">
          <View className="stats-card">
            <View className="stats-header">
              <Text className="stats-title">本期概览</Text>
              <Text className="stats-period">{timeRanges[timeFilter]}</Text>
            </View>
            <View className="stats-grid">
              <View className="stats-item">
                <Text className="stats-value">{accountService.formatAmount(summary.totalIncome)}</Text>
                <Text className="stats-label">收入</Text>
              </View>
              <View className="stats-item">
                <Text className="stats-value">{accountService.formatAmount(summary.totalExpense)}</Text>
                <Text className="stats-label">支出</Text>
              </View>
              <View className="stats-item">
                <Text className="stats-value">{summary.count}</Text>
                <Text className="stats-label">笔数</Text>
              </View>
              <View className="stats-item">
                <Text className="stats-value">
                  {accountService.formatAmount(summary.totalIncome - summary.totalExpense)}
                </Text>
                <Text className="stats-label">净额</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="transaction-list">
          <View className="list-header">
            <Text className="list-title">交易明细</Text>
            <Text className="list-count">{filteredTransactions.length} 笔</Text>
          </View>
          {filteredTransactions.length === 0 && !loading ? (
            <View className="empty-state">
              <Text className="empty-title">暂无交易记录</Text>
              <Text className="empty-desc">完成一次回收或提现后，这里会展示所有资金流水</Text>
            </View>
          ) : (
            <ScrollView className="list-scroll" scrollY>
              {filteredTransactions.map((transaction) => {
                const iconName = getTransactionIcon(transaction.type)
                return (
                  <View
                    key={transaction.id}
                    className="transaction-item"
                    onClick={() => transaction.orderId && handleOrderClick(transaction.orderId)}
                  >
                    <View className="item-content">
                      <View className="item-left">
                        <View className={`item-icon icon-${accountService.getTransactionTypeColor(transaction.type)}`}>
                          <Icon name={iconName} />
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
                  </View>
                )
              })}
              {loading && (
                <View className="loading-more">
                  <Text>加载中...</Text>
                </View>
              )}
              {!hasMore && filteredTransactions.length > 0 && (
                <View className="no-more">
                  <Text>没有更多了</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {showFilter && (
          <View className="filter-modal" onClick={() => setShowFilter(false)}>
            <View className="modal-content" onClick={(e) => e.stopPropagation()}>
              <View className="modal-header">
                <View className="cancel-btn" onClick={() => setShowFilter(false)}>
                  <Text>取消</Text>
                </View>
                <Text className="modal-title">筛选</Text>
                <View
                  className="confirm-btn"
                  onClick={() => {
                    setTypeFilter(pendingTypeFilter)
                    setShowFilter(false)
                  }}
                >
                  <Text>完成</Text>
                </View>
              </View>
              <View className="filter-options">
                <View className="filter-group">
                  <Text className="group-title">交易类型</Text>
                  <View className="option-list">
                    {typeOptions.map((option) => (
                      <View
                        key={option.key}
                        className={`option-item ${pendingTypeFilter === option.key ? 'selected' : ''}`}
                        onClick={() => setPendingTypeFilter(option.key)}
                      >
                        <Text className="option-text">{option.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </AuthGuard>
  )
}

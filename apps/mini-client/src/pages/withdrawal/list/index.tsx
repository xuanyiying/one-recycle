import { useState, useEffect, useCallback, useRef } from 'react'
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { Button, Tag } from '@nutui/nutui-react-taro'
import { useAuth } from '@/hooks/useAuth'
import withdrawalService from '@/services/withdrawal'
import { WithdrawalStatus } from '@/types/withdrawal'
import type { Withdrawal } from '@/types/withdrawal'
import AuthGuard from '@/components/AuthGuard'
import './index.scss'

export default function WithdrawalList() {
    const { user } = useAuth()
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
    
    // Use ref to track withdrawals for loadWithdrawals to avoid dependency cycle
    const withdrawalsRef = useRef(withdrawals)
    useEffect(() => {
        withdrawalsRef.current = withdrawals
    }, [withdrawals])

    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    const loadWithdrawals = useCallback(async (pageNum: number = 1, append: boolean = false) => {
        if (loading || !user) return

        try {
            setLoading(true)
            const { withdrawals: data, total: totalCount } = await withdrawalService.getMyWithdrawals({
                page: pageNum,
                limit: 20,
            })

            if (append) {
                setWithdrawals(prev => [...prev, ...data])
            } else {
                setWithdrawals(data)
            }

            setHasMore((append ? withdrawalsRef.current.length : 0) + data.length < totalCount)
        } catch (error) {
            Taro.showToast({
                title: '加载失败',
                icon: 'none',
            })
        } finally {
            setLoading(false)
        }
    }, [loading, user])

    useEffect(() => {
        loadWithdrawals(1)
    }, [loadWithdrawals])

    usePullDownRefresh(() => {
        setPage(1)
        loadWithdrawals(1).finally(() => {
            Taro.stopPullDownRefresh()
        })
    })

    useReachBottom(() => {
        if (hasMore && !loading) {
            const nextPage = page + 1
            setPage(nextPage)
            loadWithdrawals(nextPage, true)
        }
    })

    const handleItemClick = (id: string) => {
        Taro.navigateTo({
            url: `/pages/withdrawal/detail?id=${id}`,
        })
    }

    const getStatusColor = (status: WithdrawalStatus): 'warning' | 'primary' | 'success' | 'danger' | 'default' => {
        const colorMap: Record<WithdrawalStatus, 'warning' | 'primary' | 'success' | 'danger'> = {
            [WithdrawalStatus.PENDING]: 'warning',
            [WithdrawalStatus.PROCESSING]: 'primary',
            [WithdrawalStatus.SUCCESS]: 'success',
            [WithdrawalStatus.FAILED]: 'danger',
            [WithdrawalStatus.REJECTED]: 'danger',
        }
        return colorMap[status] || 'default'
    }

    return (
        <AuthGuard>
            <View className="withdrawal-list-page">
                <View className="page-header">
                    <View className="header-content">
                        <View className="back-btn" onClick={() => Taro.navigateBack()}>
                            <Text>返回</Text>
                        </View>
                        <Text className="header-title">提现记录</Text>
                        <View className="header-count">
                            <Text>{withdrawals.length} 笔</Text>
                        </View>
                    </View>
                </View>

                {withdrawals.length === 0 && !loading ? (
                    <View className="empty-state">
                        <Text className="empty-title">暂无提现记录</Text>
                        <Text className="empty-text">当你发起提现后，记录会展示在这里</Text>
                    </View>
                ) : (
                    <ScrollView className="withdrawal-list" scrollY>
                        {withdrawals.map((withdrawal) => (
                            <Button
                              key={withdrawal.id}
                              className="withdrawal-item"
                              block
                              onClick={() => handleItemClick(withdrawal.id)}
                            >
                                <View className="item-header">
                                    <Text className="item-amount">
                                        {withdrawalService.formatAmount(withdrawal.amount)}
                                    </Text>
                                    <Tag color={getStatusColor(withdrawal.status)}>
                                        {withdrawalService.getStatusText(withdrawal.status)}
                                    </Tag>
                                </View>
                                <View className="item-info">
                                    <Text className="info-text">
                                        {withdrawalService.getProviderText(withdrawal.provider)}
                                    </Text>
                                    <Text className="info-text">
                                        {withdrawalService.formatDate(withdrawal.createdAt)}
                                    </Text>
                                </View>
                                {withdrawal.rejectedReason && (
                                    <View className="item-reason">
                                        <Text className="reason-text">拒绝原因：{withdrawal.rejectedReason}</Text>
                                    </View>
                                )}
                            </Button>
                        ))}
                        {loading && (
                            <View className="loading-more">
                                <Text>加载中...</Text>
                            </View>
                        )}
                        {!hasMore && withdrawals.length > 0 && (
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
 

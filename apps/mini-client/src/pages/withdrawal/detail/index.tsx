import { useState, useEffect, useCallback } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Tag } from '@nutui/nutui-react-taro'
import { useAuth } from '@/hooks/useAuth'
import withdrawalService from '@/services/withdrawal'
import { WithdrawalStatus, type Withdrawal } from '@/types/withdrawal'
import AuthGuard from '@/components/AuthGuard'
import './index.scss'

export default function WithdrawalDetail() {
    const router = useRouter()
    const { id } = router.params
    const { user } = useAuth()
    const [withdrawal, setWithdrawal] = useState<Withdrawal | null>(null)
    const [loading, setLoading] = useState(true)

    const loadWithdrawal = useCallback(async (withdrawalId: string) => {
        try {
            setLoading(true)
            const data = await withdrawalService.getWithdrawal(withdrawalId)
            setWithdrawal(data)
        } catch (error) {
            Taro.showToast({
                title: '加载失败',
                icon: 'none',
            })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (id && user) {
            loadWithdrawal(id)
        }
    }, [id, user, loadWithdrawal])

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

    if (loading) {
        return (
            <View className="withdrawal-detail-page">
                <View className="state-card">
                    <Text className="state-text">加载中...</Text>
                </View>
            </View>
        )
    }

    if (!withdrawal) {
        return (
            <View className="withdrawal-detail-page">
                <View className="state-card">
                    <Text className="state-text">提现记录不存在</Text>
                </View>
            </View>
        )
    }

    return (
        <AuthGuard>
            <View className="withdrawal-detail-page">
                <View className="page-header">
                    <View className="header-content">
                        <View className="back-btn" onClick={() => Taro.navigateBack()}>
                            <Text>返回</Text>
                        </View>
                        <Text className="header-title">提现详情</Text>
                        <View className="header-placeholder" />
                    </View>
                </View>

                <View className="status-card">
                    <Tag color={getStatusColor(withdrawal.status)}>
                        {withdrawalService.getStatusText(withdrawal.status)}
                    </Tag>
                    <Text className="amount">
                        {withdrawalService.formatAmount(withdrawal.amount)}
                    </Text>
                </View>

                <View className="detail-section">
                    <View className="detail-item">
                        <Text className="detail-label">提现方式</Text>
                        <Text className="detail-value">{withdrawalService.getProviderText(withdrawal.provider)}</Text>
                    </View>
                    <View className="detail-item">
                        <Text className="detail-label">申请时间</Text>
                        <Text className="detail-value">{withdrawalService.formatDate(withdrawal.createdAt)}</Text>
                    </View>
                    {withdrawal.processedAt && (
                        <View className="detail-item">
                            <Text className="detail-label">处理时间</Text>
                            <Text className="detail-value">{withdrawalService.formatDate(withdrawal.processedAt)}</Text>
                        </View>
                    )}
                    {withdrawal.transactionId && (
                        <View className="detail-item">
                            <Text className="detail-label">交易单号</Text>
                            <Text className="detail-value">{withdrawal.transactionId}</Text>
                        </View>
                    )}
                    <View className="detail-item">
                        <Text className="detail-label">提现单号</Text>
                        <Text className="detail-value">{withdrawal.outTradeNo}</Text>
                    </View>
                    {withdrawal.rejectedReason && (
                        <View className="detail-item">
                            <Text className="detail-label">拒绝原因</Text>
                            <Text className="detail-value">{withdrawal.rejectedReason}</Text>
                        </View>
                    )}
                </View>
            </View>
        </AuthGuard>
    )
}

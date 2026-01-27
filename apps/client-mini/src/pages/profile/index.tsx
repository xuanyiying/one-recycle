import { useState, useEffect, useCallback, useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'

import { IconFont, Order, Location, Warning, ArrowRight, Service, Setting } from '@nutui/icons-react-taro'
import { useAuth } from '@/hooks/useAuth'
import accountService from '@/services/account'
import type { Account } from '@/types/account'
import AuthGuard from '@/components/AuthGuard'
import './index.scss'
import { Avatar } from '@nutui/nutui-react-taro'
import { getUserById } from '@/services'
import defaultAvatar from '@/assets/icons/default-avatar.png'

interface AccountStats {
    totalOrders: number
    totalAmount: number
    savedCarbon: number
}

interface LoadingState {
    isLoading: boolean
    error: string | null
    retryCount: number
}

export default function Profile(): JSX.Element {
    const { user, updateUser, logout } = useAuth()
    
    const [stats, setStats] = useState<AccountStats>({
        totalOrders: 0,
        totalAmount: 0,
        savedCarbon: 0
    })
    const [account, setAccount] = useState<Account | null>(null)
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        error: null,
        retryCount: 0
    })

    // Memoized computed values for performance optimization
    const formattedStats = useMemo(() => ({
        totalOrders: stats.totalOrders,
        totalAmount: stats.totalAmount.toFixed(2),
        savedCarbon: stats.savedCarbon.toFixed(1),
        availableBalance: account ? accountService.formatAmount(account.availableBalance) : '¥0.00'
    }), [stats.totalOrders, stats.totalAmount, stats.savedCarbon, account?.availableBalance])

    const hasError = loadingState.error !== null
    const isLoading = loadingState.isLoading
    const canRetry = loadingState.retryCount < 3

    const loadUserProfile = useCallback(async (isRetry = false) => {
        try {
            setLoadingState(prev => ({
                ...prev,
                isLoading: true,
                error: null,
                retryCount: isRetry ? prev.retryCount + 1 : 0
            }))

            if (!user?.id) {
                setLoadingState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: '用户未登录'
                }))
                return
            }

            // 并行请求优化性能
            const [userInfoResult, accountData, statsData] = await Promise.allSettled([
                getUserById(user.id),
                accountService.getMyAccount(),
                accountService.getMyStats()
            ])

            // 处理用户信息
            if (userInfoResult.status === 'fulfilled' && userInfoResult.value.success && userInfoResult.value.data) {
                const freshUserData = userInfoResult.value.data
                // 更新全局状态，保持数据一致性
                updateUser(freshUserData)
            } else {
                console.warn('获取用户信息失败:', userInfoResult.status === 'rejected' ? userInfoResult.reason : '数据格式错误')
            }

            // 处理账户信息
            if (accountData.status === 'fulfilled') {
                setAccount(accountData.value)
            } else {
                console.warn('获取账户信息失败:', accountData.reason)
            }

            // 处理统计信息
            if (statsData.status === 'fulfilled') {
                const totalOrders = statsData.value.totalOrders || 0
                const totalAmount = statsData.value.totalIncome || 0
                setStats({
                    totalOrders,
                    totalAmount,
                    savedCarbon: totalAmount * 0.02 // 假设每元收益减碳0.02kg
                })
            } else {
                console.warn('获取统计信息失败:', statsData.reason)
            }

            setLoadingState(prev => ({
                ...prev,
                isLoading: false,
                error: null
            }))

        } catch (error) {
            console.error('加载用户资料失败:', error)
            const errorMessage = error instanceof Error ? error.message : '网络连接失败，请检查网络后重试'

            setLoadingState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage
            }))
        }
    }, [user?.id, updateUser])


    // 重试加载函数
    const retryLoad = useCallback(() => {
        if (canRetry) {
            loadUserProfile(true)
        } else {
            Taro.showToast({
                title: '重试次数过多，请稍后再试',
                icon: 'none'
            })
        }
    }, [loadUserProfile, canRetry])

    // 下拉刷新 - 使用原生Taro实现
    usePullDownRefresh(useCallback(() => {
        loadUserProfile().finally(() => {
            Taro.stopPullDownRefresh()
        })
    }, [loadUserProfile]))

    useEffect(() => {
        loadUserProfile()
    }, [loadUserProfile])

    const onEditProfile = useCallback(() => {
        Taro.navigateTo({
            url: '/pages/profile/edit/index'
        })
    }, [])

    const onAddressManage = useCallback(() => {
        Taro.navigateTo({
            url: '/pages/address/index'
        })
    }, [])

    const onContactService = useCallback(() => {
        console.log('联系客服')
    }, [])

    const onSettings = useCallback(() => {
        Taro.navigateTo({
            url: '/pages/settings/index'
        })
    }, [])

    const handleViewOrders = useCallback(() => {
        Taro.navigateTo({
            url: '/pages/order/index'
        })
    }, [])

    const handleViewBalance = useCallback(() => {
        if (!account) {
            Taro.showToast({
                title: '账户信息加载中',
                icon: 'none'
            })
            return
        }

        try {
            Taro.showModal({
                title: '账户余额',
                content: `可用余额：${accountService.formatAmount(account.availableBalance)}\n冻结余额：${accountService.formatAmount(account.frozenBalance)}\n累计收益：${accountService.formatAmount(account.totalIncome)}\n累计提现：${accountService.formatAmount(account.totalWithdrawal)}`,
                showCancel: false,
                confirmText: '确定'
            })
        } catch (error) {
            console.error('显示余额详情失败:', error)
            Taro.showToast({
                title: '操作失败',
                icon: 'none'
            })
        }
    }, [account])

    const handleWithdraw = useCallback(() => {
        Taro.navigateTo({
            url: '/pages/withdrawal/index'
        })
    }, [])

    const handleTransactions = useCallback(() => {
        Taro.navigateTo({
            url: '/pages/transaction/list'
        })
    }, [])

    const handleLogout = useCallback(() => {
        Taro.showModal({
            title: '确认退出',
            content: '确定要退出登录吗？',
            confirmText: '退出',
            confirmColor: '#FF3B30', // iOS 红色用于破坏性操作
            cancelText: '取消',
            cancelColor: '#007AFF', // iOS 蓝色
            success: async (res) => {
                if (res.confirm) {
                    try {
                        await logout()
                        Taro.reLaunch({
                            url: '/pages/login/index'
                        })
                    } catch (error) {
                        console.error('退出登录失败:', error)
                        Taro.showToast({
                            title: '退出失败，请重试',
                            icon: 'none',
                            duration: 2000
                        })
                    }
                }
            },
            fail: (error) => {
                console.error('显示退出确认弹窗失败:', error)
                Taro.showToast({
                    title: '操作失败',
                    icon: 'none'
                })
            }
        })
    }, [logout])

    // iOS标准加载状态组件
    const LoadingComponent = useMemo(() => (
        <View className='profile-page'>
            <View className='loading-container'>
                <IconFont className='loading-spinner' name='loading' size='24' color='var(--ios-blue)'></IconFont>
                <Text className='loading-text'>加载中...</Text>
            </View>
        </View>
    ), [])

    // 错误状态组件
    const ErrorComponent = useMemo(() => (
        <View className='profile-page'>
            <View className='error-container'>
                <IconFont name='refresh' size='48' color='#B0BEC5'></IconFont>
                <Text className='error-title'>加载失败</Text>
                <Text className='error-message'>{loadingState.error}</Text>
                {canRetry && (
                    <View className='retry-btn' onClick={retryLoad}>
                        <Text>点击重试</Text>
                    </View>
                )}
            </View>
        </View>
    ), [loadingState.error, canRetry, retryLoad, loadingState.retryCount])

    if (isLoading) {
        return LoadingComponent
    }

    if (hasError) {
        return ErrorComponent
    }

    return (
        <AuthGuard>
            <View className='profile-page'>
                {/* 顶部沉浸式背景 */}
                <View className='profile-bg' />

                {/* 用户信息区域 - 开放式布局 */}
                <View className='user-header'>
                    <View className='user-info' onClick={onEditProfile}>
                        <View className='avatar-ring'>
                            <Avatar
                                className='user-avatar'
                                src={user?.avatar || defaultAvatar}
                                shape='round'
                            />
                        </View>
                        <View className='user-text'>
                            <Text className='user-nickname'>{user?.nickname || '点击登录'}</Text>
                            <Text className='user-phone'>{user?.phone || '登录后查看更多信息'}</Text>
                        </View>
                    </View>
                    <View className='settings-btn' onClick={onSettings}>
                        <Setting name='setting' size='20' color='#282727ff' />
                    </View>
                </View>

                {/* 悬浮统计卡片 */}
                <View className='stats-card'>
                    <View className='stats-row'>
                        <View className='stat-item' onClick={handleViewOrders}>
                            <Text className='stat-num'>{formattedStats.totalOrders}</Text>
                            <Text className='stat-label'>全部订单</Text>
                        </View>
                        <View className='divider' />
                        <View className='stat-item' onClick={handleViewBalance}>
                            <Text className='stat-num'>
                                <Text className='symbol'>¥</Text>
                                {formattedStats.totalAmount}
                            </Text>
                            <Text className='stat-label'>累计收益</Text>
                        </View>
                        <View className='divider' />
                        <View className='stat-item'>
                            <Text className='stat-num carbon'>{formattedStats.savedCarbon}</Text>
                            <Text className='stat-label'>减碳(kg)</Text>
                        </View>
                    </View>
                </View>

                {/* 账户余额卡片 */}
                {account && (
                    <View className='balance-card'>
                        <View className='card-header'>
                            <Text className='title'>我的钱包</Text>
                            <Text className='detail-link' onClick={handleTransactions}>交易明细 ›</Text>
                        </View>
                        <View className='balance-content'>
                            <View className='balance-main'>
                                <Text className='label'>可用余额</Text>
                                <Text className='amount'>{accountService.formatAmount(account.availableBalance)}</Text>
                            </View>
                            <View className='withdraw-btn' onClick={handleWithdraw}>
                                <Text>去提现</Text>
                            </View>
                        </View>
                        {account.frozenBalance > 0 && (
                            <View className='frozen-tip'>
                                <Warning name='warning' size='12' color='#FF9800' />
                                <Text className='tip-text'>冻结中：{accountService.formatAmount(account.frozenBalance)}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* 功能菜单列表 - 圆角分组 */}
                <View className='menu-group'>
                    <View className='menu-item' onClick={onAddressManage}>
                        <View className='left'>
                            <View className='icon-box blue'>
                                <Location size='18' color='#2979FF' />
                            </View>
                            <Text className='label'>地址管理</Text>
                        </View>
                        <ArrowRight name='rect-right' size='14' color='#B0BEC5' />
                    </View>

                    <View className='menu-item' onClick={handleTransactions}>
                        <View className='left'>
                            <View className='icon-box purple'>
                                <Order name='order' size='18' color='#6C5CE7' />
                            </View>
                            <Text className='label'>交易明细</Text>
                        </View>
                        <ArrowRight name='rect-right' size='14' color='#B0BEC5' />
                    </View>

                    <View className='menu-item' onClick={onContactService}>
                        <View className='left'>
                            <View className='icon-box green'>
                                <Service name='service' size='18' color='#00C853' />
                            </View>
                            <Text className='label'>联系客服</Text>
                        </View>
                        <ArrowRight name='rect-right' size='14' color='#B0BEC5' />
                    </View>
                    <View className='menu-item' onClick={handleLogout}>
                        <View className='left'>
                            <View className='icon-box red'>
                                <IconFont name='logout' size={18} color='#FF3D00' />
                            </View>
                            <Text className='label'>退出登录</Text>
                        </View>
                        <ArrowRight name='rect-right' size='14' color='#B0BEC5' />
                    </View>
                    
                </View>
            </View>
        </AuthGuard>
    )
}

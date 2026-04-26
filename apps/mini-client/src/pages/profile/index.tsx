import logger from '@/utils/logger'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro'

import { Icon } from '@/components/Icon'
import { useAuth } from '@/hooks/useAuth'
import { useSafeArea } from '@/hooks/useSafeArea'
import accountService from '@/services/account'
import { getUserById } from '@/services'
import type { Account } from '@/types/account'
import AuthGuard from '@/components/AuthGuard'
import { Avatar } from '@nutui/nutui-react-taro'
import './index.scss'

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
    const { top: safeAreaTop } = useSafeArea()

    // 使用 Ref 跟踪最新的 user 状态，用于数据对比
    const userRef = useRef(user)
    useEffect(() => {
        userRef.current = user
    }, [user])

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
        totalAmount: Number(stats.totalAmount || 0).toFixed(2),
        savedCarbon: Number(stats.savedCarbon || 0).toFixed(1),
        availableBalance: account ? accountService.formatAmount(account.availableBalance) : '¥0.00'
    }), [stats.totalOrders, stats.totalAmount, stats.savedCarbon, account])

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

            // 串行请求避免账户创建并发冲突
            const userInfoResult = await getUserById(user.id)

            if (userInfoResult.success && userInfoResult.data) {
                const freshUserData = userInfoResult.data
                const currentUser = userRef.current
                if (!currentUser || JSON.stringify(freshUserData) !== JSON.stringify(currentUser)) {
                    updateUser(freshUserData)
                }
            } else {
                logger.warn('获取用户信息失败')
            }

            try {
                const accountData = await accountService.getMyAccount()
                setAccount(accountData)
            } catch (error) {
                logger.warn('获取账户信息失败:', error)
            }

            try {
                const statsData = await accountService.getMyStats()
                const totalOrders = statsData.totalOrders || 0
                const totalAmount = Number(statsData.totalIncome || 0)
                setStats({
                    totalOrders,
                    totalAmount,
                    savedCarbon: totalAmount * 0.02
                })
            } catch (error) {
                logger.warn('获取统计信息失败:', error)
            }

            setLoadingState(prev => ({
                ...prev,
                isLoading: false,
                error: null
            }))

        } catch (error) {
            logger.error('加载用户资料失败:', error)
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

    // 页面显示时刷新数据（包含首次加载和返回页面）
    useDidShow(() => {
        loadUserProfile()
    })

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
        Taro.navigateTo({
            url: '/pages/customer/index'
        })
    }, [])

    const onSettings = useCallback(() => {
        Taro.navigateTo({
            url: '/pages/settings/index'
        })
    }, [])

    const handleViewOrders = useCallback(() => {
        Taro.switchTab({
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
            logger.error('显示余额详情失败:', error)
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
            url: '/pages/transaction/list/index'
        })
    }, [])

    const handleReferral = useCallback(() => {
        Taro.navigateTo({
            url: '/pages/referral/index'
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
                        logger.error('退出登录失败:', error)
                        Taro.showToast({
                            title: '退出失败，请重试',
                            icon: 'none',
                            duration: 2000
                        })
                    }
                }
            },
            fail: (error) => {
                logger.error('显示退出确认弹窗失败:', error)
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
                <Icon className='loading-spinner' name='loading' size='24' color='#1E7A3E' />
                <Text className='loading-text'>加载中...</Text>
            </View>
        </View>
    ), [])

    // 错误状态组件
    const ErrorComponent = useMemo(() => (
        <View className='profile-page'>
            <View className='error-container'>
                <Icon name='refresh' size='48' color='#B0BEC5' />
                <Text className='error-title'>加载失败</Text>
                <Text className='error-message'>{loadingState.error}</Text>
                {canRetry && (
                    <View className='retry-btn' onClick={retryLoad}>
                        <Text>点击重试</Text>
                    </View>
                )}
            </View>
        </View>
    ), [loadingState.error, canRetry, retryLoad])

    return (
        <AuthGuard showLoginPrompt>
            {isLoading ? (
                LoadingComponent
            ) : hasError ? (
                ErrorComponent
            ) : (
                <View className='profile-page'>
                    {/* 顶部沉浸式背景 */}
                    <View className='profile-bg' />

                    {/* 用户信息区域 - 白色卡片悬浮 */}
                    <View
                        className='user-header'
                        style={{
                            paddingTop: safeAreaTop ? `calc(${safeAreaTop}px + 60rpx)` : undefined
                        }}
                    >
                        <View className='user-card' onClick={onEditProfile}>
                            <View className='avatar-wrapper'>
                                <View className='avatar-ring'>
                                    <Avatar
                                        className='user-avatar'
                                        src={user?.avatarUrl}
                                        shape='round'
                                    />
                                </View>
                                <View className='online-indicator' />
                            </View>
                            <View className='user-info'>
                                <View className='name-row'>
                                    <Text className='nickname'>{user?.nickname || '微信用户'}</Text>
                                    <View className='edit-badge'>
                                        <Text>编辑</Text>
                                    </View>
                                </View>
                                <Text className='mobile'>{user?.mobile || '暂无手机号'}</Text>
                            </View>
                            <Icon name='arrow-right' className='arrow-icon' />
                        </View>
                    </View>

                    {/* 核心数据卡片 - 玻璃拟态风格 */}
                    <View className='stats-card'>
                        <View className='stats-item' onClick={handleViewOrders}>
                            <View className='stats-icon orders'>
                                <Icon name='order' size={24} />
                            </View>
                            <Text className='stats-num'>{formattedStats.totalOrders}</Text>
                            <Text className='stats-label'>累计回收</Text>
                        </View>
                        <View className='stats-divider' />
                        <View className='stats-item' onClick={handleViewBalance}>
                            <View className='stats-icon income'>
                                <Icon name='money' size={24} />
                            </View>
                            <Text className='stats-num'>{formattedStats.totalAmount}</Text>
                            <Text className='stats-label'>累计收益</Text>
                        </View>
                        <View className='stats-divider' />
                        <View className='stats-item'>
                            <View className='stats-icon carbon'>
                                <Icon name='leaf' size={24} />
                            </View>
                            <Text className='stats-num'>{formattedStats.savedCarbon}</Text>
                            <Text className='stats-label'>累计减碳</Text>
                        </View>
                    </View>

                    {/* 功能菜单区域 */}
                    <View className='menu-section'>
                        <View className='menu-item' onClick={handleViewOrders}>
                            <View className='menu-icon-wrapper blue'>
                                <Icon name='order' className='menu-icon' />
                            </View>
                            <Text className='menu-text'>我的订单</Text>
                            <Icon name='arrow-right' className='menu-arrow' />
                        </View>

                        <View className='menu-item' onClick={onAddressManage}>
                            <View className='menu-icon-wrapper green'>
                                <Icon name='location' className='menu-icon' />
                            </View>
                            <Text className='menu-text'>地址管理</Text>
                            <Icon name='arrow-right' className='menu-arrow' />
                        </View>

                        <View className='menu-item' onClick={handleWithdraw}>
                            <View className='menu-icon-wrapper orange'>
                                <Icon name='withdraw' className='menu-icon' />
                            </View>
                            <Text className='menu-text'>余额提现</Text>
                            <View className='menu-extra'>
                                <Text className='balance-text'>{formattedStats.availableBalance}</Text>
                                <Icon name='arrow-right' className='menu-arrow' />
                            </View>
                        </View>

                        <View className='menu-item' onClick={handleTransactions}>
                            <View className='menu-icon-wrapper purple'>
                                <Icon name='transaction' className='menu-icon' />
                            </View>
                            <Text className='menu-text'>交易记录</Text>
                            <Icon name='arrow-right' className='menu-arrow' />
                        </View>

                        <View className='menu-item' onClick={handleReferral}>
                            <View className='menu-icon-wrapper green'>
                                <Icon name='share' className='menu-icon' />
                            </View>
                            <Text className='menu-text'>邀请好友</Text>
                            <Icon name='arrow-right' className='menu-arrow' />
                        </View>
                    </View>

                    <View className='menu-section'>
                        <View className='menu-item' onClick={onContactService}>
                            <View className='menu-icon-wrapper cyan'>
                                <Icon name='service' className='menu-icon' />
                            </View>
                            <Text className='menu-text'>联系客服</Text>
                            <Icon name='arrow-right' className='menu-arrow' />
                        </View>

                        <View className='menu-item' onClick={onSettings}>
                            <View className='menu-icon-wrapper gray'>
                                <Icon name='settings-gear' className='menu-icon' />
                            </View>
                            <Text className='menu-text'>系统设置</Text>
                            <Icon name='arrow-right' className='menu-arrow' />
                        </View>
                    </View>

                    {/* 退出登录按钮 */}
                    <View className='logout-btn' onClick={handleLogout}>
                        <Text>退出登录</Text>
                    </View>
                </View>
            )}
        </AuthGuard>
    )
}

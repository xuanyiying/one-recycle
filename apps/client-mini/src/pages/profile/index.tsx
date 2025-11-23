import { useState, useEffect, useCallback, useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'

import { IconFont } from '@nutui/icons-react-taro'
import { useAppContext } from '@/store'
import { getUserInfo } from '@/services/user'
import accountService from '@/services/account'
import type { Account } from '@/types/account'
import AuthGuard from '@/components/AuthGuard'
import { useResponsive } from '@/hooks/useResponsive'
import './index.scss'
import { Avatar } from '@nutui/nutui-react-taro'

// TypeScript interfaces for component state
interface UserInfo {
    avatarUrl: string
    nickName: string
    mobile: string
}

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
    const [userInfo, setUserInfo] = useState<UserInfo>({
        avatarUrl: '',
        nickName: '',
        mobile: ''
    })
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

    const { state, dispatch } = useAppContext()
    const screenSize = useResponsive()

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

            if (!state.user?.id) {
                setLoadingState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: '用户未登录'
                }))
                return
            }

            // 并行请求优化性能
            const [userInfoResult, accountData, statsData] = await Promise.allSettled([
                getUserInfo(state.user.id),
                accountService.getMyAccount(),
                accountService.getMyStats()
            ])

            // 处理用户信息
            if (userInfoResult.status === 'fulfilled' && userInfoResult.value.success && userInfoResult.value.data) {
                setUserInfo({
                    avatarUrl: userInfoResult.value.data.avatar || '',
                    nickName: userInfoResult.value.data.nickname || '未设置昵称',
                    mobile: userInfoResult.value.data.phone || '未绑定手机'
                })
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

            // 只在非重试情况下显示错误提示
            if (!isRetry) {
                Taro.showToast({
                    title: '加载失败',
                    icon: 'none',
                    duration: 2000
                })
            }
        }
    }, [state.user?.id])

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
            success: (res) => {
                if (res.confirm) {
                    try {
                        dispatch({ type: 'LOGOUT' })
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
    }, [dispatch])

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
                <IconFont name='warning' size='48' color='var(--ios-gray)'></IconFont>
                <Text className='error-title'>加载失败</Text>
                <Text className='error-message'>{loadingState.error}</Text>
                {canRetry && (
                    <View className='error-actions'>
                        <View className='ios-button-primary retry-btn' onClick={retryLoad}>
                            <Text>重试 ({3 - loadingState.retryCount})</Text>
                        </View>
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
                {/* 用户信息卡片 */}
                <View className={`user-section ${screenSize.screenType}`}>
                    <View className='user-info'>
                        <View className='user-avatar-container' onClick={onEditProfile}>
                            <Avatar
                                className='user-avatar'
                                src={userInfo.avatarUrl || ''}
                                shape='round'
                            />
                        </View>
                        <View className='user-details'>
                            <Text className='user-nickname'>{userInfo.nickName || '未设置昵称'}</Text>
                            <Text className='user-phone'>{userInfo.mobile || '未绑定手机'}</Text>
                        </View>
                    </View>
                </View>

                {/* 统计信息 */}
                <View className={`user-section ${screenSize.screenType}`}>
                    <View className='stats-section'>
                        <View className='stats-grid'>
                            <View className='stat-item stat-orders' onClick={handleViewOrders}>
                                <IconFont name='file' size='24' color='white'></IconFont>
                                <Text className='stat-value'>{formattedStats.totalOrders}</Text>
                                <Text className='stat-label'>累计订单</Text>
                            </View>
                            <View className='stat-item stat-earnings' onClick={handleViewBalance}>
                                <IconFont name='money' size='24' color='white'></IconFont>
                                <Text className='stat-value'>¥{formattedStats.totalAmount}</Text>
                                <Text className='stat-label'>累计收益</Text>
                            </View>
                            <View className='stat-item stat-carbon'>
                                <IconFont name='cloud' size='24' color='white'></IconFont>
                                <Text className='stat-value'>{formattedStats.savedCarbon}kg</Text>
                                <Text className='stat-label'>减碳贡献</Text>
                            </View>
                            <View className='stat-item stat-balance' onClick={handleViewBalance}>
                                <IconFont name='wallet' size='24' color='white'></IconFont>
                                <Text className='stat-value'>{formattedStats.availableBalance}</Text>
                                <Text className='stat-label'>可用余额</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 账户余额和操作 */}
                {account && (
                    <View className={`balance-section ${screenSize.screenType}`}>
                        <View className='balance-header'>
                            <Text className='balance-title'>账户余额</Text>
                            <IconFont name='wallet' size='24' color='white'></IconFont>
                        </View>
                        <Text className='balance-amount'>
                            {accountService.formatAmount(account.availableBalance)}
                        </Text>
                        <Text className='balance-desc'>可用余额</Text>
                        <View className='balance-actions'>
                            <View className='balance-btn' onClick={handleWithdraw}>
                                <Text>提现</Text>
                            </View>
                            <View className='balance-btn' onClick={handleTransactions}>
                                <Text>交易明细</Text>
                            </View>
                        </View>
                        {account.frozenBalance > 0 && (
                            <View className='frozen-warning'>
                                <IconFont name='warning' size='16' color='#FF9500'></IconFont>
                                <Text className='frozen-text'>
                                    冻结余额：{accountService.formatAmount(account.frozenBalance)}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* 功能菜单 */}
                <View className={`menu-section ${screenSize.screenType}`}>
                    <View className='menu-item' onClick={onAddressManage}>
                        <View className='menu-content'>
                            <View className='menu-icon'>
                                <IconFont name='location' size='18' color='var(--ios-tertiary-label)'></IconFont>
                            </View>
                            <Text className='menu-title'>地址管理</Text>
                        </View>
                        <Text className='menu-arrow'>›</Text>
                    </View>

                    <View className='menu-item' onClick={onContactService}>
                        <View className='menu-content'>
                            <View className='menu-icon'>
                                <IconFont name='phone' size='18' color='var(--ios-tertiary-label)'></IconFont>
                            </View>
                            <Text className='menu-title'>联系客服</Text>
                        </View>
                        <Text className='menu-arrow'>›</Text>
                    </View>

                    <View className='menu-item' onClick={onSettings}>
                        <View className='menu-content'>
                            <View className='menu-icon'>
                                <IconFont name='settings' size='18' color='var(--ios-tertiary-label)'></IconFont>
                            </View>
                            <Text className='menu-title'>设置</Text>
                        </View>
                        <Text className='menu-arrow'>›</Text>
                    </View>
                </View>

                {/* 退出登录 */}
                <View className={`logout-section ${screenSize.screenType}`}>
                    <View className='logout-btn' onClick={handleLogout}>
                        <Text>退出登录</Text>
                    </View>
                </View>
            </View>
        </AuthGuard>
    )
}
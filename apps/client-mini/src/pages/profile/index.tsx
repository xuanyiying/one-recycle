import { useState, useEffect, useCallback } from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import { Icon } from '@taroify/icons'
import { Divider } from '@taroify/core'
import { useAppContext } from '../../store'
import { getUserOrders } from '../../services/order'
import { getUserInfo } from '../../services/user'
import accountService from '../../services/account'
import { Order } from '../../types'
import type { Account } from '../../types/account'
import AuthGuard from '../../components/AuthGuard'
import './index.scss'

interface UserInfo {
    avatarUrl: string
    nickName: string
    mobile: string
}

interface Stats {
    totalOrders: number
    totalAmount: number
    savedCarbon: number
}

export default function Profile() {
    const [userInfo, setUserInfo] = useState<UserInfo>({
        avatarUrl: '',
        nickName: '',
        mobile: ''
    })
    const [stats, setStats] = useState<Stats>({
        totalOrders: 0,
        totalAmount: 0,
        savedCarbon: 0
    })
    const [orders, setOrders] = useState<Order[]>([])
    const [account, setAccount] = useState<Account | null>(null)
    const [loading, setLoading] = useState(true)
    const [showOrderList, setShowOrderList] = useState(false)
    
    const { state, dispatch } = useAppContext()

    const loadUserProfile = useCallback(async () => {
        try {
            setLoading(true)
            if (state.user?.id) {
                // 获取用户信息
                const userInfoResult = await getUserInfo(state.user.id)
                
                // 获取账户信息（新的积分账户）
                const accountData = await accountService.getMyAccount()
                
                // 获取账户统计
                const statsData = await accountService.getMyStats()
                
                // 获取订单列表
                const ordersResult = await getUserOrders(state.user.id)
                
                // 获取订单统计数据（基于实际订单计算）
                let totalOrders = statsData.totalOrders || 0
                let totalAmount = statsData.totalIncome || 0
                if (ordersResult.success && ordersResult.data) {
                    setOrders(ordersResult.data.items)
                }

                if (userInfoResult.success && userInfoResult.data) {
                    setUserInfo({
                        avatarUrl: userInfoResult.data.avatar || '',
                        nickName: userInfoResult.data.nickname || '未设置昵称',
                        mobile: userInfoResult.data.phone || '未绑定手机'
                    })
                }

                setAccount(accountData)

                setStats({
                    totalOrders,
                    totalAmount,
                    savedCarbon: totalAmount * 0.02 // 假设每元收益减碳0.02kg
                })
                
                setLoading(false)
            } else {
                setLoading(false)
            }
        } catch (error) {
            console.error('加载用户资料失败:', error)
            Taro.showToast({
                title: '加载失败',
                icon: 'none'
            })
            setLoading(false)
        }
    }, [state.user?.id])

    // 下拉刷新
    usePullDownRefresh(() => {
        loadUserProfile().finally(() => {
            Taro.stopPullDownRefresh()
        })
    })

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

    const onInvoiceManage = useCallback(() => {
        console.log('发票管理')
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
        setShowOrderList(true)
    }, [])

    const handleViewBalance = useCallback(() => {
        if (!account) return
        Taro.showModal({
            title: '账户余额',
            content: `可用余额：${accountService.formatAmount(account.availableBalance)}\n冻结余额：${accountService.formatAmount(account.frozenBalance)}\n累计收益：${accountService.formatAmount(account.totalIncome)}\n累计提现：${accountService.formatAmount(account.totalWithdrawal)}`,
            showCancel: false,
            confirmText: '确定'
        })
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
            success: (res) => {
                if (res.confirm) {
                    dispatch({ type: 'LOGOUT' })
                    Taro.reLaunch({
                        url: '/pages/login/index'
                    })
                }
            }
        })
    }, [dispatch])

    if (loading) {
        return (
            <View className='profile-page'>
                <Text>加载中...</Text>
            </View>
        )
    }

    return (
        <AuthGuard>
            <View className='profile-page'>
            {/* 用户信息卡片 */}
            <View className='user-section'>
                <View className='user-info'>
                    <Image
                        className='user-avatar'
                        src={userInfo.avatarUrl || 'https://example.com/avatar.jpg'}
                        mode='aspectFill'
                    />
                    <View className='user-details'>
                        <Text className='user-nickname'>{userInfo.nickName}</Text>
                        <Text className='user-level'>普通用户</Text>
                        <Text className='user-phone'>{userInfo.mobile}</Text>
                    </View>
                    <Button
                        className='edit-btn'
                        size='mini'
                        onClick={onEditProfile}
                    >
                        编辑
                    </Button>
                </View>
            </View>

            {/* 统计信息 */}
            <View className='user-section'>
                <View className='stats-section'>
                    <View className='stats-grid'>
                        <View className='stat-item' onClick={handleViewOrders}>
                            <Icon name='file' size='24' color='#00B894'></Icon>
                            <Text className='stat-value'>{stats.totalOrders}</Text>
                            <Text className='stat-label'>累计订单</Text>
                        </View>
                        <View className='stat-item' onClick={handleViewBalance}>
                            <Icon name='money' size='24' color='#00B894'></Icon>
                            <Text className='stat-value'>¥{stats.totalAmount.toFixed(2)}</Text>
                            <Text className='stat-label'>累计收益</Text>
                        </View>
                        <View className='stat-item'>
                            <Icon name='cloud' size='24' color='#00B894'></Icon>
                            <Text className='stat-value'>{stats.savedCarbon.toFixed(1)}kg</Text>
                            <Text className='stat-label'>减碳贡献</Text>
                        </View>
                        <View className='stat-item' onClick={handleViewBalance}>
                            <Icon name='wallet' size='24' color='#00B894'></Icon>
                            <Text className='stat-value'>
                                {account ? accountService.formatAmount(account.availableBalance) : '¥0.00'}
                            </Text>
                            <Text className='stat-label'>可用余额</Text>
                        </View>
                    </View>
                    {/* 余额操作按钮 */}
                    {account && (
                        <View className='balance-actions'>
                            <Button className='action-btn' size='mini' onClick={handleWithdraw}>
                                提现
                            </Button>
                            <Button className='action-btn' size='mini' onClick={handleTransactions}>
                                明细
                            </Button>
                        </View>
                    )}
                    {account && account.frozenBalance > 0 && (
                        <View className='frozen-tip'>
                            <Text className='frozen-text'>
                                冻结金额：{accountService.formatAmount(account.frozenBalance)}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* 订单列表弹窗 */}
            {showOrderList && (
                <View className='order-list-modal'>
                    <View className='modal-header'>
                        <Text className='modal-title'>我的订单</Text>
                        <Button 
                            className='close-btn' 
                            size='mini'
                            onClick={() => setShowOrderList(false)}
                        >
                            关闭
                        </Button>
                    </View>
                    <View className='order-list'>
                        {orders.map(order => (
                            <View key={order.id} className='order-item'>
                                <View className='order-header'>
                                    <Text className='order-number'>{order.id}</Text>
                                    <Text className={`order-status status-${order.status}`}>
                                        {order.statusText}
                                    </Text>
                                </View>
                                <Text className='order-desc'>{order.categoryName} - {order.items.join(', ')}</Text>
                                <View className='order-footer'>
                                    <Text className='order-time'>{order.createTime}</Text>
                                    <Text className='order-price'>
                                        ¥{(order.actualPrice || order.estimatedPrice).toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        ))}
                        {orders.length === 0 && (
                            <View className='empty-orders'>
                                <Text>暂无订单</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}
            <Divider/>
            {/* 功能菜单 */}
            <View className='menu-section'>
                <View className='menu-item' onClick={onAddressManage}>
                    <View className='menu-content'>
                        <Icon name='location' size='18' color='#636e72' className='menu-icon'></Icon>
                        <Text className='menu-title'>收货地址</Text>
                    </View>
                    <Text className='menu-arrow'>›</Text>
                </View>

                <View className='menu-item' onClick={onInvoiceManage}>
                    <View className='menu-content'>
                        <Icon name='credit-card' size='18' color='#636e72' className='menu-icon'></Icon>
                        <Text className='menu-title'>发票管理</Text>
                    </View>
                    <Text className='menu-arrow'>›</Text>
                </View>

                <View className='menu-item' onClick={onContactService}>
                    <View className='menu-content'>
                        <Icon name='phone' size='18' color='#636e72' className='menu-icon'></Icon>
                        <Text className='menu-title'>联系客服</Text>
                    </View>
                    <Text className='menu-arrow'>›</Text>
                </View>

                <View className='menu-item' onClick={onSettings}>
                    <View className='menu-content'>
                        <Icon name='settings' size='18' color='#636e72' className='menu-icon'></Icon>
                        <Text className='menu-title'>设置</Text>
                    </View>
                    <Text className='menu-arrow'>›</Text>
                </View>
            </View>

            {/* 退出登录 */}
            <View className='logout-section'>
                <Button className='logout-btn' onClick={handleLogout}>
                    退出登录
                </Button>
            </View>
        </View>
        </AuthGuard>
    )
}
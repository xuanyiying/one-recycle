import { useState, useEffect, useCallback } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Icon } from '@taroify/icons'
import { useAppContext } from '../../store'
import { getUserAddresses, deleteAddress } from '../../services/user'
import AuthGuard from '../../components/AuthGuard'
import './index.scss'

interface UserAddress {
    id: number
    consignee: string
    mobile: string
    province: string
    city: string
    district: string
    detail: string
    isDefault: boolean
}

const AddressPage = () => {
    const { state } = useAppContext()
    const [addresses, setAddresses] = useState<UserAddress[]>([])
    const [loading, setLoading] = useState(true)

    const loadUserAddresses = useCallback(async () => {
        try {
            if (state.user?.id) {
                const addresses = await getUserAddresses(state.user.id)
                setAddresses(addresses.map(addr => ({
                    ...addr,
                    id: addr.id || 0
                })))
                setLoading(false)
            }
        } catch (error) {
            console.error('获取地址失败:', error)
            setLoading(false)
        }
    }, [state.user?.id])

    useEffect(() => {
        loadUserAddresses()
    }, [loadUserAddresses])

    const onAddAddress = useCallback(() => {
        Taro.navigateTo({
            url: '/pages/address/form/index'
        })
    }, [])

    const onEditAddress = useCallback((id: number) => {
        Taro.navigateTo({
            url: `/pages/address/form/index?id=${id}`
        })
    }, [])

    const onDeleteAddress = useCallback((id: number) => {
        Taro.showModal({
            title: '提示',
            content: '确定要删除这个地址吗？',
            success: async (res) => {
                if (res.confirm) {
                    try {
                        await deleteAddress(id)
                        const updatedAddresses = addresses.filter(addr => addr.id !== id)
                        setAddresses(updatedAddresses)

                        Taro.showToast({
                            title: '删除成功',
                            icon: 'success'
                        })
                    } catch (error) {
                        console.error('删除地址失败:', error)
                        Taro.showToast({
                            title: '删除失败',
                            icon: 'none'
                        })
                    }
                }
            }
        })
    }, [addresses])

    const setDefaultAddress = useCallback(async (id: number) => {
        try {
            // 这里应该调用API设置默认地址
            // 暂时只更新本地状态
            const updatedAddresses = addresses.map(addr => ({
                ...addr,
                isDefault: addr.id === id
            }))
            setAddresses(updatedAddresses)

            Taro.showToast({
                title: '设置成功',
                icon: 'success'
            })
        } catch (error) {
            console.error('设置默认地址失败:', error)
            Taro.showToast({
                title: '设置失败',
                icon: 'none'
            })
        }
    }, [addresses])

    // Render address item component
    const renderAddressItem = useCallback((address: UserAddress) => (
        <View className='address-item' key={address.id}>
            {address.isDefault && (
                <View className='default-tag'>
                    <Icon name='check-circle' size='12' color='#00B894'></Icon>
                    <Text style={{ marginLeft: '2px' }}>默认</Text>
                </View>
            )}
            <View className='address-info'>
                <View className='address-header'>
                    <Text className='consignee'>
                        <Icon name='user' size='14' color='#636e72'></Icon>
                        <Text style={{ marginLeft: '4px' }}>{address.consignee}</Text>
                    </Text>
                    <Text className='mobile'>
                        <Icon name='phone' size='14' color='#636e72'></Icon>
                        <Text style={{ marginLeft: '4px' }}>{address.mobile}</Text>
                    </Text>
                </View>
                <Text className='address-detail'>
                    <Icon name='location' size='14' color='#636e72'></Icon>
                    <Text style={{ marginLeft: '4px' }}>
                        {address.province}{address.city}{address.district}{address.detail}
                    </Text>
                </Text>
            </View>
            <View className='address-actions'>
                {!address.isDefault && (
                    <Button
                        className='action-btn'
                        size='mini'
                        onClick={() => setDefaultAddress(address.id)}
                    >
                        设为默认
                    </Button>
                )}
                <Button
                    className='action-btn'
                    size='mini'
                    onClick={() => onEditAddress(address.id)}
                >
                    编辑
                </Button>
                <Button
                    className='action-btn delete-btn'
                    size='mini'
                    onClick={() => onDeleteAddress(address.id)}
                >
                    删除
                </Button>
            </View>
        </View>
    ), [setDefaultAddress, onEditAddress, onDeleteAddress]);

    if (loading) {
        return (
            <AuthGuard>
                <View className='address-page'>
                    <Text>加载中...</Text>
                </View>
            </AuthGuard>
        )
    }

    return (
        <AuthGuard>
            <View className='address-page'>
            <View className='address-list'>
                {addresses.map(address => renderAddressItem(address))}
            </View>

            <Button className='add-address-btn' onClick={onAddAddress}>
                <Icon name='plus' size='18' color='#fff'></Icon>
                <Text style={{ marginLeft: '4px' }}>新增地址</Text>
            </Button>
            </View>
        </AuthGuard>
    )
}

export default AddressPage
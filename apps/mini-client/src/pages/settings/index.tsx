import { logger } from '@/utils/logger'
import { useState, useCallback } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { Icon } from '@/components/Icon'
import AuthGuard from '@/components/AuthGuard'
import logoIcon from '../../assets/icons/logo.jpg'
import './index.scss'

interface SettingItem {
    id: string
    title: string
    description?: string
    type: 'switch' | 'navigate'
    value?: boolean
}

const Settings = () => {
    const [settings, setSettings] = useState<SettingItem[]>([
        {
            id: 'notifications',
            title: '消息通知',
            description: '接收订单状态更新通知',
            type: 'switch',
            value: true
        },
        {
            id: 'location',
            title: '位置信息',
            description: '用于优化上门回收服务',
            type: 'switch',
            value: true
        },
        {
            id: 'privacy',
            title: '隐私设置',
            type: 'navigate'
        },
        {
            id: 'about',
            title: '关于我们',
            type: 'navigate'
        },
        {
            id: 'feedback',
            title: '意见反馈',
            type: 'navigate'
        }
    ])

    const onSwitchChange = useCallback((id: string, checked: boolean) => {
        setSettings(prevSettings => 
            prevSettings.map(setting =>
                setting.id === id ? { ...setting, value: checked } : setting
            )
        )
    }, [])

    const onNavigate = useCallback((id: string) => {
        logger.log('导航到:', id)
        // 根据 id 跳转到不同的页面
    }, [])

    const clearCache = useCallback(() => {
        logger.log('清除缓存')
    }, [])


    const preferenceSettings = settings.filter(setting => setting.type === 'switch')
    const infoSettings = settings.filter(setting => setting.type === 'navigate')

    return (
        <AuthGuard>
            <View className='settings-page'>
                <View className='settings-header'>
                    <Text className='header-title'>设置</Text>
                </View>
                
                <View className='settings-section'>
                <View className='section-header'>
                    <Text>偏好设置</Text>
                </View>
                <View className='settings-group'>
                    {preferenceSettings.map(setting => (
                        <View
                          className='setting-item'
                          key={setting.id}
                        >
                            <View className='setting-content'>
                                <View className={`setting-icon ${setting.id}`}>
                                    <Icon name={setting.id} size='18' color='#fff' />
                                </View>
                                <View className='setting-info'>
                                    <Text className='setting-title'>{setting.title}</Text>
                                    {setting.description && (
                                        <Text className='setting-description'>{setting.description}</Text>
                                    )}
                                </View>
                                <View
                                  className={`setting-switch ${setting.value ? 'on' : ''}`}
                                  onClick={() => onSwitchChange(setting.id, !setting.value)}
                                >
                                    <View className='switch-thumb' />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            <View className='settings-section'>
                <View className='section-header'>
                    <Text>服务与关于</Text>
                </View>
                <View className='settings-group'>
                    {infoSettings.map(setting => (
                        <View
                          className='setting-item'
                          key={setting.id}
                          onClick={() => onNavigate(setting.id)}
                        >
                            <View className='setting-content'>
                                <View className={`setting-icon ${setting.id}`}>
                                    <Icon name={setting.id} size='18' color='#fff' />
                                </View>
                                <View className='setting-info'>
                                    <Text className='setting-title'>{setting.title}</Text>
                                </View>
                                <Text className='arrow'>›</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            <View className='danger-section'>
                <View className='danger-item' onClick={clearCache}>
                    <View className='danger-content'>
                        <Icon name='trash' size='20' color='#FF3B30' />
                        <Text className='danger-text'>清除缓存</Text>
                    </View>
                </View>
            </View>

            <View className='version-section'>
                <Image className='app-logo' src={logoIcon} mode='aspectFill' />
                <Text className='app-name'>爱回收</Text>
                <Text className='version-text'>版本号 1.0.0</Text>
                <Text className='build-text'>为地球降温，从一次回收开始</Text>
            </View>
        </View>
        </AuthGuard>
    )
}

export default Settings

import { useState, useCallback } from 'react'
import { View, Text, Switch } from '@tarojs/components'
import './index.scss'
import { IconFont } from '@nutui/icons-react-taro'

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
        const updatedSettings = settings.map(setting =>
            setting.id === id ? { ...setting, value: checked } : setting
        )
        setSettings(updatedSettings)
    }, [settings])

    const onNavigate = useCallback((id: string) => {
        console.log('导航到:', id)
        // 根据 id 跳转到不同的页面
    }, [])

    const clearCache = useCallback(() => {
        console.log('清除缓存')
    }, [])


    return (
        <View className='settings-page'>
            <View className='settings-section'>
                {settings.map(setting => (
                    <View
                        className='setting-item'
                        key={setting.id}
                        onClick={() => setting.type === 'navigate' && onNavigate(setting.id)}
                    >
                        <View className='setting-info'>
                            <Text className='setting-title'>
                                <IconFont name={setting.id} size='18' color='#636e72'></IconFont>
                                <Text style={{ marginLeft: '8px' }}>{setting.title}</Text>
                            </Text>
                            {setting.description && (
                                <Text className='setting-description'>{setting.description}</Text>
                            )}
                        </View>

                        {setting.type === 'switch' ? (
                            <Switch
                                checked={setting.value}
                                onChange={(e) => onSwitchChange(setting.id, e.detail.value)}
                            />
                        ) : (
                            <Text className='arrow'>›</Text>
                        )}
                    </View>
                ))}
            </View>

            <View className='settings-section'>
                <View className='setting-item' onClick={clearCache}>
                    <View className='setting-info'>
                        <Text className='setting-title'>
                            <IconFont name='trash' size='18' color='#636e72'></IconFont>
                            <Text style={{ marginLeft: '8px' }}>清除缓存</Text>
                        </Text>
                    </View>
                    <Text className='arrow'>›</Text>
                </View>
            </View>

            <View className='version-section'>
                <Text className='version-text'>版本号: 1.0.0</Text>
            </View>
        </View>
    )
}

export default Settings
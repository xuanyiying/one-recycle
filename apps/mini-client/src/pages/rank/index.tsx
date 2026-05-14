import { logger } from '@/utils/logger'
import { useState, useEffect, useCallback } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import { getRankings, getMyRank, RankingItem } from '@/services/system'
import { ApiResponse } from '@/types'
import { Storage } from '@/utils/storage'
import './index.scss'

export default function Rank() {
    const [activeTab, setActiveTab] = useState<'total' | 'week' | 'month'>('week')
    const [list, setList] = useState<RankingItem[]>([])
    const [myRank, setMyRank] = useState<RankingItem | null>(null)
    const [loading, setLoading] = useState(false)

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            // Load rankings list (public)
            try {
                const listRes = await getRankings(activeTab) as unknown as ApiResponse<RankingItem[]>
                if (listRes.success) {
                    setList(listRes.data || [])
                }
            } catch (err) {
                logger.error('Failed to load rankings:', err)
            }

            // Load my rank (protected) - only if logged in
            const token = Storage.getToken()
            if (token) {
                try {
                    const myRankRes = await getMyRank(activeTab) as unknown as ApiResponse<RankingItem>
                    if (myRankRes.success) {
                        setMyRank(myRankRes.data || null)
                    }
                } catch (err) {
                    logger.error('Failed to load my rank:', err)
                    setMyRank(null)
                }
            } else {
                setMyRank(null)
            }
        } finally {
            setLoading(false)
        }
    }, [activeTab])

    useEffect(() => {
        loadData()
    }, [loadData])

    usePullDownRefresh(async () => {
        await loadData()
        Taro.stopPullDownRefresh()
    })

    if (loading && list.length === 0) {
        return (
            <View className='rank-page'>
                <View className='header-bg'>
                    <Text className='title'>环保英雄榜</Text>
                </View>
                <View className='rank-container'>
                    <View className='rank-list' style={{ padding: '40rpx', textAlign: 'center', color: '#999' }}>
                        加载中...
                    </View>
                </View>
            </View>
        )
    }

    return (
        <View className='rank-page'>
            <View className='header-bg'>
                <Text className='title'>环保英雄榜</Text>
                <Text className='subtitle'>每一点绿色行为都值得被铭记</Text>
            </View>

            <View className='rank-container'>
                <View className='tabs'>
                    {[
                        { key: 'week', label: '周榜' },
                        { key: 'month', label: '月榜' },
                        { key: 'total', label: '总榜' }
                    ].map(tab => (
                        <View
                            key={tab.key}
                            className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key as any)}
                        >
                            {tab.label}
                        </View>
                    ))}
                </View>

                <View className='rank-list'>
                    {list.map((item) => (
                        <View key={item.userId} className='rank-item'>
                            <View className={`rank-num top-${item.rank}`}>
                                {item.rank}
                            </View>
                            <Image className='avatar' src={item.avatar} />
                            <View className='info'>
                                <Text className='nickname'>{item.nickname}</Text>
                                <Text className={`trend ${item.trend}`}>
                                    {item.trend === 'up' ? '▲ 排名上升' : item.trend === 'down' ? '▼ 排名下降' : '- 排名持平'}
                                </Text>
                            </View>
                            <View className='score'>
                                <Text className='value'>{item.score}</Text>
                                <Text className='label'>环保积分</Text>
                            </View>
                        </View>
                    ))}
                    {list.length === 0 && (
                        <View style={{ padding: '60rpx', textAlign: 'center', color: '#999' }}>
                            暂无排名数据
                        </View>
                    )}
                </View>
            </View>

            {myRank && (
                <View className='my-rank-bar'>
                    <View className='rank-item'>
                        <View className='rank-num'>
                            {myRank.rank > 99 ? '99+' : myRank.rank}
                        </View>
                        <Image className='avatar' src={myRank.avatar} />
                        <View className='info'>
                            <Text className='nickname'>我 ({myRank.nickname})</Text>
                            <Text className='desc'>继续加油，守护地球！</Text>
                        </View>
                        <View className='score'>
                            <Text className='value'>{myRank.score}</Text>
                            <Text className='label'>分</Text>
                        </View>
                    </View>
                </View>
            )}
        </View>
    )
}

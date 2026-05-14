import { logger } from '@/utils/logger'
import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { getQAList } from '@/services/system'
import './index.scss'

interface FAQ {
  question: string
  answer: string
}

export default function PointsRules() {
  const [rules, setRules] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    setLoading(true)
    try {
      const res = await getQAList() as any
      if (res.data?.length > 0) {
        const pointRules = res.data.filter((item: any) =>
          item.question?.includes('积分')
        )
        if (pointRules.length > 0) {
          setRules(pointRules)
        }
      }
    } catch (err) {
      logger.error('Failed to load rules:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='points-rules-page'>
      <ScrollView scrollY className='content'>
        <View className='header'>
          <Text className='title'>积分使用规则</Text>
          <Text className='subtitle'>了解积分获取与使用方式</Text>
        </View>

        <View className='section'>
          <View className='section-title'>
            <Text>💰 积分获取</Text>
          </View>
          <View className='rule-list'>
            <View className='rule-item'>
              <View className='rule-icon'>📦</View>
              <View className='rule-content'>
                <Text className='rule-title'>回收订单</Text>
                <Text className='rule-desc'>每完成一笔回收订单，根据物品重量和类型获得相应积分</Text>
              </View>
            </View>
            <View className='rule-item'>
              <View className='rule-icon'>📅</View>
              <View className='rule-content'>
                <Text className='rule-title'>每日签到</Text>
                <Text className='rule-desc'>每日签到可获得积分，连续签到额外奖励</Text>
              </View>
            </View>
            <View className='rule-item'>
              <View className='rule-icon'>👥</View>
              <View className='rule-content'>
                <Text className='rule-title'>邀请好友</Text>
                <Text className='rule-desc'>邀请好友注册并完成首单，双方获得积分奖励</Text>
              </View>
            </View>
          </View>
        </View>

        <View className='section'>
          <View className='section-title'>
            <Text>💰 积分使用</Text>
          </View>
          <View className='rule-list'>
            <View className='rule-item'>
              <View className='rule-icon'>💱</View>
              <View className='rule-content'>
                <Text className='rule-title'>兑换余额</Text>
                <Text className='rule-desc'>积分可按比例兑换为账户余额，余额可申请提现</Text>
              </View>
            </View>
            <View className='rule-item'>
              <View className='rule-icon'>🏆</View>
              <View className='rule-content'>
                <Text className='rule-title'>环保榜单</Text>
                <Text className='rule-desc'>积分是计算环保榜单排名的重要依据</Text>
              </View>
            </View>
          </View>
        </View>

        <View className='section'>
          <View className='section-title'>
            <Text>📊 兑换比例</Text>
          </View>
          <View className='ratio-card'>
            <View className='ratio-item'>
              <Text className='ratio-label'>积分 : 金额</Text>
              <Text className='ratio-value'>100 : ¥1</Text>
            </View>
            <View className='ratio-desc'>
              <Text>100 积分可兑换 ¥1，用于提现</Text>
            </View>
          </View>
        </View>

        <View className='section'>
          <View className='section-title'>
            <Text>❓ 常见问题</Text>
          </View>
          {loading ? (
            <View className='loading'>
              <Text>加载中...</Text>
            </View>
          ) : rules.length > 0 ? (
            <View className='faq-list'>
              {rules.map((item, index) => (
                <View key={index} className='faq-item'>
                  <Text className='faq-question'>{item.question}</Text>
                  <Text className='faq-answer'>{item.answer}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View className='empty'>
              <Text>暂无常见问题</Text>
            </View>
          )}
        </View>

        <View className='footer'>
          <Text className='footer-text'>如有疑问，请联系客服</Text>
        </View>
      </ScrollView>
    </View>
  )
}

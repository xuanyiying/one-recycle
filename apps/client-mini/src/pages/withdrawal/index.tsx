import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Button, Popup, Input } from '@nutui/nutui-react-taro'
import { IconFont, ArrowRight, Order } from '@nutui/icons-react-taro'
import { useAuth } from '@/hooks/useAuth'
import { useSafeArea } from '@/hooks/useSafeArea'
import accountService from '@/services/account'
import withdrawalService from '@/services/withdrawal'
import { Account, Transaction } from '@/types/account'
import { WithdrawalProvider } from '@/types/withdrawal'
import AuthGuard from '@/components/AuthGuard'
import './index.scss'

// Money Icon component as a placeholder since it's missing in @nutui/icons-react-taro
const Money = ({ size = 20, color = 'currentColor' }) => (
  <Text style={{ fontSize: size, color, fontWeight: 'bold' }}>¥</Text>
)

export default function WalletPage() {
  const { user } = useAuth()
  const { bottom: safeAreaBottom } = useSafeArea()
  const [account, setAccount] = useState<Account | null>(null)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    loadData()
    loadRecentTransactions()
  }, [])

  const loadData = async () => {
    try {
      const data = await accountService.getMyAccount()
      setAccount(data)
    } catch (error) {
      console.error(error)
    }
  }

  const loadRecentTransactions = async () => {
    try {
      const { transactions } = await accountService.getMyTransactions({
        page: 1,
        limit: 3,
      })
      setRecentTransactions(transactions || [])
    } catch (error) {
      console.error(error)
      setRecentTransactions([])
    }
  }

  const handleWithdraw = async () => {
    if (!user) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) < 10) {
      Taro.showToast({ title: '最低提现10元', icon: 'none' })
      return
    }
    
    try {
      setLoading(true)
      await withdrawalService.createWithdrawal({
        amount: parseFloat(withdrawAmount),
        provider: WithdrawalProvider.WECHAT,
        accountInfo: { 
          openid: user.openid || 'mock_openid', 
          realName: user.realName || user.nickname || '用户' 
        }
      })
      Taro.showToast({ title: '提现申请已提交', icon: 'success' })
      setShowWithdraw(false)
      setWithdrawAmount('')
      loadData()
    } catch (error) {
      Taro.showToast({ title: '提现失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <ScrollView className='wallet-page' scrollY>
        <View className='wallet-header'>
          <Text className='header-title'>我的钱包</Text>
        </View>

        <View className='asset-card'>
          <View className='card-header'>
            <Text className='label'>当前余额</Text>
            <View className='rules' onClick={() => Taro.navigateTo({ url: '/pages/rules/index' })}>
              <IconFont name='tips' size={12} color='rgba(255,255,255,0.8)' />
              <Text>规则</Text>
            </View>
          </View>
          
          <View className='points-display'>
            <Text className='points'>¥{(account?.availableBalance ?? 0).toFixed(2)}</Text>
            <Text className='value'>冻结: ¥{(account?.frozenBalance ?? 0).toFixed(2)}</Text>
          </View>

          <View className='card-actions'>
            <Button 
              className='withdraw-btn' 
              type='default' 
              onClick={() => setShowWithdraw(true)}
            >
              立即提现
            </Button>
            <Button 
              className='mall-btn' 
              fill='outline'
              color='#fff'
              onClick={() => Taro.showToast({ title: '积分商城即将上线', icon: 'none' })}
            >
              兑换好物
            </Button>
          </View>
        </View>

        <View className='menu-grid'>
          <View className='menu-item' onClick={() => Taro.navigateTo({ url: '/pages/transaction/list' })}>
            <View className='icon-box blue'><Money size={20} /></View>
            <Text>收支明细</Text>
          </View>
          <View className='menu-item' onClick={() => Taro.navigateTo({ url: '/pages/withdrawal/list' })}>
            <View className='icon-box orange'><Order size={20} /></View>
            <Text>提现记录</Text>
          </View>
          <View className='menu-item' onClick={() => Taro.showToast({ title: '客服即将接入', icon: 'none' })}>
            <View className='icon-box green'><IconFont name='service' size={20} /></View>
            <Text>联系客服</Text>
          </View>
        </View>

        <View className='transaction-section'>
          <View className='section-header'>
            <Text className='title'>最近明细</Text>
            <View className='more' onClick={() => Taro.navigateTo({ url: '/pages/transaction/list' })}>
              <Text>查看全部</Text>
              <ArrowRight size={12} color='#999' />
            </View>
          </View>

          <View className='transaction-list'>
            {recentTransactions?.length === 0 ? (
              <View className='empty-state'>
                <Text className='empty-text'>暂无明细记录</Text>
              </View>
            ) : (
              recentTransactions?.map(transaction => (
                <View className='trans-item' key={transaction.id}>
                  <View className='info'>
                    <Text className='name'>{accountService.getTransactionTypeText(transaction.type)}</Text>
                    <Text className='date'>
                      {new Date(transaction.createdAt).toLocaleString('zh-CN')}
                    </Text>
                  </View>
                  <Text
                    className={`amount ${accountService.getTransactionAmountSign(transaction.type) === '+' ? 'plus' : 'minus'}`}
                  >
                    {accountService.getTransactionAmountSign(transaction.type)}
                    {accountService.formatAmount(transaction.amount)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <Popup 
          visible={showWithdraw} 
          position='bottom' 
          onClose={() => setShowWithdraw(false)}
          round
          closeable
        >
          <View className='withdraw-popup' style={{ paddingBottom: safeAreaBottom > 0 ? `${safeAreaBottom}px` : undefined }}>
            <Text className='popup-title'>提现到微信零钱</Text>
            
            <View className='amount-input-box'>
              <Text className='symbol'>¥</Text>
              <Input
                className='amount-input'
                type='digit'
                placeholder='请输入提现金额'
                value={withdrawAmount}
                onChange={(val) => setWithdrawAmount(val)}
              />
            </View>
            
            <View className='balance-tip'>
              当前可提现余额 ¥{(account?.availableBalance ?? 0).toFixed(2)}，
              <Text className='all-btn' onClick={() => setWithdrawAmount(String(account?.availableBalance || 0))}>全部提现</Text>
            </View>

            <Button 
              block 
              type='primary' 
              className='confirm-btn'
              loading={loading}
              onClick={handleWithdraw}
            >
              确认提现
            </Button>
          </View>
        </Popup>
      </ScrollView>
    </AuthGuard>
  )
}

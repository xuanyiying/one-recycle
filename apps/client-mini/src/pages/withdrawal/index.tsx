import { useState, useEffect } from 'react'
import { View, Text, Input, Button, RadioGroup, Radio, Label } from '@tarojs/components'
import Taro from '@tarojs/taro'
import accountService from '../../services/account'
import withdrawalService from '../../services/withdrawal'
import { WithdrawalProvider } from '../../types/withdrawal'
import type { Account } from '../../types/account'
import AuthGuard from '../../components/AuthGuard'
import './index.scss'

export default function WithdrawalApplication() {
    const [account, setAccount] = useState<Account | null>(null)
    const [amount, setAmount] = useState('')
    const [provider, setProvider] = useState<WithdrawalProvider>(WithdrawalProvider.WECHAT)
    const [accountInfo, setAccountInfo] = useState({
        openid: '',
        realName: '',
        account: '',
        name: '',
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadAccount()
    }, [])

    const loadAccount = async () => {
        try {
            const data = await accountService.getMyAccount()
            setAccount(data)
        } catch (error) {
            Taro.showToast({
                title: '加载失败',
                icon: 'none',
            })
        }
    }

    const handleAmountChange = (e) => {
        const value = e.detail.value
        // Only allow numbers and decimal point
        if (/^\d*\.?\d{0,2}$/.test(value)) {
            setAmount(value)
        }
    }

    const handleProviderChange = (e) => {
        setProvider(e.detail.value as WithdrawalProvider)
    }

    const handleSubmit = async () => {
        if (!account) return

        const amountNum = parseFloat(amount)

        // Validate amount
        const validation = withdrawalService.validateWithdrawalAmount(
            amountNum,
            account.availableBalance,
        )

        if (!validation.valid) {
            Taro.showToast({
                title: validation.message || '',
                icon: 'none',
            })
            return
        }

        // Validate account info
        if (provider === WithdrawalProvider.WECHAT) {
            if (!accountInfo.openid || !accountInfo.realName) {
                Taro.showToast({
                    title: '请填写微信账户信息',
                    icon: 'none',
                })
                return
            }
        } else {
            if (!accountInfo.account || !accountInfo.name) {
                Taro.showToast({
                    title: '请填写支付宝账户信息',
                    icon: 'none',
                })
                return
            }
        }

        try {
            setLoading(true)
            Taro.showLoading({ title: '提交中...' })

            const withdrawalData = {
                amount: amountNum,
                provider,
                accountInfo: provider === WithdrawalProvider.WECHAT
                    ? { openid: accountInfo.openid, realName: accountInfo.realName }
                    : { account: accountInfo.account, name: accountInfo.name },
            }

            await withdrawalService.createWithdrawal(withdrawalData)

            Taro.hideLoading()
            Taro.showToast({
                title: '提现申请已提交',
                icon: 'success',
            })

            setTimeout(() => {
                Taro.navigateTo({
                    url: '/pages/withdrawal/list',
                })
            }, 1500)
        } catch (error) {
            Taro.hideLoading()
            Taro.showToast({
                title: '提交失败',
                icon: 'none',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthGuard>
            <View className="withdrawal-page">
                {/* Balance Display */}
                <View className="balance-info">
                    <Text className="balance-label">可用余额</Text>
                    <Text className="balance-amount">
                        {account ? accountService.formatAmount(account.availableBalance) : '¥0.00'}
                    </Text>
                </View>

                {/* Amount Input */}
                <View className="form-section">
                    <View className="form-item">
                        <Text className="form-label">提现金额</Text>
                        <Input
                            className="form-input"
                            type="digit"
                            placeholder="最低10元"
                            value={amount}
                            onInput={handleAmountChange}
                        />
                    </View>

                    {/* Provider Selection */}
                    <View className="form-item">
                        <Text className="form-label">提现方式</Text>
                        <RadioGroup onChange={handleProviderChange}>
                            <Label className="radio-label">
                                <Radio value={WithdrawalProvider.WECHAT} checked={provider === WithdrawalProvider.WECHAT} />
                                <Text className="radio-text">微信</Text>
                            </Label>
                            <Label className="radio-label">
                                <Radio value={WithdrawalProvider.ALIPAY} checked={provider === WithdrawalProvider.ALIPAY} />
                                <Text className="radio-text">支付宝</Text>
                            </Label>
                        </RadioGroup>
                    </View>

                    {/* Account Info */}
                    {provider === WithdrawalProvider.WECHAT ? (
                        <>
                            <View className="form-item">
                                <Text className="form-label">微信OpenID</Text>
                                <Input
                                    className="form-input"
                                    placeholder="请输入微信OpenID"
                                    value={accountInfo.openid}
                                    onInput={(e) => setAccountInfo({ ...accountInfo, openid: e.detail.value })}
                                />
                            </View>
                            <View className="form-item">
                                <Text className="form-label">真实姓名</Text>
                                <Input
                                    className="form-input"
                                    placeholder="请输入真实姓名"
                                    value={accountInfo.realName}
                                    onInput={(e) => setAccountInfo({ ...accountInfo, realName: e.detail.value })}
                                />
                            </View>
                        </>
                    ) : (
                        <>
                            <View className="form-item">
                                <Text className="form-label">支付宝账号</Text>
                                <Input
                                    className="form-input"
                                    placeholder="请输入支付宝账号"
                                    value={accountInfo.account}
                                    onInput={(e) => setAccountInfo({ ...accountInfo, account: e.detail.value })}
                                />
                            </View>
                            <View className="form-item">
                                <Text className="form-label">真实姓名</Text>
                                <Input
                                    className="form-input"
                                    placeholder="请输入真实姓名"
                                    value={accountInfo.name}
                                    onInput={(e) => setAccountInfo({ ...accountInfo, name: e.detail.value })}
                                />
                            </View>
                        </>
                    )}
                </View>

                {/* Submit Button */}
                <View className="submit-section">
                    <Button
                        className="submit-button"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? '提交中...' : '提交申请'}
                    </Button>
                </View>

                {/* Tips */}
                <View className="tips-section">
                    <Text className="tips-title">提现说明：</Text>
                    <Text className="tips-item">1. 最低提现金额为10元</Text>
                    <Text className="tips-item">2. 提现申请提交后，我们将在1-3个工作日内处理</Text>
                    <Text className="tips-item">3. 提现成功后，款项将直接转入您的账户</Text>
                </View>
            </View>
        </AuthGuard>
    )
}

import { logger } from '@/utils/logger'
import { useState, useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import { PlatformDetector } from '@/utils/platformDetector'
import { bindInvite } from '@/services/referral'
import './index.scss'
import { Button, Input, Checkbox } from '@nutui/nutui-react-taro'
import { View, Text, Image } from "@tarojs/components"

// 导入图片资源
import logoIcon from '../../assets/icons/logo.jpg'

// 常量定义
const COUNTDOWN_SECONDS = 60

export default function Login() {
  const { checkAuthStatus, handleSocialLogin, sendSmsCode, loginWithPhone } = useAuth()

  // 状态管理
  const [platform, setPlatform] = useState<'wechat' | 'alipay' | 'unknown'>('unknown')
  const [loginMode, setLoginMode] = useState<'quick' | 'phone'>('quick') // quick: 一键登录, phone: 手机号登录

  const router = Taro.useRouter()
  const redirectUrl = router.params.redirect ? decodeURIComponent(router.params.redirect) : '/pages/index/index'

  const [phone, setPhone] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 登录成功后的跳转处理
  const handleLoginSuccess = async () => {
    if (process.env.NODE_ENV === 'development') {
      logger.log('[Login] Login success, redirecting to:', redirectUrl)
    }
    Taro.showToast({ title: '登录成功', icon: 'success' })

    // 尝试绑定邀请码（不阻塞跳转）
    tryBindInvite();

    setTimeout(() => {
      const tabPages = ['/pages/index/index', '/pages/order/index', '/pages/profile/index']
      // 确保路径以 / 开头
      const target = redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`
      // 移除可能存在的查询参数来匹配 tab 页面
      const targetPath = target.split('?')[0] ?? target

      const isTab = tabPages.some(p => targetPath === p)

      if (isTab) {
        Taro.switchTab({ url: targetPath })
      } else {
        Taro.reLaunch({ url: target })
      }
    }, 1500)
  }

  // 尝试绑定邀请码
  const tryBindInvite = async () => {
    try {
      const inviteCode = Taro.getStorageSync('invite_code');
      const expireAt = Taro.getStorageSync('invite_code_expire');

      if (!inviteCode) {
        logger.log('[Referral] No invite code found');
        return;
      }

      // 检查是否过期
      if (expireAt && Date.now() > expireAt) {
        logger.log('[Referral] Invite code expired');
        clearInviteCode();
        return;
      }

      logger.log('[Referral] Binding invite:', inviteCode);

      // 调用后端接口绑定邀请关系
      const res = await bindInvite(inviteCode);

      if (res.success) {
        logger.log('[Referral] Invite bound successfully');
        Taro.showToast({ title: '邀请绑定成功', icon: 'success' });
      } else {
        logger.warn('[Referral] Failed to bind invite:', res.message);
      }

      // 无论成功失败，都清除邀请码
      clearInviteCode();

    } catch (error) {
      logger.error('[Referral] Error binding invite:', error);
    }
  }

  // 清除邀请码
  const clearInviteCode = () => {
    Taro.removeStorageSync('invite_code');
    Taro.removeStorageSync('invite_code_expire');
  };

  // 初始化检测
  useEffect(() => {
    const init = async () => {
      // 1. 检测登录状态
      const status = await checkAuthStatus()
      if (status.isLoggedIn) {
        handleLoginSuccess()
        return
      }

      // 2. 检测平台
      const currentPlatform = PlatformDetector.getCurrentPlatform()
      if (currentPlatform === 'wechat' || currentPlatform === 'alipay') {
        setPlatform(currentPlatform)
        setLoginMode('quick')
      } else {
        setPlatform('unknown')
        setLoginMode('phone')
      }
    }
    init()

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [checkAuthStatus])

  // 倒计时逻辑
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [countdown])

  // 验证手机号
  const validatePhone = (p: string) => {
    return /^1[3-9]\d{9}$/.test(p)
  }

  // 发送验证码
  const handleSendCode = async () => {
    if (!phone) {
      setErrorMessage('请输入手机号')
      return
    }
    if (!validatePhone(phone)) {
      setErrorMessage('手机号格式不正确')
      return
    }

    setErrorMessage('')

    try {
      const res = await sendSmsCode(phone)
      if (res.success) {
        setCountdown(COUNTDOWN_SECONDS)
        Taro.showToast({ title: '验证码已发送', icon: 'success' })
      } else {
        setErrorMessage(res.message || '发送失败')
      }
    } catch (error: any) {
      setErrorMessage(error.message || '发送出错')
    }
  }

  // 手机号登录
  const onPhoneLogin = async () => {
    if (!validatePhone(phone)) {
      setErrorMessage('请输入正确的手机号')
      return
    }
    if (!smsCode) {
      setErrorMessage('请输入验证码')
      return
    }
    if (!agreedToTerms) {
      setErrorMessage('请先阅读并同意用户协议')
      return
    }

    setErrorMessage('')
    setLoading(true)

    try {
      const res = await loginWithPhone(phone, smsCode)
      if (res.success) {
        handleLoginSuccess()
      } else {
        setErrorMessage(res.message || '登录失败')
      }
    } catch (error: any) {
      setErrorMessage(error.message || '登录出错')
    } finally {
      setLoading(false)
    }
  }

  // 社交登录 (一键登录)
  const onSocialLogin = async () => {
    if (!agreedToTerms) {
      setErrorMessage('请先阅读并同意用户协议')
      return
    }

    if (platform === 'unknown') {
      setErrorMessage('当前环境不支持一键登录')
      return
    }

    setErrorMessage('')
    setLoading(true)

    try {
      const res = await handleSocialLogin(platform)
      if (res.success) {
        handleLoginSuccess()
      } else {
        setErrorMessage(res.message || '登录失败')
      }
    } catch (error: any) {
      setErrorMessage(error.message || '登录出错')
    } finally {
      setLoading(false)
    }
  }

  // 切换模式
  const switchMode = () => {
    setLoginMode(prev => prev === 'quick' ? 'phone' : 'quick')
    setErrorMessage('')
  }

  // 跳转协议
  const handleAgreement = (type: 'user' | 'privacy') => {
    Taro.navigateTo({ url: `/pages/agreement/index?type=${type}` })
  }

  // 暂不登录，返回上一页或首页
  const handleBack = () => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack()
    } else {
      Taro.switchTab({ url: '/pages/index/index' })
    }
  }

  return (
    <View className="login-container">
      {/* 顶部返回按钮 */}
      <View className="login-back-bar">
        <View className="back-btn" onClick={handleBack}>
          <Text className="back-text">暂不登录</Text>
        </View>
      </View>

      {/* 头部 Logo */}
      <View className="login-header">
        <View className="logo">
          <Image src={logoIcon} className="logo-image" mode="aspectFit" />
        </View>
        <Text className="welcome-text">欢迎使用爱回收</Text>
      </View>

      {/* 主内容区 */}
      <View className="main-content">

        {/* 错误提示 */}
        {errorMessage && (
          <View className="submit-error">
            <Text className="error-text">{errorMessage}</Text>
          </View>
        )}

        {/* 模式一：手机号登录 */}
        {loginMode === 'phone' && (
          <View className="phone-login-form">
            <View className="input-group">
              <Input
                className="custom-input"
                placeholder="请输入手机号"
                value={phone}
                onChange={(val) => setPhone(val)}
                maxLength={11}
                type="number"
              />
            </View>
            <View className="input-group code-group">
              <Input
                className="custom-input"
                placeholder="请输入验证码"
                value={smsCode}
                onChange={(val) => setSmsCode(val)}
                maxLength={6}
                type="number"
              />
              <Button
                size="small"
                type="primary"
                fill="outline"
                className="code-btn"
                disabled={countdown > 0}
                onClick={handleSendCode}
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Button>
            </View>

            <View className="action-buttons">
              <Button
                className={`btn-login ${loading ? 'loading' : ''}`}
                type="primary"
                block
                loading={loading}
                onClick={onPhoneLogin}
                disabled={loading || !phone || !smsCode || !agreedToTerms}
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </View>
          </View>
        )}

        {/* 模式二：一键登录 (仅微信/支付宝环境显示) */}
        {loginMode === 'quick' && platform !== 'unknown' && (
          <View className="quick-login-section">
            <Button
              className={`btn-quick-login ${platform} ${loading ? 'loading' : ''}`}
              type="primary"
              block
              loading={loading}
              onClick={onSocialLogin}
              disabled={loading || !agreedToTerms}
            >
              {loading ? '登录中...' : (platform === 'wechat' ? '微信一键登录' : '支付宝一键登录')}
            </Button>
          </View>
        )}

        {/* 模式切换 */}
        {(platform === 'wechat' || platform === 'alipay') && (
          <View className="switch-mode-container">
            <Button
              className="btn-switch-mode"
              onClick={switchMode}
            >
              {loginMode === 'quick' ? '手机号验证码登录' : `${platform === 'wechat' ? '微信' : '支付宝'}一键登录`}
            </Button>
          </View>
        )}

        {/* 协议勾选 */}
        <View className="agreement-checkbox">
          <Checkbox
            checked={agreedToTerms}
            onChange={(val) => setAgreedToTerms(val)}
          >
            <View className="agreement-text-wrapper">
              <Text className="agreement-text">我已阅读并同意</Text>
              <Text className="agreement-link" onClick={() => handleAgreement('user')}>《用户协议》</Text>
              <Text className="agreement-text">和</Text>
              <Text className="agreement-link" onClick={() => handleAgreement('privacy')}>《隐私政策》</Text>
            </View>
          </Checkbox>
        </View>

      </View>
    </View>
  )
}

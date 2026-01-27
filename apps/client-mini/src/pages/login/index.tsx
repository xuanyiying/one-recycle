import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import { login as apiLogin, getUserInfo } from '@/services/auth'
import './index.scss'
import {Button, Input, Checkbox, Avatar} from '@nutui/nutui-react-taro'
import {View, Text, Image} from "@tarojs/components"

// 导入图片资源
import logoIcon from '../../assets/icons/logo.png'
import defaultAvatar from '../../assets/icons/default-avatar.png'

// 常量定义
const NICKNAME_MIN_LENGTH = 2
const NICKNAME_MAX_LENGTH = 20

interface LoginForm {
  nickname: string
  avatar: string
  agreedToTerms: boolean
}

export default function Login() {
  const { checkAuthStatus, login: authLogin } = useAuth()
  const [form, setForm] = useState<LoginForm>({
    nickname: '',
    avatar: '',
    agreedToTerms: false
  })
  const [loading, setLoading] = useState(false)
  const [nicknameError, setNicknameError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [checkingLoginStatus, setCheckingLoginStatus] = useState(true)
  const [avatar, setAvatar] = useState<string>('')

  // 检查登录状态
  useEffect(() => {
    const initCheck = async () => {
      const status = await checkAuthStatus()
      if (status.isLoggedIn) {
        await Taro.reLaunch({
          url: '/pages/index/index'
        })
      }
      setCheckingLoginStatus(false)
    }
    initCheck()
  }, [checkAuthStatus])

  // 移除图片预加载，避免在某些环境下 getImageInfo 报错导致渲染层网络错误
  useEffect(() => {
    // 如果确实需要预加载，可以使用更安全的方式
    console.log('Login page loaded, assets initialized')
  }, [])

  // 验证昵称
  const validateNickname = (nickname: string): string => {
    const trimmedNickname = nickname.trim()

    if (!trimmedNickname) {
      return '请输入昵称'
    }

    if (trimmedNickname.length < NICKNAME_MIN_LENGTH) {
      return `昵称至少${NICKNAME_MIN_LENGTH}个字符`
    }

    if (trimmedNickname.length > NICKNAME_MAX_LENGTH) {
      return `昵称不能超过${NICKNAME_MAX_LENGTH}个字符`
    }

    // 修正正则表达式：允许中文、英文、数字、下划线和横线
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9_-]+$/.test(trimmedNickname)) {
      return '昵称只能包含中文、英文、数字、下划线和横线'
    }

    // 检查是否包含敏感词或特殊字符
    const forbiddenPatterns = [
      /^\d+$/, // 纯数字
      /^[_-]+$/, // 纯下划线或横线
      /admin|管理员|系统|客服/i // 敏感词
    ]

    for (const pattern of forbiddenPatterns) {
      if (pattern.test(trimmedNickname)) {
        return '昵称格式不符合要求'
      }
    }

    return ''
  }

  // 处理昵称输入
  const handleNicknameInput = (e: any) => {
    const value = e.detail.value
    setForm(prev => ({ ...prev, nickname: value }))

    // 实时验证
    const error = validateNickname(value)
    setNicknameError(error)

    // 清除提交错误
    if (submitError) {
      setSubmitError('')
    }
  }

  // 获取用户唯一标识
  const getUserUniqueId = async (): Promise<string> => {
    try {
      // 尝试获取设备信息
      const systemInfo = await Taro.getSystemInfo()
      const deviceInfo = `${systemInfo.platform}_${systemInfo.system}_${systemInfo.model}`.replace(/\s+/g, '_')

      // 生成基于设备信息、时间戳和随机数的唯一标识
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 15)

      return `${deviceInfo}_${timestamp}_${random}`
    } catch (error) {
      console.error('获取用户唯一标识失败:', error)
      // 降级方案：使用时间戳和随机数
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 15)
      return `fallback_${timestamp}_${random}`
    }
  }

  // 切换协议同意状态
  const handleToggleAgreement = () => {
    setForm(prev => ({ ...prev, agreedToTerms: !prev.agreedToTerms }))
  }

  // 授权登录
  const handleAuthorizeLogin = async () => {
    // 验证昵称
    const nicknameValidationError = validateNickname(form.nickname)
    if (nicknameValidationError) {
      setNicknameError(nicknameValidationError)
      return
    }

    // 验证是否同意协议
    if (!form.agreedToTerms) {
      setSubmitError('请先阅读并同意用户协议和隐私政策')
      return
    }

    setLoading(true)
    setSubmitError('')

    try {
      // 获取微信登录凭证
      const loginResult = await Taro.login()

      if (!loginResult.code) {
        throw new Error('获取登录凭证失败')
      }

      // 获取用户唯一标识
      const uniqueId = await getUserUniqueId()
      // 调用登录API
      const authResult = await apiLogin({
        code: loginResult.code,
        nickname: form.nickname.trim(),
        avatar: form.avatar,
        platform: 'wechat', // 根据平台动态设置
        uniqueId: uniqueId // 添加用户唯一标识
      })

      if (authResult.success && authResult.data) {
        // 存储用户信息
        const { token, refreshToken, user } = authResult.data
        setAvatar(authResult.data.user.avatar || '/assets/icons/default-avatar.png')
        
        // 使用 hook 更新全局状态
        await authLogin(user, token, 'wechat')
        
        // 跳转到首页
        await Taro.reLaunch({
          url: '/pages/index/index'
        })
      } else {
        throw new Error(authResult.message || '登录失败')
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      setSubmitError(error.message || '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 暂不授权
  const handleSkipAuthorization = () => {
    Taro.showModal({
      title: '提示',
      content: '暂不授权将无法使用完整功能，确定要跳过吗？',
      success: (res) => {
        if (res.confirm) {
          // 跳转到首页，但不保存用户信息
          Taro.reLaunch({
            url: '/pages/index/index'
          })
        }
      }
    })
  }

  // 跳转到用户协议页面
  const handleUserAgreement = () => {
    Taro.navigateTo({
      url: '/pages/agreement/index?type=user'
    })
  }

  // 跳转到隐私政策页面
  const handlePrivacyPolicy = () => {
    Taro.navigateTo({
      url: '/pages/agreement/index?type=privacy'
    })
  }

  // 如果正在检查登录状态，显示加载界面
  if (checkingLoginStatus) {
    return (
      <View className="login-container">
        <View className="loading-container">
          <Text className="loading-text">检查登录状态中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="login-container">
      {/* 登录头部 */}
      <View className="login-header">
        <View className="logo">
          <Image
            src={logoIcon}
            className="logo-image"
            mode="aspectFit"
          />
        </View>
        <Text className="welcome-text">欢迎使用爱回收</Text>
      </View>

      {/* 主要内容区域 */}
      <View className="main-content">
        <View className="avatar-section">
          <View className="avatar-container">
            {avatar ? (
              <Avatar
                src={avatar}
                className="user-avatar"
                size="large"
              />
            ) : (
              <Avatar
                src={defaultAvatar}
                className="avatar-icon"
              />
            )}
          </View>
          <Text className="avatar-tip">选择头像，让朋友一眼认出你</Text>
        </View>

        {/* 昵称输入区域 */}
        <View className="nickname-section">
          <View className="input-wrapper">
            <Input
              className={`nickname-input ${nicknameError ? 'error' : ''}`}
              placeholder="请输入昵称"
              value={form.nickname}
              onInput={handleNicknameInput}
              maxLength={20}
            />
          </View>
          {nicknameError && (
            <View className="error-message">
              <Text>{nicknameError}</Text>
            </View>
          )}
        </View>

        {/* 授权说明区域 */}
        <View className="auth-description">
          <Text className="description-title">申请获取以下权限</Text>
          <Text className="description-content">
            为了区分不同客户信息将获得您的公开信息(昵称、头像、地区等)
          </Text>
        </View>

        {/* 用户协议同意区域 */}
        <View className="agreement-checkbox">
            <Checkbox defaultChecked={form.agreedToTerms} onClick={handleToggleAgreement} />
          <View className="agreement-text-wrapper">
            <Text className="agreement-text">我已阅读并同意</Text>
            <Text
              className="agreement-link"
              onClick={handleUserAgreement}
            >
              《用户协议》
            </Text>
            <Text className="agreement-text">和</Text>
            <Text
              className="agreement-link"
              onClick={handlePrivacyPolicy}
            >
              《隐私政策》
            </Text>
          </View>
        </View>

        {/* 提交错误信息 */}
        {submitError && (
          <View className="submit-error">
            <Text className="error-text">{submitError}</Text>
          </View>
        )}

        {/* 操作按钮区域 */}
        <View className="action-buttons">
          <Button
            className={`authorize-btn ${loading ? 'loading' : ''}`}
            color="primary"
            size={'normal'}
            block
            loading={loading}
            onClick={handleAuthorizeLogin}
            disabled={loading || !!nicknameError || !form.nickname.trim() || !form.agreedToTerms}
          >
            {loading ? '授权登录中...' : '授权登录'}
          </Button>

          <Button
            className="skip-btn"
            color="default"
            size={'normal'}
            block
            onClick={handleSkipAuthorization}
            disabled={loading}
          >
            暂不授权
          </Button>
        </View>
      </View>
    </View>
  )
}

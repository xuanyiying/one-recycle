import { useState, useEffect } from 'react'
import { View, Text, Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppContext } from '@/store'
import { login, getUserInfo } from '@/services/auth'
import { uploadImage } from '@/services/upload'
import './index.scss'
import { PlatformDetector } from '@/utils/platformDetector'
import { Button } from '@nutui/nutui-react-taro'

// 常量定义
const NICKNAME_MIN_LENGTH = 2
const NICKNAME_MAX_LENGTH = 20

interface LoginForm {
  nickname: string
  avatar: string
}

export default function Login() {
  const [form, setForm] = useState<LoginForm>({
    nickname: '',
    avatar: ''
  })
  const [loading, setLoading] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [nicknameError, setNicknameError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [checkingLoginStatus, setCheckingLoginStatus] = useState(true)
  
  const { dispatch } = useAppContext()

  // 检查登录状态
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = Taro.getStorageSync('token')
        if (token) {
          // 验证token有效性
          const userInfoResult = await getUserInfo()
          if (userInfoResult.success && userInfoResult.data) {
            // 用户已登录，更新全局状态并跳转首页
            dispatch({
              type: 'SET_USER',
              payload: userInfoResult.data
            })
            
            await Taro.reLaunch({
              url: '/pages/index/index'
            })
            return
          }
        }
      } catch (error) {
        console.log('检查登录状态失败:', error)
        // 清除无效token
        Taro.removeStorageSync('token')
      } finally {
        setCheckingLoginStatus(false)
      }
    }
    
    checkLoginStatus()
  }, [dispatch])

  // 预加载图片资源
  useEffect(() => {
    const preloadImages = [
      '/assets/icons/logo.png',
      '/assets/icons/default-avatar.png',
      '/assets/icons/wechat-avatar.png',
      '/assets/icons/album.png',
      '/assets/icons/camera.png'
    ]
    
    // 使用Taro的图片预加载方法
    preloadImages.forEach(src => {
      Taro.getImageInfo({
        src: src
      }).catch(() => {
        // 忽略预加载失败的图片
        console.log(`预加载图片失败: ${src}`)
      })
    })
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

  // 处理头像选择
  const handleAvatarClick = () => {
    setShowAvatarPicker(true)
  }

  // 使用微信头像
  const handleUseWechatAvatar = async () => {
    try {
      // 获取微信用户信息
      const userProfile = await Taro.getUserProfile({
        desc: '用于完善用户资料'
      })
      
      if (userProfile.userInfo.avatarUrl) {
        setForm(prev => ({ ...prev, avatar: userProfile.userInfo.avatarUrl }))
        
        // 如果昵称为空，使用微信昵称
        if (!form.nickname && userProfile.userInfo.nickName) {
          setForm(prev => ({ ...prev, nickname: userProfile.userInfo.nickName }))
          setNicknameError('')
        }
      }
      
      setShowAvatarPicker(false)
    } catch (error) {
      console.error('获取微信头像失败:', error)
      Taro.showToast({
        title: '获取头像失败',
        icon: 'error'
      })
    }
  }

  // 从相册选择
  const handleSelectFromAlbum = async () => {
    try {
      const result = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album']
      })
      
      if (result.tempFilePaths.length > 0) {
        const tempFilePath = result.tempFilePaths[0]
        
        // 上传图片
        const uploadResult = await uploadImage(tempFilePath)
        if (uploadResult.success && uploadResult.data) {
          setForm(prev => ({ ...prev, avatar: uploadResult.data?.url || '' }))
        } else {
          throw new Error(uploadResult.message || '上传失败')
        }
      }
      
      setShowAvatarPicker(false)
    } catch (error) {
      console.error('选择头像失败:', error)
      Taro.showToast({
        title: '选择头像失败',
        icon: 'error'
      })
    }
  }

  // 拍照
  const handleTakePhoto = async () => {
    try {
      const result = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera']
      })
      
      if (result.tempFilePaths.length > 0) {
        const tempFilePath = result.tempFilePaths[0]
        
        // 上传图片
        const uploadResult = await uploadImage(tempFilePath)
        if (uploadResult.success && uploadResult.data) {
          setForm(prev => ({ ...prev, avatar: uploadResult.data?.url || '' }))
        } else {
          throw new Error(uploadResult.message || '上传失败')
        }
      }
      
      setShowAvatarPicker(false)
    } catch (error) {
      console.error('拍照失败:', error)
      Taro.showToast({
        title: '拍照失败',
        icon: 'error'
      })
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

  // 授权登录
  const handleAuthorizeLogin = async () => {
    // 验证昵称
    const nicknameValidationError = validateNickname(form.nickname)
    if (nicknameValidationError) {
      setNicknameError(nicknameValidationError)
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
      const authResult = await login({
        code: loginResult.code,
        nickname: form.nickname.trim(),
        avatar: form.avatar,
        platform: 'wechat', // 根据平台动态设置
        uniqueId: uniqueId // 添加用户唯一标识
      })

      if (authResult.success && authResult.data) {
        // 存储用户信息
        const { token, refreshToken, user } = authResult.data
        
        // 存储token和刷新令牌
        await Taro.setStorageSync('token', token)
        if (refreshToken) {
          await Taro.setStorageSync('refreshToken', refreshToken)
        }
        // 存储用户信息到本地，便于跨会话读取
        await Taro.setStorageSync('user', user)
        
        // 更新全局状态
        dispatch({
          type: 'SET_USER',
          payload: user
        })

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
            src="/assets/icons/logo.png" 
            className="logo-image"
            mode="aspectFit"
          />
        </View>
        <Text className="welcome-text">欢迎使用爱回收</Text>
      </View>

      {/* 主要内容区域 */}
      <View className="main-content">
        {/* 头像区域 */}
        <View className="avatar-section">
          <Button
            className="avatar-container"
            onClick={handleAvatarClick}
          >
            {form.avatar ? (
              <Image 
                src={form.avatar} 
                className="user-avatar"
                mode="aspectFill"
              />
            ) : (
              <View className="default-avatar">
                <Image 
                  src="/assets/icons/default-avatar.png"
                  className="avatar-icon"
                  mode="aspectFit"
                />
              </View>
            )}
          </Button>
          <Text className="avatar-tip">点击获取头像</Text>
        </View>

        {/* 昵称输入区域 */}
        <View className="nickname-section">
          <View className="input-wrapper">
            <Input
              className={`nickname-input ${nicknameError ? 'error' : ''}`}
              placeholder="请输入昵称"
              value={form.nickname}
              onInput={handleNicknameInput}
              maxlength={20}
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
            disabled={loading || !!nicknameError || !form.nickname.trim()}
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

        {/* 用户协议 */}
        <View className="agreement">
          <Text className="agreement-text">
            登录即表示同意
          </Text>
          <Button
            className="link-container"
            size="small"
            onClick={handleUserAgreement}
          >
            <Text className="link">《用户协议》</Text>
          </Button>
          <Text className="agreement-text">和</Text>
          <Button
            className="link-container"
            size="small"
            onClick={handlePrivacyPolicy}
          >
            <Text className="link">《隐私政策》</Text>
          </Button>
        </View>
      </View>

      {/* 头像选择器 */}
      {showAvatarPicker && (
        <View className="avatar-picker-overlay" onTap={() => setShowAvatarPicker(false)}>
          <View className="avatar-picker-modal" onTap={(e) => e.stopPropagation()}>
            <Button
              className="avatar-picker-header"
              block
              onClick={handleUseWechatAvatar}
            >
              <Text className="picker-title">用{PlatformDetector.getPlatformChineseName()}头像</Text>
               <Image 
                  src="/assets/icons/wechat-avatar.png"
                  className="option-icon"
                  mode="aspectFit"
                />
            </Button>
            
              <Button
                className="avatar-option"
                block
                onClick={handleSelectFromAlbum}
              >
                <Image 
                  src="/assets/icons/album.png"
                  className="option-icon"
                  mode="aspectFit"
                />
                <Text className="option-text">从相册选择</Text>
              </Button>
              
              <Button
                className="avatar-option"
                block
                onClick={handleTakePhoto}
              >
                <Image 
                  src="/assets/icons/camera.png"
                  className="option-icon"
                  mode="aspectFit"
                />
                <Text className="option-text">拍照</Text>
              </Button>
            </View>
            
            <View className="avatar-picker-footer">
              <Button 
                className="cancel-btn"
                color="default"
                size={'normal'}
                block
                onClick={() => setShowAvatarPicker(false)}
              >
                取消
              </Button>
            </View>
          </View>
      )}
    </View>
  )
}
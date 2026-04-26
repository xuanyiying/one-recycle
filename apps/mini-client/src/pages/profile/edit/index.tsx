import AuthGuard from '@/components/AuthGuard'
import { Icon } from '@/components/Icon'
import { LIMITS, REGEX } from '@/config/constants'
import { useAuth } from '@/hooks/useAuth'
import { useResponsive } from '@/hooks/useResponsive'
import { AuthService } from '@/services/auth'
import { getUserById, updateUserInfo, uploadAvatar } from '@/services/user'
import logger from '@/utils/logger'
import { Button, Image, Input, Text, View } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './index.scss'

// TypeScript interfaces for component state
interface ProfileFormData {
  nickname: string
  avatarUrl: string
  phone: string
}

interface SmsState {
  sending: boolean
  countdown: number
  code: string
}

interface LoadingState {
  isLoading: boolean
  error: string | null
  retryCount: number
}

interface ValidationErrors {
  nickname: string
  phone: string
  smsCode: string
}

// 防抖 hook
function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

export default function ProfileEdit(): JSX.Element {
  const { user, updateUser } = useAuth()
  const screenSize = useResponsive()

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null,
    retryCount: 0
  })
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    nickname: '',
    avatarUrl: '',
    phone: ''
  })
  const [originalData, setOriginalData] = useState<ProfileFormData>({
    nickname: '',
    avatarUrl: '',
    phone: ''
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    nickname: '',
    phone: '',
    smsCode: ''
  })
  const [showPhoneBinding, setShowPhoneBinding] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [smsState, setSmsState] = useState<SmsState>({
    sending: false,
    countdown: 0,
    code: ''
  })
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Memoized computed values for performance optimization
  const hasChanges = useMemo(() =>
    formData.nickname !== originalData.nickname ||
    formData.avatarUrl !== originalData.avatarUrl,
    [formData, originalData]
  )

  const canSave = useMemo(() =>
    hasChanges &&
    !validationErrors.nickname &&
    formData.nickname.trim().length >= LIMITS.NICKNAME_MIN &&
    !saving,
    [hasChanges, validationErrors.nickname, formData.nickname, saving]
  )

  const hasError = loadingState.error !== null
  const isLoading = loadingState.isLoading
  const canRetry = loadingState.retryCount < 3

  // 加载用户信息 - 使用缓存策略
  const loadUserInfo = useCallback(async (isRetry = false) => {
    try {
      setLoadingState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        retryCount: isRetry ? prev.retryCount + 1 : 0
      }))

      if (!user?.id) {
        setLoadingState(prev => ({
          ...prev,
          isLoading: false,
          error: '用户未登录'
        }))
        return
      }

      // 优先使用缓存数据快速渲染
      const cachedUser = Taro.getStorageSync('user_info')
      if (cachedUser && !isRetry) {
        const userData = {
          nickname: cachedUser.nickname || '',
          avatarUrl: cachedUser.avatar || '',
          phone: cachedUser.phone || ''
        }
        setFormData(userData)
        setOriginalData(userData)
        setLoadingState(prev => ({ ...prev, isLoading: false }))
      }

      // 后台刷新数据
      const result = await getUserById(user.id)
      if (result.success && result.data) {
        const userData = {
          nickname: result.data.nickname || '',
          avatarUrl: result.data.avatar || '',
          phone: result.data.phone || ''
        }
        setFormData(userData)
        setOriginalData(userData)

        // 更新缓存和全局状态
        Taro.setStorageSync('user_info', result.data)
        updateUser(result.data)

        setLoadingState(prev => ({
          ...prev,
          isLoading: false,
          error: null
        }))
      } else {
        throw new Error(result.message || '获取用户信息失败')
      }
    } catch (error) {
      logger.error('加载用户信息失败:', error)
      const errorMessage = error instanceof Error ? error.message : '网络连接失败，请检查网络后重试'

      setLoadingState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))

      if (!isRetry) {
        Taro.showToast({
          title: '加载失败',
          icon: 'none',
          duration: 2000
        })
      }
    }
  }, [user?.id, updateUser])

  // 重试加载函数
  const retryLoad = useCallback(() => {
    if (canRetry) {
      loadUserInfo(true)
    } else {
      Taro.showToast({
        title: '重试次数过多，请稍后再试',
        icon: 'none'
      })
    }
  }, [loadUserInfo, canRetry])

  // 下拉刷新
  usePullDownRefresh(useCallback(() => {
    loadUserInfo().finally(() => {
      Taro.stopPullDownRefresh()
    })
  }, [loadUserInfo]))

  useEffect(() => {
    loadUserInfo()
  }, [loadUserInfo])

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (smsState.countdown > 0) {
      timer = setTimeout(() => {
        setSmsState(prev => ({ ...prev, countdown: prev.countdown - 1 }))
      }, 1000)
    }
    return () => clearTimeout(timer)
  }, [smsState.countdown])

  // 选择头像 - 优化图片处理
  const handleChooseAvatar = useCallback(async () => {
    const hintKey = 'avatar_permission_hint_shown'
    const hasShown = Taro.getStorageSync(hintKey)

    const showPicker = async () => {
      try {
        const { tapIndex } = await Taro.showActionSheet({
          itemList: ['拍照', '从相册选择']
        })

        const sourceType = tapIndex === 0 ? ['camera'] : ['album']

        const { tempFilePaths } = await Taro.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: sourceType as any
        })

        const tempFilePath = tempFilePaths[0]
        if (!tempFilePath) {
          Taro.showToast({ title: '未获取到图片路径', icon: 'none' })
          return
        }

        Taro.showLoading({ title: '处理中...', mask: true })

        try {
          // 压缩图片
          const compressedResult = await Taro.compressImage({
            src: tempFilePath,
            quality: 80
          })

          // 上传到服务器
          if (user?.id) {
            const uploadResult = await uploadAvatar(compressedResult.tempFilePath, user.id)
            if (uploadResult.success) {
              setFormData(prev => ({ ...prev, avatarUrl: uploadResult.url }))
              Taro.showToast({ title: '头像已更新', icon: 'success' })
            } else {
              throw new Error(uploadResult.message || '上传失败')
            }
          } else {
            // 本地预览模式
            setFormData(prev => ({ ...prev, avatarUrl: compressedResult.tempFilePath }))
            Taro.showToast({ title: '头像已更新', icon: 'success' })
          }
        } catch (error) {
          logger.error('处理图片失败:', error)
          // 降级处理：直接使用原图
          setFormData(prev => ({ ...prev, avatarUrl: tempFilePath }))
          Taro.showToast({ title: '头像已更新', icon: 'success' })
        } finally {
          Taro.hideLoading()
        }
      } catch (error) {
        // 用户取消选择，不处理
      }
    }

    if (!hasShown) {
      const { confirm } = await Taro.showModal({
        title: '头像上传说明',
        content: '需要使用相册/相机权限用于选择头像照片',
        confirmText: '继续',
        cancelText: '取消'
      })

      if (confirm) {
        Taro.setStorageSync(hintKey, true)
        showPicker()
      }
      return
    }
    showPicker()
  }, [user?.id])

  // 验证昵称
  const validateNickname = useCallback((nickname: string): string => {
    const trimmedNickname = nickname.trim()

    if (!trimmedNickname) {
      return '昵称不能为空'
    }
    if (trimmedNickname.length < LIMITS.NICKNAME_MIN) {
      return `昵称至少需要${LIMITS.NICKNAME_MIN}个字符`
    }
    if (trimmedNickname.length > LIMITS.NICKNAME_MAX) {
      return `昵称最多${LIMITS.NICKNAME_MAX}个字符`
    }
    if (REGEX.NICKNAME_INVALID_CHARS.test(trimmedNickname)) {
      return '昵称包含无效字符'
    }

    return ''
  }, [])

  // 防抖验证
  const debouncedValidateNickname = useDebounce((value: string) => {
    const error = validateNickname(value)
    setValidationErrors(prev => ({ ...prev, nickname: error }))
  }, 300)

  // 昵称输入处理
  const handleNicknameChange = useCallback((e: any) => {
    const value = e.detail.value
    setFormData(prev => ({ ...prev, nickname: value }))
    setTouched(prev => ({ ...prev, nickname: true }))

    // 实时验证
    if (value) {
      debouncedValidateNickname(value)
    } else {
      setValidationErrors(prev => ({ ...prev, nickname: '' }))
    }
  }, [debouncedValidateNickname])

  // 验证手机号
  const validatePhone = useCallback((phone: string): string => {
    const trimmedPhone = phone.trim()

    if (!trimmedPhone) {
      return '手机号不能为空'
    }
    if (!REGEX.PHONE_CN.test(trimmedPhone)) {
      return '请输入正确的手机号格式'
    }

    return ''
  }, [])

  // 手机号输入处理
  const handlePhoneInput = useCallback((e: any) => {
    const value = e.detail.value.replace(REGEX.NUMERIC_ONLY, '')
    setPhoneInput(value)
    setTouched(prev => ({ ...prev, phone: true }))

    const error = validatePhone(value)
    setValidationErrors(prev => ({ ...prev, phone: error }))
  }, [validatePhone])

  // 验证短信验证码
  const validateSmsCode = useCallback((code: string): string => {
    const trimmedCode = code.trim()

    if (!trimmedCode) {
      return '验证码不能为空'
    }
    if (trimmedCode.length !== LIMITS.SMS_CODE_LENGTH) {
      return `请输入${LIMITS.SMS_CODE_LENGTH}位验证码`
    }
    if (!REGEX.SMS_CODE.test(trimmedCode)) {
      return '验证码只能包含数字'
    }

    return ''
  }, [])

  // 验证码输入处理
  const handleSmsCodeChange = useCallback((e: any) => {
    const value = e.detail.value.replace(REGEX.NUMERIC_ONLY, '')
    setSmsState(prev => ({ ...prev, code: value }))
    setTouched(prev => ({ ...prev, smsCode: true }))

    const error = validateSmsCode(value)
    setValidationErrors(prev => ({ ...prev, smsCode: error }))
  }, [validateSmsCode])

  // 发送验证码
  const handleSendSms = useCallback(async () => {
    const phoneError = validatePhone(phoneInput)
    if (phoneError) {
      setValidationErrors(prev => ({ ...prev, phone: phoneError }))
      return
    }

    if (smsState.countdown > 0) return

    try {
      setSmsState(prev => ({ ...prev, sending: true }))

      const result = await AuthService.sendSmsCode({ mobile: phoneInput, type: 'login' })

      if (result.success) {
        setSmsState(prev => ({
          ...prev,
          sending: false,
          countdown: 60
        }))
        Taro.showToast({ title: '验证码已发送', icon: 'success' })
      } else {
        throw new Error(result.message || '发送失败')
      }
    } catch (error) {
      logger.error('发送验证码失败:', error)
      setSmsState(prev => ({ ...prev, sending: false }))

      const errorMessage = error instanceof Error ? error.message : '发送失败，请重试'
      Taro.showToast({ title: errorMessage, icon: 'none' })
    }
  }, [phoneInput, smsState.countdown, validatePhone])

  // 绑定手机号
  const handleBindPhone = useCallback(async () => {
    const phoneError = validatePhone(phoneInput)
    const smsError = validateSmsCode(smsState.code)

    if (phoneError || smsError) {
      setValidationErrors(prev => ({
        ...prev,
        phone: phoneError,
        smsCode: smsError
      }))
      return
    }

    try {
      setSaving(true)

      const result = await AuthService.phoneLogin(phoneInput, smsState.code)

      if (result.success) {
        setFormData(prev => ({ ...prev, phone: phoneInput }))
        setOriginalData(prev => ({ ...prev, phone: phoneInput }))
        setShowPhoneBinding(false)
        setPhoneInput('')
        setSmsState({ sending: false, countdown: 0, code: '' })
        setValidationErrors(prev => ({ ...prev, phone: '', smsCode: '' }))
        setTouched({})

        Taro.showToast({ title: '绑定成功', icon: 'success' })
      } else {
        throw new Error(result.error || '绑定失败')
      }
    } catch (error) {
      logger.error('绑定手机号失败:', error)

      const errorMessage = error instanceof Error ? error.message : '绑定失败，请重试'
      Taro.showToast({ title: errorMessage, icon: 'none' })
    } finally {
      setSaving(false)
    }
  }, [phoneInput, smsState.code, validatePhone, validateSmsCode])

  // 关闭手机绑定弹窗
  const handleClosePhoneBinding = useCallback(() => {
    setShowPhoneBinding(false)
    setPhoneInput('')
    setSmsState({ sending: false, countdown: 0, code: '' })
    setValidationErrors(prev => ({ ...prev, phone: '', smsCode: '' }))
    setTouched({})
  }, [])

  // 保存修改
  const handleSave = useCallback(async () => {
    const nicknameError = validateNickname(formData.nickname)
    if (nicknameError) {
      setValidationErrors(prev => ({ ...prev, nickname: nicknameError }))
      Taro.showToast({ title: nicknameError, icon: 'none' })
      return
    }

    if (!hasChanges) {
      Taro.showToast({ title: '没有修改内容', icon: 'none' })
      return
    }

    try {
      setSaving(true)
      Taro.showLoading({ title: '保存中...', mask: true })

      if (!user?.id) {
        throw new Error('用户信息无效')
      }

      const updateData: any = {}

      if (formData.nickname !== originalData.nickname) {
        updateData.nickname = formData.nickname.trim()
      }

      if (formData.avatarUrl !== originalData.avatarUrl) {
        updateData.avatar = formData.avatarUrl
      }

      const result = await updateUserInfo(user.id, updateData)

      if (result.success) {
        setOriginalData(formData)
        updateUser(updateData)
        Taro.setStorageSync('user_info', { ...user, ...updateData })

        Taro.hideLoading()
        Taro.showToast({ title: '保存成功', icon: 'success' })

        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } else {
        throw new Error(result.message || '保存失败')
      }
    } catch (error) {
      logger.error('保存失败:', error)
      Taro.hideLoading()

      const errorMessage = error instanceof Error ? error.message : '保存失败，请重试'
      Taro.showToast({ title: errorMessage, icon: 'none' })
    } finally {
      setSaving(false)
    }
  }, [formData, originalData, user, validateNickname, hasChanges, updateUser])

  // 加载状态组件
  const LoadingComponent = useMemo(() => (
    <View className='profile-edit-page'>
      <View className='loading-container'>
        <View className='loading-spinner' />
        <Text className='loading-text'>加载中...</Text>
      </View>
    </View>
  ), [])

  // 错误状态组件
  const ErrorComponent = useMemo(() => (
    <View className='profile-edit-page'>
      <View className='loading-container'>
        <Icon name='warning' size='48' color='var(--ios-gray)' />
        <Text className='error-title'>加载失败</Text>
        <Text className='loading-text'>{loadingState.error}</Text>
        {canRetry && (
          <View className='error-actions'>
            <Button className='retry-btn' onClick={retryLoad}>
              重试 ({3 - loadingState.retryCount})
            </Button>
          </View>
        )}
      </View>
    </View>
  ), [loadingState.error, canRetry, retryLoad, loadingState.retryCount])

  if (isLoading) {
    return LoadingComponent
  }

  if (hasError) {
    return ErrorComponent
  }

  return (
    <AuthGuard>
      <View className={`profile-edit-page ${screenSize.screenType}`}>
        {/* 头像编辑 */}
        <View className='edit-section avatar-section'>
          <View className='avatar-edit' onClick={handleChooseAvatar}>
            <Image
              className='avatar-preview'
              src={formData.avatarUrl || '/assets/icons/default-avatar.png'}
              mode='aspectFill'
              lazyLoad
            />
            <View className='avatar-overlay'>
              <Icon name='photograph' size='32' color='#fff' />
            </View>
          </View>
          <Text className='avatar-hint'>点击更换头像</Text>
        </View>

        {/* 昵称编辑 */}
        <View className='edit-section'>
          <View className='section-header'>
            <Text className='section-title'>昵称</Text>
          </View>
          <View className={`input-wrapper ${validationErrors.nickname && touched.nickname ? 'error' : ''}`}>
            <Input
              className='input-field'
              type='text'
              value={formData.nickname}
              placeholder={`请输入昵称（${LIMITS.NICKNAME_MIN}-${LIMITS.NICKNAME_MAX}个字符）`}
              maxlength={LIMITS.NICKNAME_MAX}
              onInput={handleNicknameChange}
              confirmType='done'
            />
            <Text className='input-counter'>{formData.nickname.length}/{LIMITS.NICKNAME_MAX}</Text>
          </View>
          {validationErrors.nickname && touched.nickname && (
            <Text className='error-text'>{validationErrors.nickname}</Text>
          )}
        </View>

        {/* 手机号绑定 */}
        <View className='edit-section'>
          <View className='section-header'>
            <Text className='section-title'>手机号</Text>
          </View>
          {formData.phone ? (
            <View className='phone-bound'>
              <View className='phone-info'>
                <View className='phone-icon'>
                  <Icon name='phone' size='32' color='var(--success-color)' />
                </View>
                <View className='phone-details'>
                  <Text className='phone-number'>{formData.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</Text>
                  <Text className='phone-status'>
                    <Icon name='checkmark-circle' size='12' color='#22C55E' />
                    已绑定
                  </Text>
                </View>
              </View>
              <Button className='phone-action' onClick={() => setShowPhoneBinding(true)}>
                更换
              </Button>
            </View>
          ) : (
            <Button
              className='bind-phone-btn'
              onClick={() => setShowPhoneBinding(true)}
            >
              <Icon name='plus' size='16' color='#22C55E' />
              绑定手机号
            </Button>
          )}
        </View>

        {/* 保存按钮 */}
        <View className='save-section'>
          <Button
            className={`save-btn ${canSave ? 'active' : ''}`}
            onClick={handleSave}
            disabled={!canSave}
          >
            {saving ? (
              <View className='btn-loading'>
                <View className='loading-dot' />
                <Text>保存中...</Text>
              </View>
            ) : '保存修改'}
          </Button>
        </View>

        {/* 手机号绑定弹窗 */}
        {showPhoneBinding && (
          <View className='phone-binding-modal'>
            <View className='modal-mask' onClick={handleClosePhoneBinding} />
            <View className='modal-content'>
              <View className='modal-header'>
                <Text className='modal-title'>绑定手机号</Text>
                <View className='close-btn' onClick={handleClosePhoneBinding}>
                  <Icon name='cross' size='24' color='var(--text-tertiary)' />
                </View>
              </View>

              <View className='modal-body'>
                {/* 手机号输入 */}
                <View className='form-item'>
                  <Text className='form-label'>手机号</Text>
                  <Input
                    className={`form-input ${validationErrors.phone && touched.phone ? 'error' : ''}`}
                    type='number'
                    value={phoneInput}
                    placeholder='请输入11位手机号'
                    maxlength={11}
                    onInput={handlePhoneInput}
                    confirmType='next'
                  />
                  {validationErrors.phone && touched.phone && (
                    <Text className='error-text'>{validationErrors.phone}</Text>
                  )}
                </View>

                {/* 验证码输入 */}
                <View className='form-item'>
                  <Text className='form-label'>验证码</Text>
                  <View className='sms-input-wrapper'>
                    <Input
                      className={`form-input sms-input ${validationErrors.smsCode && touched.smsCode ? 'error' : ''}`}
                      type='number'
                      value={smsState.code}
                      placeholder='请输入6位验证码'
                      maxlength={6}
                      onInput={handleSmsCodeChange}
                      confirmType='done'
                    />
                    <Button
                      className={`send-sms-btn ${smsState.countdown > 0 ? 'counting' : ''}`}
                      onClick={handleSendSms}
                      disabled={smsState.sending || smsState.countdown > 0 || !phoneInput || !!validationErrors.phone}
                    >
                      {smsState.countdown > 0 ? `${smsState.countdown}s` : smsState.sending ? '发送中' : '发送验证码'}
                    </Button>
                  </View>
                  {validationErrors.smsCode && touched.smsCode && (
                    <Text className='error-text'>{validationErrors.smsCode}</Text>
                  )}
                </View>
              </View>

              <View className='modal-footer'>
                <Button
                  className='confirm-btn'
                  onClick={handleBindPhone}
                  disabled={saving || !phoneInput || !smsState.code || !!validationErrors.phone || !!validationErrors.smsCode}
                >
                  {saving ? (
                    <View className='btn-loading'>
                      <View className='loading-dot' />
                      <Text>绑定中...</Text>
                    </View>
                  ) : '确认绑定'}
                </Button>
              </View>
            </View>
          </View>
        )}
      </View>
    </AuthGuard>
  )
}

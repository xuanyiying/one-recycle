import { useState, useEffect, useCallback, useMemo } from 'react'
import { View, Text, Button, Image, Input } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import { IconFont } from '@nutui/icons-react-taro'
import { useAppContext } from '../../../store'
import { getUserById, updateUserInfo } from '../../../services/user'
import { useResponsive } from '../../../hooks/useResponsive'
import AuthGuard from '../../../components/AuthGuard'
import { REGEX, LIMITS } from '../../../config/constants'
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

export default function ProfileEdit(): JSX.Element {
  const { state } = useAppContext()
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

  // Memoized computed values for performance optimization
  const hasChanges = useMemo(() =>
    formData.nickname !== originalData.nickname ||
    formData.avatarUrl !== originalData.avatarUrl,
    [formData, originalData]
  )

  const canSave = useMemo(() =>
    hasChanges &&
    !validationErrors.nickname &&
    formData.nickname.trim().length >= 2 &&
    !saving,
    [hasChanges, validationErrors.nickname, formData.nickname, saving]
  )

  const hasError = loadingState.error !== null
  const isLoading = loadingState.isLoading
  const canRetry = loadingState.retryCount < 3

  // 加载用户信息
  const loadUserInfo = useCallback(async (isRetry = false) => {
    try {
      setLoadingState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        retryCount: isRetry ? prev.retryCount + 1 : 0
      }))

      if (!state.user?.id) {
        setLoadingState(prev => ({
          ...prev,
          isLoading: false,
          error: '用户未登录'
        }))
        return
      }

      const result = await getUserById(state.user.id)
      if (result.success && result.data) {
        const userData = {
          nickname: result.data.nickname || '',
          avatarUrl: result.data.avatar || '',
          phone: result.data.phone || ''
        }
        setFormData(userData)
        setOriginalData(userData)

        setLoadingState(prev => ({
          ...prev,
          isLoading: false,
          error: null
        }))
      } else {
        throw new Error(result.message || '获取用户信息失败')
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
      const errorMessage = error instanceof Error ? error.message : '网络连接失败，请检查网络后重试'

      setLoadingState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))

      // 只在非重试情况下显示错误提示
      if (!isRetry) {
        Taro.showToast({
          title: '加载失败',
          icon: 'none',
          duration: 2000
        })
      }
    }
  }, [state.user?.id])

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

  // 下拉刷新 - 使用原生Taro实现
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

  // 选择头像 - iOS 图片选择器
  const handleChooseAvatar = useCallback(() => {
    Taro.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: (res) => {
        const sourceType = res.tapIndex === 0 ? ['camera'] : ['album']

        Taro.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: sourceType as any,
          success: async (imageRes) => {
            const tempFilePath = imageRes.tempFilePaths[0]

            // 显示加载提示
            Taro.showLoading({
              title: '处理中...',
              mask: true
            })

            try {
              // 压缩图片以优化性能
              const compressedResult = await Taro.compressImage({
                src: tempFilePath,
                quality: 80
              })

              setFormData(prev => ({
                ...prev,
                avatarUrl: compressedResult.tempFilePath
              }))

              Taro.hideLoading()
              Taro.showToast({
                title: '头像已更新',
                icon: 'success',
                duration: 1500
              })
            } catch (error) {
              console.error('压缩图片失败:', error)
              // 如果压缩失败，使用原图
              setFormData(prev => ({
                ...prev,
                avatarUrl: tempFilePath
              }))

              Taro.hideLoading()
              Taro.showToast({
                title: '头像已更新',
                icon: 'success',
                duration: 1500
              })
            }
          },
          fail: (error) => {
            console.error('选择图片失败:', error)
            Taro.showToast({
              title: '选择图片失败',
              icon: 'none',
              duration: 2000
            })
          }
        })
      },
      fail: () => {
        // 用户取消选择，不需要处理
      }
    })
  }, [])

  // 验证昵称 - iOS 标准验证
  const validateNickname = useCallback((nickname: string): boolean => {
    const trimmedNickname = nickname.trim()

    if (!trimmedNickname) {
      setValidationErrors(prev => ({ ...prev, nickname: '昵称不能为空' }))
      return false
    }
    if (trimmedNickname.length < LIMITS.NICKNAME_MIN) {
      setValidationErrors(prev => ({ ...prev, nickname: `昵称至少需要${LIMITS.NICKNAME_MIN}个字符` }))
      return false
    }
    if (trimmedNickname.length > LIMITS.NICKNAME_MAX) {
      setValidationErrors(prev => ({ ...prev, nickname: `昵称最多${LIMITS.NICKNAME_MAX}个字符` }))
      return false
    }

    // 检查特殊字符
    if (REGEX.NICKNAME_INVALID_CHARS.test(trimmedNickname)) {
      setValidationErrors(prev => ({ ...prev, nickname: '昵称包含无效字符' }))
      return false
    }

    setValidationErrors(prev => ({ ...prev, nickname: '' }))
    return true
  }, [])

  // 昵称输入处理
  const handleNicknameChange = useCallback((e: any) => {
    const value = e.detail.value
    setFormData(prev => ({ ...prev, nickname: value }))

    // 实时验证
    if (value) {
      validateNickname(value)
    } else {
      setValidationErrors(prev => ({ ...prev, nickname: '' }))
    }
  }, [validateNickname])

  // 验证手机号 - 中国大陆手机号验证
  const validatePhone = useCallback((phone: string): boolean => {
    const trimmedPhone = phone.trim()

    if (!trimmedPhone) {
      setValidationErrors(prev => ({ ...prev, phone: '手机号不能为空' }))
      return false
    }

    // 中国大陆手机号正则表达式
    if (!REGEX.PHONE_CN.test(trimmedPhone)) {
      setValidationErrors(prev => ({ ...prev, phone: '请输入正确的手机号格式' }))
      return false
    }

    setValidationErrors(prev => ({ ...prev, phone: '' }))
    return true
  }, [])

  // 手机号输入处理
  const handlePhoneInput = useCallback((e: any) => {
    const value = e.detail.value.replace(REGEX.NUMERIC_ONLY, '') // 只保留数字
    setPhoneInput(value)

    if (value) {
      validatePhone(value)
    } else {
      setValidationErrors(prev => ({ ...prev, phone: '' }))
    }
  }, [validatePhone])

  // 验证短信验证码
  const validateSmsCode = useCallback((code: string): boolean => {
    const trimmedCode = code.trim()

    if (!trimmedCode) {
      setValidationErrors(prev => ({ ...prev, smsCode: '验证码不能为空' }))
      return false
    }

    if (trimmedCode.length !== LIMITS.SMS_CODE_LENGTH) {
      setValidationErrors(prev => ({ ...prev, smsCode: `请输入${LIMITS.SMS_CODE_LENGTH}位验证码` }))
      return false
    }

    if (!REGEX.SMS_CODE.test(trimmedCode)) {
      setValidationErrors(prev => ({ ...prev, smsCode: '验证码只能包含数字' }))
      return false
    }

    setValidationErrors(prev => ({ ...prev, smsCode: '' }))
    return true
  }, [])

  // 发送验证码 - iOS 标准流程
  const handleSendSms = useCallback(async () => {
    if (!validatePhone(phoneInput)) {
      return
    }

    if (smsState.countdown > 0) {
      return
    }

    try {
      setSmsState(prev => ({ ...prev, sending: true }))

      // TODO: 调用发送验证码API
      // await sendSmsCode(phoneInput, 'bind')

      // 模拟发送过程
      await new Promise(resolve => setTimeout(resolve, 1500))

      setSmsState(prev => ({
        ...prev,
        sending: false,
        countdown: 60
      }))

      Taro.showToast({
        title: '验证码已发送',
        icon: 'success',
        duration: 2000
      })
    } catch (error) {
      console.error('发送验证码失败:', error)
      setSmsState(prev => ({ ...prev, sending: false }))

      const errorMessage = error instanceof Error ? error.message : '发送失败，请重试'
      Taro.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      })
    }
  }, [phoneInput, smsState.countdown, validatePhone])

  // 验证码输入处理
  const handleSmsCodeChange = useCallback((e: any) => {
    const value = e.detail.value.replace(REGEX.NUMERIC_ONLY, '') // 只保留数字
    setSmsState(prev => ({ ...prev, code: value }))

    if (value) {
      validateSmsCode(value)
    } else {
      setValidationErrors(prev => ({ ...prev, smsCode: '' }))
    }
  }, [validateSmsCode])

  // 绑定手机号 - iOS 标准流程
  const handleBindPhone = useCallback(async () => {
    if (!validatePhone(phoneInput) || !validateSmsCode(smsState.code)) {
      return
    }

    try {
      setSaving(true)

      // TODO: 调用绑定手机号API
      // await bindPhone(phoneInput, smsState.code)

      // 模拟绑定过程
      await new Promise(resolve => setTimeout(resolve, 1500))

      setFormData(prev => ({ ...prev, phone: phoneInput }))
      setOriginalData(prev => ({ ...prev, phone: phoneInput }))
      setShowPhoneBinding(false)
      setPhoneInput('')
      setSmsState({ sending: false, countdown: 0, code: '' })
      setValidationErrors(prev => ({ ...prev, phone: '', smsCode: '' }))

      Taro.showToast({
        title: '绑定成功',
        icon: 'success',
        duration: 2000
      })
    } catch (error) {
      console.error('绑定手机号失败:', error)

      const errorMessage = error instanceof Error ? error.message : '绑定失败，请重试'
      Taro.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      })
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
  }, [])

  // 保存修改 - iOS 标准保存流程
  const handleSave = useCallback(async () => {
    // 验证昵称
    if (!validateNickname(formData.nickname)) {
      return
    }

    // 检查是否有修改
    if (!hasChanges) {
      Taro.showToast({
        title: '没有修改内容',
        icon: 'none',
        duration: 2000
      })
      return
    }

    try {
      setSaving(true)

      // 显示保存进度
      Taro.showLoading({
        title: '保存中...',
        mask: true
      })

      if (state.user?.id) {
        const updateData: any = {}

        if (formData.nickname !== originalData.nickname) {
          updateData.nickname = formData.nickname.trim()
        }

        if (formData.avatarUrl !== originalData.avatarUrl) {
          // TODO: 上传头像到服务器
          // const uploadResult = await uploadImage(formData.avatarUrl)
          // updateData.avatar = uploadResult.url
          updateData.avatar = formData.avatarUrl
        }

        const result = await updateUserInfo(state.user.id, updateData)

        if (result.success) {
          // 更新原始数据
          setOriginalData(formData)

          Taro.hideLoading()
          Taro.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000
          })

          // 延迟返回，让用户看到成功提示
          setTimeout(() => {
            Taro.navigateBack()
          }, 2000)
        } else {
          throw new Error(result.message || '保存失败')
        }
      } else {
        throw new Error('用户信息无效')
      }
    } catch (error) {
      console.error('保存失败:', error)

      Taro.hideLoading()
      const errorMessage = error instanceof Error ? error.message : '保存失败，请重试'
      Taro.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      })
    } finally {
      setSaving(false)
    }
  }, [formData, originalData, state.user?.id, validateNickname, hasChanges])

  // iOS标准加载状态组件
  const LoadingComponent = useMemo(() => (
    <View className='profile-edit-page'>
      <View className='loading-container'>
        <IconFont className='loading-spinner' name='loading' size='24' color='var(--ios-blue)'></IconFont>
        <Text className='loading-text'>加载中...</Text>
      </View>
    </View>
  ), [])

  // 错误状态组件
  const ErrorComponent = useMemo(() => (
    <View className='profile-edit-page'>
      <View className='loading-container'>
        <IconFont name='warning' size='48' color='var(--ios-gray)'></IconFont>
        <Text className='error-title'>加载失败</Text>
        <Text className='loading-text'>{loadingState.error}</Text>
        {canRetry && (
          <View className='error-actions'>
            <View className='ios-button-primary retry-btn' onClick={retryLoad}>
              <Text>重试 ({3 - loadingState.retryCount})</Text>
            </View>
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
        <View className='edit-section'>
          <Text className='section-title'>头像</Text>
          <View className='avatar-edit' onClick={handleChooseAvatar}>
            <Image
              className='avatar-preview'
              src={formData.avatarUrl || 'https://placehold.co/400x400/E5E5EA/8E8E93/png?text=%E5%A4%B4%E5%83%8F'}
              mode='aspectFill'
            />
            <View className='avatar-overlay'>
              <IconFont name='photograph' size='32' color='#fff' />
              <Text className='avatar-tip'>点击更换</Text>
            </View>
          </View>
          <Text className='section-desc'>支持JPG、PNG格式，建议尺寸400x400像素</Text>
        </View>

        {/* 昵称编辑 */}
        <View className='edit-section'>
          <Text className='section-title'>昵称</Text>
          <View className='input-wrapper'>
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
          {validationErrors.nickname && (
            <Text className='error-text'>{validationErrors.nickname}</Text>
          )}
          <Text className='section-desc'>昵称将在个人资料和订单中显示</Text>
        </View>

        {/* 手机号绑定 */}
        <View className='edit-section'>
          <Text className='section-title'>手机号</Text>
          {formData.phone ? (
            <View className='phone-display'>
              <Text className='phone-number'>{formData.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</Text>
              <Text className='phone-status'>已绑定</Text>
            </View>
          ) : (
            <Button
              className='bind-phone-btn'
              onClick={() => setShowPhoneBinding(true)}
            >
              绑定手机号
            </Button>
          )}
          <Text className='section-desc'>绑定手机号用于账户安全和订单通知</Text>
        </View>

        {/* 保存按钮 */}
        <View className='save-section'>
          <Button
            className='save-btn'
            onClick={handleSave}
            loading={saving}
            disabled={!canSave}
          >
            {saving ? '保存中...' : '保存修改'}
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
                  <IconFont name='cross' size='24' color='var(--ios-tertiary-label)' />
                </View>
              </View>

              <View className='modal-body'>
                {/* 手机号输入 */}
                <View className='form-item'>
                  <Text className='form-label'>手机号</Text>
                  <Input
                    className='form-input'
                    type='number'
                    value={phoneInput}
                    placeholder='请输入11位手机号'
                    maxlength={11}
                    onInput={handlePhoneInput}
                    confirmType='next'
                  />
                  {validationErrors.phone && (
                    <Text className='error-text'>{validationErrors.phone}</Text>
                  )}
                </View>

                {/* 验证码输入 */}
                <View className='form-item'>
                  <Text className='form-label'>验证码</Text>
                  <View className='sms-input-wrapper'>
                    <Input
                      className='form-input sms-input'
                      type='number'
                      value={smsState.code}
                      placeholder='请输入6位验证码'
                      maxlength={6}
                      onInput={handleSmsCodeChange}
                      confirmType='done'
                    />
                    <Button
                      className='send-sms-btn'
                      size='mini'
                      onClick={handleSendSms}
                      loading={smsState.sending}
                      disabled={smsState.sending || smsState.countdown > 0 || !phoneInput || !!validationErrors.phone}
                    >
                      {smsState.countdown > 0
                        ? `${smsState.countdown}s`
                        : smsState.sending
                          ? '发送中'
                          : '发送验证码'}
                    </Button>
                  </View>
                  {validationErrors.smsCode && (
                    <Text className='error-text'>{validationErrors.smsCode}</Text>
                  )}
                </View>
              </View>

              <View className='modal-footer'>
                <Button
                  className='confirm-btn'
                  onClick={handleBindPhone}
                  loading={saving}
                  disabled={saving || !phoneInput || !smsState.code || !!validationErrors.phone || !!validationErrors.smsCode}
                >
                  {saving ? '绑定中...' : '确认绑定'}
                </Button>
              </View>
            </View>
          </View>
        )}
      </View>
    </AuthGuard>
  )
}

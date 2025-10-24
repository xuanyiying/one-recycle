import { useState, useEffect, useCallback } from 'react'
import { View, Text, Button, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { IconFont } from '@nutui/icons-react-taro'
import { useAppContext } from '../../../store'
import { getUserInfo, updateUserInfo } from '../../../services/user'
import './index.scss'

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

export default function ProfileEdit() {
  const { state } = useAppContext()
  const [loading, setLoading] = useState(true)
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
  const [nicknameError, setNicknameError] = useState('')
  const [showPhoneBinding, setShowPhoneBinding] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [smsState, setSmsState] = useState<SmsState>({
    sending: false,
    countdown: 0,
    code: ''
  })

  // 加载用户信息
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setLoading(true)
        if (state.user?.id) {
          const result = await getUserInfo(state.user.id)
          if (result.success && result.data) {
            const userData = {
              nickname: result.data.nickname || '',
              avatarUrl: result.data.avatar || '',
              phone: result.data.phone || ''
            }
            setFormData(userData)
            setOriginalData(userData)
          }
        }
      } catch (error) {
        console.error('加载用户信息失败:', error)
        Taro.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        setLoading(false)
      }
    }

    loadUserInfo()
  }, [state.user?.id])

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

  // 选择头像
  const handleChooseAvatar = useCallback(() => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFilePaths[0]
        
        // 压缩图片
        try {
          const compressedResult = await Taro.compressImage({
            src: tempFilePath,
            quality: 80
          })
          
          setFormData(prev => ({
            ...prev,
            avatarUrl: compressedResult.tempFilePath
          }))
          
          Taro.showToast({
            title: '头像已选择',
            icon: 'success'
          })
        } catch (error) {
          console.error('压缩图片失败:', error)
          // 如果压缩失败，使用原图
          setFormData(prev => ({
            ...prev,
            avatarUrl: tempFilePath
          }))
        }
      },
      fail: (error) => {
        console.error('选择图片失败:', error)
        Taro.showToast({
          title: '选择图片失败',
          icon: 'none'
        })
      }
    })
  }, [])

  // 验证昵称
  const validateNickname = useCallback((nickname: string): boolean => {
    if (!nickname || nickname.trim().length === 0) {
      setNicknameError('昵称不能为空')
      return false
    }
    if (nickname.length < 2) {
      setNicknameError('昵称至少2个字符')
      return false
    }
    if (nickname.length > 20) {
      setNicknameError('昵称最多20个字符')
      return false
    }
    setNicknameError('')
    return true
  }, [])

  // 昵称输入
  const handleNicknameChange = useCallback((e: any) => {
    const value = e.detail.value
    setFormData(prev => ({ ...prev, nickname: value }))
    validateNickname(value)
  }, [validateNickname])

  // 验证手机号
  const validatePhone = useCallback((phone: string): boolean => {
    if (!phone || phone.trim().length === 0) {
      setPhoneError('手机号不能为空')
      return false
    }
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      setPhoneError('手机号格式不正确')
      return false
    }
    setPhoneError('')
    return true
  }, [])

  // 手机号输入
  const handlePhoneInput = useCallback((e: any) => {
    const value = e.detail.value
    setPhoneInput(value)
    if (value) {
      validatePhone(value)
    } else {
      setPhoneError('')
    }
  }, [validatePhone])

  // 发送验证码
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
      
      // 模拟发送成功
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSmsState(prev => ({
        ...prev,
        sending: false,
        countdown: 60
      }))
      
      Taro.showToast({
        title: '验证码已发送',
        icon: 'success'
      })
    } catch (error) {
      console.error('发送验证码失败:', error)
      setSmsState(prev => ({ ...prev, sending: false }))
      Taro.showToast({
        title: '发送失败，请重试',
        icon: 'none'
      })
    }
  }, [phoneInput, smsState.countdown, validatePhone])

  // 验证码输入
  const handleSmsCodeChange = useCallback((e: any) => {
    setSmsState(prev => ({ ...prev, code: e.detail.value }))
  }, [])

  // 绑定手机号
  const handleBindPhone = useCallback(async () => {
    if (!validatePhone(phoneInput)) {
      return
    }

    if (!smsState.code || smsState.code.length !== 6) {
      Taro.showToast({
        title: '请输入6位验证码',
        icon: 'none'
      })
      return
    }

    try {
      setSaving(true)
      
      // TODO: 调用绑定手机号API
      // await bindPhone(phoneInput, smsState.code)
      
      // 模拟绑定成功
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setFormData(prev => ({ ...prev, phone: phoneInput }))
      setShowPhoneBinding(false)
      setPhoneInput('')
      setSmsState({ sending: false, countdown: 0, code: '' })
      
      Taro.showToast({
        title: '绑定成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('绑定手机号失败:', error)
      Taro.showToast({
        title: '绑定失败，请重试',
        icon: 'none'
      })
    } finally {
      setSaving(false)
    }
  }, [phoneInput, smsState.code, validatePhone])

  // 保存修改
  const handleSave = useCallback(async () => {
    // 验证昵称
    if (!validateNickname(formData.nickname)) {
      return
    }

    // 检查是否有修改
    const hasChanges = 
      formData.nickname !== originalData.nickname ||
      formData.avatarUrl !== originalData.avatarUrl

    if (!hasChanges) {
      Taro.showToast({
        title: '没有修改',
        icon: 'none'
      })
      return
    }

    try {
      setSaving(true)
      
      if (state.user?.id) {
        const updateData: any = {}
        
        if (formData.nickname !== originalData.nickname) {
          updateData.nickname = formData.nickname
        }
        
        if (formData.avatarUrl !== originalData.avatarUrl) {
          // TODO: 上传头像到服务器
          // const uploadResult = await uploadImage(formData.avatarUrl)
          // updateData.avatar = uploadResult.url
          updateData.avatar = formData.avatarUrl
        }
        
        const result = await updateUserInfo(state.user.id, updateData)
        
        if (result.success) {
          Taro.showToast({
            title: '保存成功',
            icon: 'success'
          })
          
          // 更新原始数据
          setOriginalData(formData)
          
          // 延迟返回
          setTimeout(() => {
            Taro.navigateBack()
          }, 1500)
        } else {
          throw new Error('保存失败')
        }
      }
    } catch (error) {
      console.error('保存失败:', error)
      Taro.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      })
    } finally {
      setSaving(false)
    }
  }, [formData, originalData, state.user?.id, validateNickname])

  if (loading) {
    return (
      <View className='profile-edit-page'>
        <View className='loading-container'>
          <Text className='loading-text'>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='profile-edit-page'>
      {/* 头像编辑 */}
      <View className='edit-section'>
        <Text className='section-title'>头像</Text>
        <View className='avatar-edit' onClick={handleChooseAvatar}>
          <Image
            className='avatar-preview'
            src={formData.avatarUrl || 'https://via.placeholder.com/200'}
            mode='aspectFill'
          />
          <View className='avatar-overlay'>
            <IconFont name='photograph' size='32' color='#fff' />
            <Text className='avatar-tip'>点击更换</Text>
          </View>
        </View>
        <Text className='section-desc'>支持JPG、PNG格式，建议尺寸200x200像素</Text>
      </View>

      {/* 昵称编辑 */}
      <View className='edit-section'>
        <Text className='section-title'>昵称</Text>
        <View className='input-wrapper'>
          <Input
            className='input-field'
            type='text'
            value={formData.nickname}
            placeholder='请输入昵称（2-20个字符）'
            maxlength={20}
            onInput={handleNicknameChange}
          />
          <Text className='input-counter'>{formData.nickname.length}/20</Text>
        </View>
        {nicknameError && (
          <Text className='error-text'>{nicknameError}</Text>
        )}
      </View>

      {/* 手机号绑定 */}
      <View className='edit-section'>
        <Text className='section-title'>手机号</Text>
        {formData.phone ? (
          <View className='phone-display'>
            <Text className='phone-number'>{formData.phone}</Text>
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
      </View>

      {/* 保存按钮 */}
      <View className='save-section'>
        <Button
          className='save-btn'
          onClick={handleSave}
          loading={saving}
          disabled={saving}
        >
          {saving ? '保存中...' : '保存修改'}
        </Button>
      </View>

      {/* 手机号绑定弹窗 */}
      {showPhoneBinding && (
        <View className='phone-binding-modal'>
          <View className='modal-mask' onClick={() => setShowPhoneBinding(false)} />
          <View className='modal-content'>
            <View className='modal-header'>
              <Text className='modal-title'>绑定手机号</Text>
              <View className='close-btn' onClick={() => setShowPhoneBinding(false)}>
                <IconFont name='cross' size='24' color='#666' />
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
                  placeholder='请输入手机号'
                  maxlength={11}
                  onInput={handlePhoneInput}
                />
                {phoneError && (
                  <Text className='error-text'>{phoneError}</Text>
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
                    placeholder='请输入验证码'
                    maxlength={6}
                    onInput={handleSmsCodeChange}
                  />
                  <Button
                    className='send-sms-btn'
                    size='mini'
                    onClick={handleSendSms}
                    loading={smsState.sending}
                    disabled={smsState.sending || smsState.countdown > 0}
                  >
                    {smsState.countdown > 0
                      ? `${smsState.countdown}秒后重试`
                      : smsState.sending
                      ? '发送中...'
                      : '发送验证码'}
                  </Button>
                </View>
              </View>
            </View>

            <View className='modal-footer'>
              <Button
                className='confirm-btn'
                onClick={handleBindPhone}
                loading={saving}
                disabled={saving}
              >
                确认绑定
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

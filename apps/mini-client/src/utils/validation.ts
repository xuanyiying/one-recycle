/**
 * 验证工具类
 * 提供常用的数据验证方法
 */

/**
 * 手机号验证规则
 */
export const PHONE_REGEX = /^1[3-9]\d{9}$/

/**
 * 验证码验证规则（4-6位数字）
 */
export const SMS_CODE_REGEX = /^\d{4,6}$/

/**
 * 验证手机号格式
 * @param phone 手机号
 * @returns 是否有效
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone) return false
  return PHONE_REGEX.test(phone.trim())
}

/**
 * 验证短信验证码格式
 * @param code 验证码
 * @returns 是否有效
 */
export const validateSmsCode = (code: string): boolean => {
  if (!code) return false
  return SMS_CODE_REGEX.test(code.trim())
}

/**
 * 格式化手机号显示（中间4位用*替代）
 * @param phone 手机号
 * @returns 格式化后的手机号
 */
export const formatPhoneDisplay = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 验证邮箱格式
 * @param email 邮箱
 * @returns 是否有效
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * 验证密码强度
 * @param password 密码
 * @returns 验证结果
 */
export const validatePassword = (password: string): {
  isValid: boolean
  message: string
  strength: 'weak' | 'medium' | 'strong'
} => {
  if (!password) {
    return { isValid: false, message: '密码不能为空', strength: 'weak' }
  }

  if (password.length < 6) {
    return { isValid: false, message: '密码长度至少6位', strength: 'weak' }
  }

  if (password.length < 8) {
    return { isValid: true, message: '密码强度较弱', strength: 'weak' }
  }

  const hasNumber = /\d/.test(password)
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (hasNumber && hasLetter && hasSpecial) {
    return { isValid: true, message: '密码强度很强', strength: 'strong' }
  }

  if ((hasNumber && hasLetter) || (hasNumber && hasSpecial) || (hasLetter && hasSpecial)) {
    return { isValid: true, message: '密码强度中等', strength: 'medium' }
  }

  return { isValid: true, message: '密码强度较弱', strength: 'weak' }
}

/**
 * 验证身份证号格式
 * @param idCard 身份证号
 * @returns 是否有效
 */
export const validateIdCard = (idCard: string): boolean => {
  if (!idCard) return false
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return idCardRegex.test(idCard.trim())
}

/**
 * 验证中文姓名
 * @param name 姓名
 * @returns 是否有效
 */
export const validateChineseName = (name: string): boolean => {
  if (!name) return false
  const nameRegex = /^[\u4e00-\u9fa5]{2,10}$/
  return nameRegex.test(name.trim())
}

/**
 * 验证银行卡号
 * @param cardNumber 银行卡号
 * @returns 是否有效
 */
export const validateBankCard = (cardNumber: string): boolean => {
  if (!cardNumber) return false
  const bankCardRegex = /^\d{16,19}$/
  return bankCardRegex.test(cardNumber.trim())
}

/**
 * 通用验证结果接口
 */
export interface ValidationResult {
  isValid: boolean
  message: string
}

/**
 * 验证表单数据
 * @param data 表单数据
 * @param rules 验证规则
 * @returns 验证结果
 */
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, (value: any) => ValidationResult>
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {}
  let isValid = true

  for (const [field, rule] of Object.entries(rules)) {
    const result = rule(data[field])
    if (!result.isValid) {
      errors[field] = result.message
      isValid = false
    }
  }

  return { isValid, errors }
}
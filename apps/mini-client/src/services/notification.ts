import { post } from '../utils/request'

export const sendSmsCode = (mobile: string, type: 'login' | 'register' | 'reset_password' = 'login') => {
    return post('/auth/send-sms-code', { mobile, type })
}

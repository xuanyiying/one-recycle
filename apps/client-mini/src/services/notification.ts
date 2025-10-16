import { post } from '../utils/request'

// 通知相关 API 服务

// 发送短信验证码
export const sendSmsCode = (phoneNumber: string) => {
    return post('/notification/notifications/send-sms', {
        phoneNumber,
        message: '您的验证码是：123456'
    })
}

// 发送邮件
export const sendEmail = (to: string, subject: string, body: string) => {
    return post('/notification/notifications/send-email', {
        to,
        subject,
        body
    })
}

// 发送推送通知
export const sendPush = (userId: string, title: string, body: string) => {
    return post('/notification/notifications/send-push', {
        userId,
        title,
        body
    })
}
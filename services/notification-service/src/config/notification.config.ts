import { registerAs } from '@nestjs/config';

export const notificationConfig = registerAs('notification', () => ({
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || '',
    },
    from: process.env.EMAIL_FROM || 'noreply@onerecycle.com',
  },
  sms: {
    provider: process.env.SMS_PROVIDER || 'twilio',
    apiKey: process.env.SMS_API_KEY || '',
    apiSecret: process.env.SMS_API_SECRET || '',
    from: process.env.SMS_FROM || '+1234567890',
  },
  push: {
    fcmServerKey: process.env.FCM_SERVER_KEY || '',
    apnsKeyId: process.env.APNS_KEY_ID || '',
    apnsTeamId: process.env.APNS_TEAM_ID || '',
    apnsPrivateKey: process.env.APNS_PRIVATE_KEY || '',
  },
}));
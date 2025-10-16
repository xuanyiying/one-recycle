import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Post('send-sms')
    async sendSms(@Body() smsData: { phoneNumber: string; message: string }): Promise<any> {
        return this.notificationService.sendSms(smsData.phoneNumber, smsData.message);
    }

    @Post('send-email')
    async sendEmail(@Body() emailData: { to: string; subject: string; body: string }): Promise<any> {
        return this.notificationService.sendEmail(emailData.to, emailData.subject, emailData.body);
    }

    @Post('send-push')
    async sendPush(@Body() pushData: { userId: string; title: string; body: string }): Promise<any> {
        return this.notificationService.sendPush(pushData.userId, pushData.title, pushData.body);
    }
}
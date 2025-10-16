import { Controller, Post, Body } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Controller('notifications')
export class NotificationController {
    constructor(private readonly httpService: HttpService) { }

    @Post('send-sms')
    async sendSms(@Body() smsData: { phoneNumber: string; message: string }): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.post('http://notification-service:3004/notifications/send-sms', smsData);
    }

    @Post('send-email')
    async sendEmail(@Body() emailData: { to: string; subject: string; body: string }): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.post('http://notification-service:3004/notifications/send-email', emailData);
    }

    @Post('send-push')
    async sendPush(@Body() pushData: { userId: string; title: string; body: string }): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.post('http://notification-service:3004/notifications/send-push', pushData);
    }
}
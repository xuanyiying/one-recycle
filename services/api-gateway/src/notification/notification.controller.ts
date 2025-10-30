import { Controller, Post, Body } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Controller('notifications')
export class NotificationController {
    constructor(private readonly httpService: HttpService) { }

    @Post('send-sms')
    sendSms(@Body() smsData: { phoneNumber: string; message: string }): Observable<AxiosResponse<any>> {
        return this.httpService.post('http://notification-service:3004/notifications/send-sms', smsData);
    }

    @Post('send-email')
    sendEmail(@Body() emailData: { to: string; subject: string; body: string }): Observable<AxiosResponse<any>> {
        return this.httpService.post('http://notification-service:3004/notifications/send-email', emailData);
    }

    @Post('send-push')
    sendPush(@Body() pushData: { userId: string; title: string; body: string }): Observable<AxiosResponse<any>> {
        return this.httpService.post('http://notification-service:3004/notifications/send-push', pushData);
    }
}
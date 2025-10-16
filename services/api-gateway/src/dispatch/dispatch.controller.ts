import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Controller('dispatch')
export class DispatchController {
    constructor(private readonly httpService: HttpService) { }

    @Post('assign')
    async assignOrder(@Body() assignData: { orderId: string; courierId: string }): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.post('http://dispatch-service:3006/dispatch/assign', assignData);
    }

    @Get('assignments')
    async getAllAssignments(): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.get('http://dispatch-service:3006/dispatch/assignments');
    }

    @Get('assignments/:id')
    async getAssignment(@Param('id') id: string): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.get(`http://dispatch-service:3006/dispatch/assignments/${id}`);
    }

    @Put('assignments/:id/status')
    async updateAssignmentStatus(@Param('id') id: string, @Body() statusData: { status: string }): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.put(`http://dispatch-service:3006/dispatch/assignments/${id}/status`, statusData);
    }

    @Post('assignments/:id/accept')
    async acceptAssignment(@Param('id') id: string): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.post(`http://dispatch-service:3006/dispatch/assignments/${id}/accept`);
    }

    @Post('assignments/:id/reject')
    async rejectAssignment(@Param('id') id: string): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.post(`http://dispatch-service:3006/dispatch/assignments/${id}/reject`);
    }
}
import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Controller('orders')
export class OrderController {
    constructor(private readonly httpService: HttpService) { }

    @Post()
    async createOrder(@Body() orderData: any): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.post('http://order-service:3002/orders', orderData);
    }

    @Get(':id')
    async getOrder(@Param('id') id: string): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.get(`http://order-service:3002/orders/${id}`);
    }

    @Get('user/:userId')
    async getOrdersByUser(@Param('userId') userId: string): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.get(`http://order-service:3002/orders/user/${userId}`);
    }

    @Put(':id/cancel')
    async cancelOrder(@Param('id') id: string): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.put(`http://order-service:3002/orders/${id}/cancel`);
    }

    @Put(':id/status')
    async updateOrderStatus(@Param('id') id: string, @Body() statusData: { status: string }): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.put(`http://order-service:3002/orders/${id}/status`, statusData);
    }

    @Get('statistics/user/:userId')
    async getUserStatistics(@Param('userId') userId: string): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.get(`http://order-service:3002/statistics/user/${userId}`);
    }
}
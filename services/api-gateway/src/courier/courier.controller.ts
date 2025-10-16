import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Controller('couriers')
export class CourierController {
    constructor(private readonly httpService: HttpService) { }

    @Get()
    async getAllCouriers(): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.get('http://courier-service:3005/couriers');
    }

    @Get(':id')
    async getCourier(@Param('id') id: string): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.get(`http://courier-service:3005/couriers/${id}`);
    }

    @Post()
    async createCourier(@Body() courierData: any): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.post('http://courier-service:3005/couriers', courierData);
    }

    @Put(':id')
    async updateCourier(@Param('id') id: string, @Body() courierData: any): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.put(`http://courier-service:3005/couriers/${id}`, courierData);
    }

    @Delete(':id')
    async deleteCourier(@Param('id') id: string): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.delete(`http://courier-service:3005/couriers/${id}`);
    }

    @Get(':id/assignments')
    async getCourierAssignments(@Param('id') id: string): Promise<Observable<AxiosResponse<any>>> {
        return this.httpService.get(`http://courier-service:3005/couriers/${id}/assignments`);
    }
}
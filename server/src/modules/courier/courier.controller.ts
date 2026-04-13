import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { CourierService } from './courier.service';
import { CreateCourierDto } from './dto/create-courier.dto';
import { UpdateCourierDto } from './dto/update-courier.dto';
import { CreatePickupNotificationDto } from './dto/create-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { UpdateTaskStatusDto } from './dto/update-task.dto';

@Controller('couriers')
export class CourierController {
  constructor(private readonly courierService: CourierService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCourier(@Body() createCourierDto: CreateCourierDto) {
    return this.courierService.createCourier(createCourierDto);
  }

  @Get()
  async findAllCouriers(
    @Query('status') status?: string,
    @Query('serviceArea') serviceArea?: string,
    @Query('rating') rating?: number,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('radius') radius?: number,
  ) {
    const filters: any = {};
    if (status) filters.status = status;
    if (serviceArea) filters.serviceArea = serviceArea;
    if (rating) filters.rating = Number(rating);
    if (latitude && longitude && radius) {
      filters.location = {
        latitude: Number(latitude),
        longitude: Number(longitude),
        radius: Number(radius),
      };
    }
    return this.courierService.findAll(
      Object.keys(filters).length ? filters : undefined,
    );
  }

  @Get('available')
  async findAvailableCouriers(
    @Query('serviceArea') serviceArea?: string,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('radius') radius?: number,
  ) {
    let location;
    if (latitude && longitude && radius) {
      location = {
        latitude: Number(latitude),
        longitude: Number(longitude),
        radius: Number(radius),
      };
    }
    return this.courierService.findAvailableCouriers(serviceArea, location);
  }

  @Get(':id')
  async findOneCourier(@Param('id') id: string) {
    return this.courierService.findOne(id);
  }

  @Put(':id')
  async updateCourier(
    @Param('id') id: string,
    @Body() updateCourierDto: UpdateCourierDto,
  ) {
    return this.courierService.update(id, updateCourierDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCourier(@Param('id') id: string) {
    return this.courierService.remove(id);
  }

  @Put(':id/location')
  async updateCourierLocation(
    @Param('id') id: string,
    @Body()
    locationData: { latitude: number; longitude: number; address?: string },
  ) {
    if (!locationData.latitude || !locationData.longitude) {
      throw new BadRequestException('Latitude and longitude are required');
    }
    const updateData = {
      latitude: Number(locationData.latitude),
      longitude: Number(locationData.longitude),
      address: locationData.address || '',
    };
    return this.courierService.updateLocation(id, updateData);
  }

  @Get(':id/performance')
  async getCourierPerformance(
    @Param('id') id: string,
    @Query('period') period: string,
  ) {
    if (!period) {
      throw new BadRequestException(
        'Period parameter is required (format: YYYY-MM)',
      );
    }
    const periodRegex = /^\d{4}-\d{2}$/;
    if (!periodRegex.test(period)) {
      throw new BadRequestException('Invalid period format. Use YYYY-MM');
    }
    return this.courierService.getCourierPerformance(id, period);
  }

  @Get(':id/assignments')
  async getCourierAssignments(
    @Param('id') id: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('orderId') orderId?: string,
  ) {
    const filters: any = {};
    if (status) filters.status = status;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (orderId) filters.orderId = orderId;
    return this.courierService.findCourierAssignments(
      id,
      Object.keys(filters).length ? filters : undefined,
    );
  }

  @Post('notifications')
  @HttpCode(HttpStatus.CREATED)
  async createPickupNotification(
    @Body() createNotificationDto: CreatePickupNotificationDto,
  ) {
    return this.courierService.createPickupNotification(createNotificationDto);
  }

  @Get('notifications')
  async findNotifications(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    return this.courierService.findNotifications(
      Object.keys(filters).length ? filters : undefined,
    );
  }

  @Post('notifications/:notificationId/respond')
  @HttpCode(HttpStatus.OK)
  async respondToNotification(
    @Param('notificationId') notificationId: string,
    @Body() responseData: NotificationResponseDto & { courierId: string },
  ) {
    if (!responseData.courierId) {
      throw new BadRequestException('Courier ID is required');
    }
    return this.courierService.respondToNotification(
      notificationId,
      responseData.courierId,
      responseData,
    );
  }

  @Put('tasks/:taskId/status')
  async updateTaskStatus(
    @Param('taskId') taskId: string,
    @Body() updateData: UpdateTaskStatusDto & { courierId: string },
  ) {
    if (!updateData.courierId) {
      throw new BadRequestException('Courier ID is required');
    }
    return this.courierService.updateTaskStatus(
      taskId,
      updateData.courierId,
      updateData,
    );
  }

  @Get('utils/distance')
  calculateDistance(
    @Query('fromLat') fromLat: number,
    @Query('fromLng') fromLng: number,
    @Query('toLat') toLat: number,
    @Query('toLng') toLng: number,
  ) {
    if (!fromLat || !fromLng || !toLat || !toLng) {
      throw new BadRequestException('All coordinates are required');
    }
    const distance = this.courierService.calculateDistance(
      { latitude: Number(fromLat), longitude: Number(fromLng) },
      { latitude: Number(toLat), longitude: Number(toLng) },
    );
    return { distance };
  }
}

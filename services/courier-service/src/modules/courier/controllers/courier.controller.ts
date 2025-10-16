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
  Logger,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { CourierService } from '../services/courier.service';
import { CreateCourierDto } from '../dto/create-courier.dto';
import { UpdateCourierDto } from '../dto/update-courier.dto';
import { CreatePickupNotificationDto } from '../dto/create-notification.dto';
import { NotificationResponseDto } from '../dto/notification-response.dto';
import { UpdateTaskStatusDto } from '../dto/update-task.dto';
import { 
  CourierEntity, 
  PickupNotificationEntity, 
  TaskAssignmentEntity, 
  CourierPerformanceEntity,
  CourierStatus,
  NotificationStatus,
  TaskStatus
} from '../entities/courier.entity';

@Controller('couriers')
export class CourierController {
  private readonly logger = new Logger(CourierController.name);

  constructor(private readonly courierService: CourierService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCourier(@Body() createCourierDto: CreateCourierDto): Promise<CourierEntity> {
    try {
      return await this.courierService.createCourier(createCourierDto);
    } catch (error) {
      this.logger.error(`Failed to create courier: ${error.message}`);
      throw error;
    }
  }

  @Get()
  async findAllCouriers(
    @Query('status') status?: CourierStatus,
    @Query('serviceArea') serviceArea?: string,
    @Query('rating') rating?: number,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('radius') radius?: number
  ): Promise<CourierEntity[]> {
    try {
      const filters: any = {};
      
      if (status) filters.status = status;
      if (serviceArea) filters.serviceArea = serviceArea;
      if (rating) filters.rating = Number(rating);
      if (latitude && longitude && radius) {
        filters.location = {
          latitude: Number(latitude),
          longitude: Number(longitude),
          radius: Number(radius)
        };
      }

      return await this.courierService.findAll(Object.keys(filters).length > 0 ? filters : undefined);
    } catch (error) {
      this.logger.error(`Failed to find couriers: ${error.message}`);
      throw error;
    }
  }

  @Get('available')
  async findAvailableCouriers(
    @Query('serviceArea') serviceArea?: string,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('radius') radius?: number
  ): Promise<CourierEntity[]> {
    try {
      let location;
      if (latitude && longitude && radius) {
        location = {
          latitude: Number(latitude),
          longitude: Number(longitude),
          radius: Number(radius)
        };
      }

      return await this.courierService.findAvailableCouriers(serviceArea, location);
    } catch (error) {
      this.logger.error(`Failed to find available couriers: ${error.message}`);
      throw error;
    }
  }

  @Get(':id')
  async findOneCourier(@Param('id') id: string): Promise<CourierEntity> {
    try {
      return await this.courierService.findOne(id);
    } catch (error) {
      this.logger.error(`Failed to find courier ${id}: ${error.message}`);
      throw error;
    }
  }

  @Put(':id')
  async updateCourier(
    @Param('id') id: string,
    @Body() updateCourierDto: UpdateCourierDto
  ): Promise<CourierEntity> {
    try {
      return await this.courierService.update(id, updateCourierDto);
    } catch (error) {
      this.logger.error(`Failed to update courier ${id}: ${error.message}`);
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCourier(@Param('id') id: string): Promise<{ success: boolean }> {
    try {
      return await this.courierService.remove(id);
    } catch (error) {
      this.logger.error(`Failed to remove courier ${id}: ${error.message}`);
      throw error;
    }
  }

  @Put(':id/location')
  async updateCourierLocation(
    @Param('id') id: string,
    @Body() locationData: { latitude: number; longitude: number; address?: string }
  ): Promise<CourierEntity> {
    try {
      if (!locationData.latitude || !locationData.longitude) {
        throw new BadRequestException('Latitude and longitude are required');
      }

      const updateData = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address || ''
      };

      return await this.courierService.updateLocation(id, updateData);
    } catch (error) {
      this.logger.error(`Failed to update courier location ${id}: ${error.message}`);
      throw error;
    }
  }

  @Get(':id/performance')
  async getCourierPerformance(
    @Param('id') id: string,
    @Query('period') period: string
  ): Promise<CourierPerformanceEntity> {
    try {
      if (!period) {
        throw new BadRequestException('Period parameter is required (format: YYYY-MM)');
      }

      // 验证期间格式
      const periodRegex = /^\d{4}-\d{2}$/;
      if (!periodRegex.test(period)) {
        throw new BadRequestException('Invalid period format. Use YYYY-MM');
      }

      return await this.courierService.getCourierPerformance(id, period);
    } catch (error) {
      this.logger.error(`Failed to get courier performance ${id}: ${error.message}`);
      throw error;
    }
  }

  @Get(':id/assignments')
  async getCourierAssignments(
    @Param('id') id: string,
    @Query('status') status?: TaskStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('orderId') orderId?: string
  ): Promise<TaskAssignmentEntity[]> {
    try {
      const filters: any = {};
      
      if (status) filters.status = status;
      if (startDate) filters.startDate = new Date(startDate);
      if (endDate) filters.endDate = new Date(endDate);
      if (orderId) filters.orderId = orderId;

      return await this.courierService.findCourierAssignments(
        id, 
        Object.keys(filters).length > 0 ? filters : undefined
      );
    } catch (error) {
      this.logger.error(`Failed to get courier assignments ${id}: ${error.message}`);
      throw error;
    }
  }

  @Post('notifications')
  @HttpCode(HttpStatus.CREATED)
  async createPickupNotification(
    @Body() createNotificationDto: CreatePickupNotificationDto
  ): Promise<PickupNotificationEntity> {
    try {
      return await this.courierService.createPickupNotification(createNotificationDto);
    } catch (error) {
      this.logger.error(`Failed to create pickup notification: ${error.message}`);
      throw error;
    }
  }

  @Get('notifications')
  async findNotifications(
    @Query('status') status?: NotificationStatus,
    @Query('priority') priority?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<PickupNotificationEntity[]> {
    try {
      const filters: any = {};
      
      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (startDate) filters.startDate = new Date(startDate);
      if (endDate) filters.endDate = new Date(endDate);

      return await this.courierService.findNotifications(
        Object.keys(filters).length > 0 ? filters : undefined
      );
    } catch (error) {
      this.logger.error(`Failed to find notifications: ${error.message}`);
      throw error;
    }
  }

  @Post('notifications/:notificationId/respond')
  @HttpCode(HttpStatus.OK)
  async respondToNotification(
    @Param('notificationId') notificationId: string,
    @Body() responseData: NotificationResponseDto & { courierId: string }
  ): Promise<PickupNotificationEntity> {
    try {
      if (!responseData.courierId) {
        throw new BadRequestException('Courier ID is required');
      }

      return await this.courierService.respondToNotification(
        notificationId,
        responseData.courierId,
        responseData
      );
    } catch (error) {
      this.logger.error(`Failed to respond to notification ${notificationId}: ${error.message}`);
      throw error;
    }
  }

  @Put('tasks/:taskId/status')
  async updateTaskStatus(
    @Param('taskId') taskId: string,
    @Body() updateData: UpdateTaskStatusDto & { courierId: string }
  ): Promise<TaskAssignmentEntity> {
    try {
      if (!updateData.courierId) {
        throw new BadRequestException('Courier ID is required');
      }

      return await this.courierService.updateTaskStatus(
        taskId,
        updateData.courierId,
        updateData
      );
    } catch (error) {
      this.logger.error(`Failed to update task status ${taskId}: ${error.message}`);
      throw error;
    }
  }

  @Get('utils/distance')
  async calculateDistance(
    @Query('fromLat') fromLat: number,
    @Query('fromLng') fromLng: number,
    @Query('toLat') toLat: number,
    @Query('toLng') toLng: number
  ): Promise<{ distance: number }> {
    try {
      if (!fromLat || !fromLng || !toLat || !toLng) {
        throw new BadRequestException('All coordinates are required');
      }

      const distance = this.courierService.calculateDistance(
        { latitude: Number(fromLat), longitude: Number(fromLng) },
        { latitude: Number(toLat), longitude: Number(toLng) }
      );

      return { distance };
    } catch (error) {
      this.logger.error(`Failed to calculate distance: ${error.message}`);
      throw error;
    }
  }
}
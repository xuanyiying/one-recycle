import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from '../services/staff.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RequestWithStaff } from '@/common';

@ApiTags('租户员工管理')
@Controller('tenant/staffs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @ApiOperation({ summary: '获取员工列表' })
  async findAll(
    @Request() req: RequestWithStaff,
    @Query('tenantId') tenantId?: string,
    @Query('username') username?: string,
    @Query('roleCode') roleCode?: string,
    @Query('status') status?: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // 如果不是系统管理员，只能查询自己租户下的员工
    const effectiveTenantId =
      req.user.type === 'admin' ? tenantId : req.user.tenantId;

    return this.staffService.findAll({
      tenantId: effectiveTenantId,
      username,
      roleCode,
      status,
      skip,
      take,
    });
  }

  @Post()
  @ApiOperation({ summary: '创建员工' })
  async create(@Request() req: RequestWithStaff, @Body() data: any) {
    // 自动注入当前登录用户的租户ID
    const tenantId =
      req.user.type === 'admin' ? data.tenantId : req.user.tenantId;
    return this.staffService.create({
      ...data,
      tenantId,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: '更新员工' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.staffService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除员工' })
  async remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}

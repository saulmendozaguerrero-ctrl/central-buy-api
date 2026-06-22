import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('metrics')
  @ApiOperation({ summary: '[Admin] Get business metrics: MRR, churn, subscribers' })
  async getMetrics() {
    return this.adminService.getMetrics();
  }

  @Get('users')
  @ApiOperation({ summary: '[Admin] List all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getUsers(page, limit);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: '[Admin] List all subscriptions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSubscriptions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getSubscriptions(page, limit);
  }

  @Post('settings')
  @ApiOperation({ summary: '[Admin] Update app settings' })
  async updateSettings(@Body() settings: Record<string, any>) {
    return this.adminService.updateSettings(settings);
  }
}

import {
  Controller,
  Get,
  UseGuards,
  Req,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private async checkAdminAccess(req: any) {
    const user = req.user;
    if (user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get('dashboard')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin dashboard stats' })
  async getDashboard(@Req() req: any) {
    await this.checkAdminAccess(req);
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all users with pagination' })
  async getUsers(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    await this.checkAdminAccess(req);
    return this.adminService.getAllUsers(page, limit);
  }

  @Get('users/by-plan')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Users grouped by plan' })
  async getUsersByPlan(@Req() req: any) {
    await this.checkAdminAccess(req);
    return this.adminService.getUsersByPlan();
  }

  @Get('reports/usage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Usage reports and analytics' })
  async getUsageReport(
    @Req() req: any,
    @Query('days') days: number = 30,
  ) {
    await this.checkAdminAccess(req);
    return this.adminService.getUsageReport(days);
  }

  @Get('reports/revenue')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revenue from Stripe' })
  async getRevenueReport(@Req() req: any) {
    await this.checkAdminAccess(req);
    return this.adminService.getRevenueReport();
  }

  @Get('reports/onboarding')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Onboarding completion rates' })
  async getOnboardingReport(@Req() req: any) {
    await this.checkAdminAccess(req);
    return this.adminService.getOnboardingReport();
  }
}

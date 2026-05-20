import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FleetService } from './fleet.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CreateFuelLogDto } from './dto/create-fuel-log.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PlanGuard } from '../../common/guards/plan.guard';
import { PlanRequired } from '../../common/decorators/plan-required.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Fleet')
@Controller('fleet')
@UseGuards(AuthGuard, PlanGuard)
@PlanRequired('empresa')
@ApiBearerAuth()
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  // ─── Vehicles ─────────────────────────────────────────────────────────────

  @Get('vehicles')
  @ApiOperation({ summary: '[Empresa] List organization vehicles' })
  async getVehicles(@CurrentUser() user: User) {
    return this.fleetService.getVehicles(user.id); // orgId resolved per user in org context
  }

  @Post('vehicles')
  @ApiOperation({ summary: '[Empresa] Add a vehicle to the fleet' })
  async createVehicle(@Body() dto: CreateVehicleDto, @CurrentUser() user: User) {
    return this.fleetService.createVehicle(user.id, dto);
  }

  @Patch('vehicles/:id')
  @ApiOperation({ summary: '[Empresa] Update vehicle data' })
  async updateVehicle(
    @Param('id') id: string,
    @Body() dto: Partial<CreateVehicleDto>,
    @CurrentUser() user: User,
  ) {
    return this.fleetService.updateVehicle(id, user.id, dto);
  }

  @Delete('vehicles/:id')
  @ApiOperation({ summary: '[Empresa] Deactivate a vehicle' })
  async deleteVehicle(@Param('id') id: string, @CurrentUser() user: User) {
    await this.fleetService.deleteVehicle(id, user.id);
    return { deleted: true };
  }

  // ─── Fuel Logs ────────────────────────────────────────────────────────────

  @Post('fuel-logs')
  @ApiOperation({ summary: '[Empresa] Record a fuel fill-up' })
  async createFuelLog(@Body() dto: CreateFuelLogDto, @CurrentUser() user: User) {
    return this.fleetService.createFuelLog(user.id, user.id, dto);
  }

  @Get('fuel-logs')
  @ApiOperation({ summary: '[Empresa] Get fuel log history' })
  @ApiQuery({ name: 'vehicleId', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getFuelLogs(
    @CurrentUser() user: User,
    @Query('vehicleId') vehicleId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.fleetService.getFuelLogs(user.id, vehicleId, from, to);
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────

  @Get('dashboard')
  @ApiOperation({ summary: '[Empresa] Fleet spending dashboard summary' })
  async getDashboard(@CurrentUser() user: User) {
    return this.fleetService.getDashboard(user.id);
  }

  // ─── Eco Scores ──────────────────────────────────────────────────────────

  @Get('eco-scores')
  @ApiOperation({ summary: '[Empresa] Get eco-driving scores for all drivers' })
  async getEcoScores(@CurrentUser() user: User) {
    return this.fleetService.getEcoScores(user.id);
  }

  @Get('eco-scores/driver/:driverId')
  @ApiOperation({ summary: '[Empresa] Get eco-driving score history for a driver' })
  async getDriverScore(
    @Param('driverId') driverId: string,
    @CurrentUser() user: User,
  ) {
    return this.fleetService.getDriverEcoScore(driverId, user.id);
  }
}

import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { PlanType } from '../users/entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sync-plan')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sync plan from Clerk metadata to database' })
  async syncPlan(
    @Req() req: any,
    @Body('planType') planType: string,
  ) {
    const userId = req.user.id;

    if (!Object.values(PlanType).includes(planType as PlanType)) {
      throw new BadRequestException(
        `Invalid plan type. Must be: ${Object.values(PlanType).join(', ')}`,
      );
    }

    const user = await this.usersService.changePlan(userId, planType as PlanType);

    // Reset onboarding
    await this.usersService.updateProfile(userId, {
      onboardingCompleted: false,
    });

    return {
      success: true,
      message: `Plan set to ${planType}`,
      data: {
        userId,
        plan: user.planType,
        onboardingRequired: true,
      },
    };
  }

  @Post('check-onboarding')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if user completed onboarding' })
  async checkOnboarding(@Req() req: any) {
    const userId = req.user.id;
    const user = await this.usersService.findById(userId);
    const profile = await this.usersService.getProfile(userId);

    return {
      success: true,
      data: {
        userId,
        plan: user.planType,
        onboardingCompleted: profile?.onboardingCompleted || false,
      },
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get full user profile with personalization data' })
  async getProfile(@Req() req: any) {
    const userId = req.user.id;
    const user = await this.usersService.findById(userId);
    const profile = await this.usersService.getProfile(userId);

    return {
      success: true,
      data: {
        userId,
        email: user.email,
        name: user.name || null,
        plan: user.planType,
        onboardingCompleted: profile?.onboardingCompleted || false,
        // Particulares
        numberOfTripsMonthly: profile?.numberOfTripsMonthly || null,
        fuelTypes: profile?.fuelTypes || [],
        primaryLocation: profile?.primaryLocation || null,
        phoneNotifications: profile?.phoneNotifications || false,
        emailNotifications: profile?.emailNotifications || false,
        // Empresas
        taxId: profile?.taxId || null,
        companySize: profile?.companySize || null,
        monthlyVolumeLiters: profile?.monthlyVolumeLiters || null,
        locations: profile?.locations || [],
        teamSize: profile?.teamSize || null,
        alertsEnabled: profile?.alertsEnabled || false,
        fleetSize: profile?.preferencesData?.fleetSize || null,
        companyName: profile?.preferencesData?.companyName || null,
        // Extra
        preferencesData: profile?.preferencesData || {},
      },
    };
  }

  @Put('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile personalization data' })
  async updateProfile(@Req() req: any, @Body() body: Record<string, any>) {
    const userId = req.user.id;
    const allowed = [
      'numberOfTripsMonthly', 'fuelTypes', 'primaryLocation',
      'phoneNotifications', 'emailNotifications', 'taxId',
      'companySize', 'monthlyVolumeLiters', 'locations',
      'teamSize', 'alertsEnabled', 'preferencesData',
    ];
    const update: Record<string, any> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    // Save fleetSize + companyName inside preferencesData
    if (body.fleetSize !== undefined || body.companyName !== undefined) {
      const profile = await this.usersService.getProfile(userId);
      update.preferencesData = {
        ...(profile?.preferencesData || {}),
        ...(body.fleetSize !== undefined ? { fleetSize: body.fleetSize } : {}),
        ...(body.companyName !== undefined ? { companyName: body.companyName } : {}),
      };
    }
    await this.usersService.updateProfile(userId, update);
    await this.usersService.completeOnboarding(userId);
    return { success: true, message: 'Profile updated' };
  }
}

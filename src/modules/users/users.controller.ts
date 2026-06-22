import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OnboardingParticularDto } from './dto/onboarding-particular.dto';
import { OnboardingEmpresaDto } from './dto/onboarding-empresa.dto';
import { PlanType } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getCurrentUser(@Req() req: any) {
    const userId = req.user.id;
    const user = await this.usersService.findById(userId);
    const profile = await this.usersService.getProfile(userId);
    
    return {
      success: true,
      data: {
        user,
        profile,
      },
    };
  }

  @Post('onboarding/particular')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete onboarding for particular users' })
  async completeParticularOnboarding(
    @Req() req: any,
    @Body() dto: OnboardingParticularDto,
  ) {
    const userId = req.user.id;
    const user = await this.usersService.findById(userId);

    if (user.planType !== PlanType.PARTICULAR) {
      throw new BadRequestException('This endpoint is only for particular users');
    }

    await this.usersService.updateProfile(userId, {
      numberOfTripsMonthly: dto.numberOfTripsMonthly,
      fuelTypes: dto.fuelTypes,
      primaryLocation: dto.primaryLocation,
      phoneNotifications: dto.phoneNotifications,
      emailNotifications: dto.emailNotifications,
    });

    await this.usersService.completedOnboarding(userId);

    return {
      success: true,
      message: 'Onboarding completed for particular user',
      data: {
        userId,
        plan: 'particular',
      },
    };
  }

  @Post('onboarding/empresa')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete onboarding for empresa users' })
  async completeEmpresaOnboarding(
    @Req() req: any,
    @Body() dto: OnboardingEmpresaDto,
  ) {
    const userId = req.user.id;
    const user = await this.usersService.findById(userId);

    if (user.planType !== PlanType.EMPRESA) {
      throw new BadRequestException('This endpoint is only for empresa users');
    }

    await this.usersService.updateProfile(userId, {
      taxId: dto.taxId,
      companySize: dto.companySize,
      monthlyVolumeLiters: dto.monthlyVolumeLiters,
      locations: dto.locations,
      teamSize: dto.teamSize,
      alertsEnabled: dto.alertsEnabled,
    });

    await this.usersService.completedOnboarding(userId);

    return {
      success: true,
      message: 'Onboarding completed for empresa user',
      data: {
        userId,
        plan: 'empresa',
      },
    };
  }

  @Patch('plan')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user plan (particular ↔ empresa)' })
  async changePlan(
    @Req() req: any,
    @Body('planType') newPlan: PlanType,
  ) {
    const userId = req.user.id;

    if (!Object.values(PlanType).includes(newPlan)) {
      throw new BadRequestException(`Invalid plan type: ${newPlan}`);
    }

    const user = await this.usersService.changePlan(userId, newPlan);

    // Reset onboarding cuando cambia plan
    await this.usersService.updateProfile(userId, {
      onboardingCompleted: false,
    });

    return {
      success: true,
      message: `Plan changed to ${newPlan}`,
      data: {
        userId,
        previousPlan: user.planType,
        newPlan,
      },
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile preferences' })
  async getProfile(@Req() req: any) {
    const userId = req.user.id;
    const profile = await this.usersService.getProfile(userId);

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return {
      success: true,
      data: profile,
    };
  }
}

import {
  Controller,
  Post,
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
}

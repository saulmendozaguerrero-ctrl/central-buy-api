import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register user after Clerk sign-up (PUBLIC)' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() dto: RegisterDto) {
    // Public endpoint: Clerk authentication happens on frontend
    // We just register them in our database with their clerkUserId
    try {
      return await this.authService.register(dto, dto.clerkUserId);
    } catch (error: any) {
      // If user already exists, return existing user
      if (error.message?.includes('already registered')) {
        return this.usersService.findByClerkId(dto.clerkUserId);
      }
      throw error;
    }
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  async getMe(@CurrentUser() user: User) {
    return this.usersService.findOne(user.id);
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@CurrentUser() user: User, @Body() dto: Partial<RegisterDto>) {
    return this.usersService.update(user.id, dto);
  }

  @Post('webhook/clerk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clerk webhook handler' })
  async clerkWebhook(@Body() body: any) {
    // Clerk sends webhooks for user creation/updates
    // Handle accordingly
    return { received: true };
  }
}

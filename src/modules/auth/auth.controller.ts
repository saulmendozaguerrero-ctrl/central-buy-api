import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register user after Clerk sign-up (PUBLIC)' })
  async register(@Body() dto: RegisterDto) {
    try {
      return await this.authService.register(dto, dto.clerkUserId);
    } catch (error: any) {
      if (error.status === 409) {
        return { message: 'User already registered', email: dto.email };
      }
      throw error;
    }
  }

  @Post('webhook/clerk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clerk webhook' })
  async clerkWebhook(@Body() body: any) {
    return this.authService.handleClerkWebhook(body);
  }
}

import {
 Controller,
 Post,
 Body,
 HttpCode,
 HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
 constructor(
 private readonly authService: AuthService,
 private readonly usersService: UsersService,
 ) {}

 @Post('register')
 @HttpCode(HttpStatus.CREATED)
 @ApiOperation({ summary: 'Register user after Clerk sign-up' })
 @ApiResponse({ status: 201, description: 'User registered successfully' })
 async register(@Body() dto: RegisterDto) {
 // Clerk already authenticated the user on frontend
 // We just register them in our database
 return this.authService.register(dto, dto.clerkUserId);
 }
}

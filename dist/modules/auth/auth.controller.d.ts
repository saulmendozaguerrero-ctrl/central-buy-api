import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(dto: RegisterDto): Promise<User | null>;
    getMe(user: User): Promise<User>;
    updateMe(user: User, dto: Partial<RegisterDto>): Promise<User>;
    clerkWebhook(body: any): Promise<{
        received: boolean;
    }>;
}

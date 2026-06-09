import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<import("../users/entities/user.entity").User | {
        message: string;
        email: string;
    }>;
    clerkWebhook(body: any): Promise<void>;
}

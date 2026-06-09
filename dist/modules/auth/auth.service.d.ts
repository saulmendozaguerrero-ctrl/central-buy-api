import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    register(dto: RegisterDto, clerkUserId: string): Promise<User>;
    getMe(userId: string): Promise<User>;
    handleClerkWebhook(event: {
        type: string;
        data: {
            id: string;
            email_addresses: {
                email_address: string;
            }[];
            first_name?: string;
            last_name?: string;
        };
    }): Promise<void>;
}

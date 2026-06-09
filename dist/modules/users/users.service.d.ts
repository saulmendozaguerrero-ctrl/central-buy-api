import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    findById(id: string): Promise<User>;
    findByClerkId(clerkUserId: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, dto: UpdateUserDto): Promise<User>;
    findAll(page?: number, limit?: number): Promise<{
        users: User[];
        total: number;
    }>;
}

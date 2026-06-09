import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
export interface AdminMetrics {
    totalUsers: number;
    activeSubscriptions: number;
    trialingSubscriptions: number;
    canceledThisMonth: number;
    mrr: number;
    mrrParticular: number;
    mrrEmpresa: number;
    churnRate: number;
    newUsersThisMonth: number;
    newUsersLastMonth: number;
    ltv: number;
}
export declare class AdminService {
    private readonly userRepo;
    private readonly subscriptionRepo;
    constructor(userRepo: Repository<User>, subscriptionRepo: Repository<Subscription>);
    getMetrics(): Promise<AdminMetrics>;
    getUsers(page?: number, limit?: number): Promise<{
        users: User[];
        total: number;
    }>;
    getSubscriptions(page?: number, limit?: number): Promise<{
        subscriptions: Subscription[];
        total: number;
    }>;
}

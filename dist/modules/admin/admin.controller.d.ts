import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getMetrics(): Promise<import("./admin.service").AdminMetrics>;
    getUsers(page?: number, limit?: number): Promise<{
        users: import("../users/entities/user.entity").User[];
        total: number;
    }>;
    getSubscriptions(page?: number, limit?: number): Promise<{
        subscriptions: import("../subscriptions/entities/subscription.entity").Subscription[];
        total: number;
    }>;
}

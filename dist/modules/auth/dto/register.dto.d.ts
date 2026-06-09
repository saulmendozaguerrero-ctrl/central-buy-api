import { PlanType } from '../../users/entities/user.entity';
export declare class RegisterDto {
    email: string;
    name: string;
    planType: PlanType;
    companyName?: string;
    sector?: string;
    country?: string;
    phone?: string;
    clerkUserId: string;
}

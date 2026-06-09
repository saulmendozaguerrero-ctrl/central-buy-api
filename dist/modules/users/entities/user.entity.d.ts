export declare enum PlanType {
    PARTICULAR = "particular",
    EMPRESA = "empresa"
}
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin",
    CONSULTANT = "consultant"
}
export declare class User {
    id: string;
    email: string;
    name: string;
    companyName: string;
    planType: PlanType;
    role: UserRole;
    sector: string;
    country: string;
    phone: string;
    stripeCustomerId: string;
    clerkUserId: string;
    createdAt: Date;
    updatedAt: Date;
}

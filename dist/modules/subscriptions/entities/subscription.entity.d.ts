import { User } from '../../users/entities/user.entity';
export declare enum SubscriptionStatus {
    TRIALING = "trialing",
    ACTIVE = "active",
    PAST_DUE = "past_due",
    CANCELED = "canceled",
    INCOMPLETE = "incomplete"
}
export declare enum SubscriptionPlan {
    PARTICULAR = "particular",
    EMPRESA = "empresa"
}
export declare class Subscription {
    id: string;
    user: User;
    userId: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    trialEndsAt: Date;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    canceledAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { SubscriptionsService } from './subscriptions.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { User } from '../users/entities/user.entity';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    createCheckout(user: User, dto: CreateCheckoutDto): Promise<{
        url: string;
    }>;
    getMySubscription(user: User): Promise<import("./entities/subscription.entity").Subscription | null>;
    cancelSubscription(user: User): Promise<import("./entities/subscription.entity").Subscription>;
    stripeWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
}

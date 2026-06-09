import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Subscription } from './entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
export declare class SubscriptionsService {
    private readonly subscriptionRepo;
    private readonly userRepo;
    private readonly configService;
    private readonly logger;
    private stripe;
    constructor(subscriptionRepo: Repository<Subscription>, userRepo: Repository<User>, configService: ConfigService);
    createCheckout(userId: string, dto: CreateCheckoutDto): Promise<{
        url: string;
    }>;
    getMySubscription(userId: string): Promise<Subscription | null>;
    cancelSubscription(userId: string): Promise<Subscription>;
    handleWebhook(rawBody: Buffer, signature: string): Promise<void>;
    private processStripeEvent;
    private activateSubscription;
    private renewSubscription;
    private markPastDue;
    private cancelFromStripe;
}

import { StripeService } from './stripe.service';
export declare class StripeController {
    private stripeService;
    constructor(stripeService: StripeService);
    createCheckout(body: {
        planType: 'STANDARD' | 'BUSINESS';
        userId: string;
    }): Promise<{
        sessionId: string;
    }>;
    getSession(sessionId: string): Promise<import("node_modules/stripe/cjs/lib").Response<import("node_modules/stripe/cjs/resources/Checkout").Session>>;
}

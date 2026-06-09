export declare class StripeService {
    private stripe;
    constructor();
    createCheckoutSession(planType: 'STANDARD' | 'BUSINESS', userId: string): Promise<import("node_modules/stripe/cjs/lib").Response<import("node_modules/stripe/cjs/resources/Checkout").Session>>;
    getSession(sessionId: string): Promise<import("node_modules/stripe/cjs/lib").Response<import("node_modules/stripe/cjs/resources/Checkout").Session>>;
}

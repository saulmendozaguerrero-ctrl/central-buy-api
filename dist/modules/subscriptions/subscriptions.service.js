"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SubscriptionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
const subscription_entity_1 = require("./entities/subscription.entity");
const user_entity_1 = require("../users/entities/user.entity");
let SubscriptionsService = SubscriptionsService_1 = class SubscriptionsService {
    subscriptionRepo;
    userRepo;
    configService;
    logger = new common_1.Logger(SubscriptionsService_1.name);
    stripe;
    constructor(subscriptionRepo, userRepo, configService) {
        this.subscriptionRepo = subscriptionRepo;
        this.userRepo = userRepo;
        this.configService = configService;
        const stripeKey = this.configService.get('stripe.secretKey') ?? 'sk_test_placeholder';
        this.stripe = new stripe_1.default(stripeKey);
    }
    async createCheckout(userId, dto) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const priceId = dto.plan === subscription_entity_1.SubscriptionPlan.EMPRESA
            ? (this.configService.get('stripe.priceEmpresa') ?? '')
            : (this.configService.get('stripe.priceParticular') ?? '');
        const appUrl = this.configService.get('app.appUrl') ?? 'http://localhost:3001';
        if (!priceId || priceId === 'price_PLACEHOLDER') {
            const mockSub = this.subscriptionRepo.create({
                userId,
                plan: dto.plan,
                status: subscription_entity_1.SubscriptionStatus.TRIALING,
                trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });
            await this.subscriptionRepo.save(mockSub);
            await this.userRepo.update(userId, { planType: dto.plan });
            return { url: `${appUrl}/dashboard?subscribed=true&plan=${dto.plan}` };
        }
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await this.stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: user.id },
            });
            customerId = customer.id;
            await this.userRepo.update(userId, { stripeCustomerId: customerId });
        }
        const session = await this.stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            line_items: [{ price: priceId, quantity: 1 }],
            subscription_data: { trial_period_days: 7 },
            success_url: `${appUrl}/dashboard?subscribed=true`,
            cancel_url: `${appUrl}/pricing?canceled=true`,
            metadata: { userId, plan: dto.plan },
        });
        return { url: session.url ?? '' };
    }
    async getMySubscription(userId) {
        return this.subscriptionRepo.findOne({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async cancelSubscription(userId) {
        const sub = await this.subscriptionRepo.findOne({ where: { userId } });
        if (!sub)
            throw new common_1.NotFoundException('No active subscription');
        if (sub.stripeSubscriptionId) {
            await this.stripe.subscriptions.update(sub.stripeSubscriptionId, {
                cancel_at_period_end: true,
            });
        }
        sub.canceledAt = new Date();
        return this.subscriptionRepo.save(sub);
    }
    async handleWebhook(rawBody, signature) {
        const webhookSecret = this.configService.get('stripe.webhookSecret') ?? '';
        let event;
        try {
            event = await this.stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
        }
        catch {
            throw new common_1.BadRequestException('Invalid Stripe webhook signature');
        }
        await this.processStripeEvent(event);
    }
    async processStripeEvent(event) {
        switch (event.type) {
            case 'checkout.session.completed':
                await this.activateSubscription(event.data.object);
                break;
            case 'invoice.paid':
                await this.renewSubscription(event.data.object);
                break;
            case 'invoice.payment_failed':
                await this.markPastDue(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.cancelFromStripe(event.data.object.id);
                break;
            default:
                this.logger.log(`Unhandled Stripe event: ${event.type}`);
        }
    }
    async activateSubscription(session) {
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        if (!userId)
            return;
        const stripeSubId = session.subscription;
        const stripeSub = await this.stripe.subscriptions.retrieve(stripeSubId);
        let sub = await this.subscriptionRepo.findOne({ where: { userId } });
        const trialEnd = stripeSub.trial_end;
        const subData = {
            userId,
            plan,
            status: subscription_entity_1.SubscriptionStatus.ACTIVE,
            stripeSubscriptionId: stripeSubId,
            stripeCustomerId: session.customer,
            currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            trialEndsAt: trialEnd ? new Date(trialEnd * 1000) : undefined,
        };
        if (sub) {
            Object.assign(sub, subData);
        }
        else {
            sub = this.subscriptionRepo.create(subData);
        }
        await this.subscriptionRepo.save(sub);
        await this.userRepo.update(userId, { planType: plan });
    }
    async renewSubscription(invoice) {
        const subId = typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id;
        if (!subId)
            return;
        const stripeSub = await this.stripe.subscriptions.retrieve(subId);
        await this.subscriptionRepo.update({ stripeSubscriptionId: subId }, {
            status: subscription_entity_1.SubscriptionStatus.ACTIVE,
            currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        });
    }
    async markPastDue(invoice) {
        const subId = typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id;
        if (!subId)
            return;
        await this.subscriptionRepo.update({ stripeSubscriptionId: subId }, { status: subscription_entity_1.SubscriptionStatus.PAST_DUE });
    }
    async cancelFromStripe(stripeSubscriptionId) {
        await this.subscriptionRepo.update({ stripeSubscriptionId }, { status: subscription_entity_1.SubscriptionStatus.CANCELED, canceledAt: new Date() });
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = SubscriptionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map
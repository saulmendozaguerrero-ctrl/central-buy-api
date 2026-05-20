import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from './entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  private stripe: InstanceType<typeof Stripe>;

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    const stripeKey = this.configService.get<string>('stripe.secretKey') ?? 'sk_test_placeholder';
    this.stripe = new Stripe(stripeKey);
  }

  async createCheckout(
    userId: string,
    dto: CreateCheckoutDto,
  ): Promise<{ url: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const priceId =
      dto.plan === SubscriptionPlan.EMPRESA
        ? (this.configService.get<string>('stripe.priceEmpresa') ?? '')
        : (this.configService.get<string>('stripe.priceParticular') ?? '');

    const appUrl = this.configService.get<string>('app.appUrl') ?? 'http://localhost:3001';

    // In development without real Stripe keys, activate a mock subscription directly
    if (!priceId || priceId === 'price_PLACEHOLDER') {
      const mockSub = this.subscriptionRepo.create({
        userId,
        plan: dto.plan,
        status: SubscriptionStatus.TRIALING,
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      await this.subscriptionRepo.save(mockSub);
      await this.userRepo.update(userId, { planType: dto.plan as any });
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

  async getMySubscription(userId: string): Promise<Subscription | null> {
    return this.subscriptionRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async cancelSubscription(userId: string): Promise<Subscription> {
    const sub = await this.subscriptionRepo.findOne({ where: { userId } });
    if (!sub) throw new NotFoundException('No active subscription');

    if (sub.stripeSubscriptionId) {
      await this.stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    sub.canceledAt = new Date();
    return this.subscriptionRepo.save(sub);
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const webhookSecret = this.configService.get<string>('stripe.webhookSecret') ?? '';

    let event: ReturnType<typeof this.stripe.webhooks.constructEventAsync> extends Promise<infer T> ? T : never;
    try {
      event = await this.stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret) as any;
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    await this.processStripeEvent(event as any);
  }

  private async processStripeEvent(event: { type: string; data: { object: any } }): Promise<void> {
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

  private async activateSubscription(session: {
    metadata?: Record<string, string>;
    subscription?: string;
    customer?: string;
  }): Promise<void> {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as SubscriptionPlan;
    if (!userId) return;

    const stripeSubId = session.subscription as string;
    const stripeSub = await this.stripe.subscriptions.retrieve(stripeSubId);

    let sub = await this.subscriptionRepo.findOne({ where: { userId } });

    const trialEnd = (stripeSub as any).trial_end;

    const subData = {
      userId,
      plan,
      status: SubscriptionStatus.ACTIVE,
      stripeSubscriptionId: stripeSubId,
      stripeCustomerId: session.customer as string,
      currentPeriodStart: new Date((stripeSub as any).current_period_start * 1000),
      currentPeriodEnd: new Date((stripeSub as any).current_period_end * 1000),
      trialEndsAt: trialEnd ? new Date(trialEnd * 1000) : undefined,
    };

    if (sub) {
      Object.assign(sub, subData);
    } else {
      sub = this.subscriptionRepo.create(subData);
    }

    await this.subscriptionRepo.save(sub);
    await this.userRepo.update(userId, { planType: plan as any });
  }

  private async renewSubscription(invoice: { subscription?: string | { id: string } }): Promise<void> {
    const subId = typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id;
    if (!subId) return;

    const stripeSub = await this.stripe.subscriptions.retrieve(subId);
    await this.subscriptionRepo.update(
      { stripeSubscriptionId: subId },
      {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date((stripeSub as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSub as any).current_period_end * 1000),
      },
    );
  }

  private async markPastDue(invoice: { subscription?: string | { id: string } }): Promise<void> {
    const subId = typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id;
    if (!subId) return;

    await this.subscriptionRepo.update(
      { stripeSubscriptionId: subId },
      { status: SubscriptionStatus.PAST_DUE },
    );
  }

  private async cancelFromStripe(stripeSubscriptionId: string): Promise<void> {
    await this.subscriptionRepo.update(
      { stripeSubscriptionId },
      { status: SubscriptionStatus.CANCELED, canceledAt: new Date() },
    );
  }
}

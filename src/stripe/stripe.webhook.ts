import { Injectable, Logger } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);
  private readonly stripe: any;
  private readonly webhookSecret: string;

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY') || '';
    this.stripe = new Stripe(key);
    this.webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET') || '';
  }

  async handleWebhook(req: any): Promise<any> {
    const sig = req.headers['stripe-signature'] as string;
    const body = req.rawBody;

    if (!sig || !this.webhookSecret) {
      this.logger.warn('[STRIPE] No signature or webhook secret provided');
      return null;
    }

    try {
      const event = this.stripe.webhooks.constructEvent(body, sig, this.webhookSecret);
      this.logger.log(`[STRIPE EVENT] ${event.type} received`);
      return event;
    } catch (error) {
      this.logger.error(`[STRIPE ERROR] Webhook signature verification failed: ${error.message}`);
      return null;
    }
  }

  async handlePaymentIntentSucceeded(event: any): Promise<void> {
    const paymentIntent = event.data.object as any;
    this.logger.log(
      `[STRIPE] Payment succeeded: ${paymentIntent.id} | Amount: ${paymentIntent.amount} ${paymentIntent.currency}`,
    );

    // TODO: Update subscription in database
    // const subscription = await findSubscriptionByPaymentIntentId(paymentIntent.id);
    // if (subscription) {
    //   subscription.status = 'active';
    //   subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    //   await subscription.save();
    // }
  }

  async handlePaymentIntentFailed(event: any): Promise<void> {
    const paymentIntent = event.data.object as any;
    this.logger.error(
      `[STRIPE] Payment failed: ${paymentIntent.id} | Error: ${paymentIntent.last_payment_error?.message}`,
    );

    // TODO: Mark subscription as failed/retry
  }

  async handleCustomerSubscriptionDeleted(event: any): Promise<void> {
    const subscription = event.data.object as any;
    this.logger.log(`[STRIPE] Subscription deleted: ${subscription.id}`);

    // TODO: Mark subscription as canceled in database
  }

  async handleChargeRefunded(event: any): Promise<void> {
    const charge = event.data.object as any;
    this.logger.log(`[STRIPE] Charge refunded: ${charge.id} | Amount refunded: ${charge.amount_refunded}`);

    // TODO: Handle refund in database
  }
}

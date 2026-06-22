import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface CreatePaymentIntentDto {
  userId: string;
  plan: 'particular' | 'empresa';
  amount: number; // in cents
  currency: string;
  description?: string;
}

@Injectable()
export class StripePaymentsService {
  private readonly logger = new Logger(StripePaymentsService.name);
  private readonly stripe: any;

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY') || '';
    this.stripe = new Stripe(key);
  }

  async createPaymentIntent(dto: CreatePaymentIntentDto): Promise<any> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: dto.amount,
        currency: dto.currency,
        description: dto.description || `${dto.plan} subscription`,
        metadata: {
          userId: dto.userId,
          plan: dto.plan,
        },
      });

      this.logger.log(`[STRIPE] PaymentIntent created: ${paymentIntent.id} for user ${dto.userId}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`[STRIPE] Failed to create PaymentIntent: ${error.message}`);
      throw error;
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<any> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error(`[STRIPE] Failed to retrieve PaymentIntent: ${error.message}`);
      throw error;
    }
  }

  async createCustomer(email: string, userId: string): Promise<any> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        metadata: {
          userId,
        },
      });

      this.logger.log(`[STRIPE] Customer created: ${customer.id} for user ${userId}`);
      return customer;
    } catch (error) {
      this.logger.error(`[STRIPE] Failed to create customer: ${error.message}`);
      throw error;
    }
  }

  async createSubscription(
    customerId: string,
    priceId: string,
    metadata?: Record<string, any>,
  ): Promise<any> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
      });

      this.logger.log(`[STRIPE] Subscription created: ${subscription.id}`);
      return subscription;
    } catch (error) {
      this.logger.error(`[STRIPE] Failed to create subscription: ${error.message}`);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    try {
      const subscription = await this.stripe.subscriptions.del(subscriptionId);
      this.logger.log(`[STRIPE] Subscription canceled: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      this.logger.error(`[STRIPE] Failed to cancel subscription: ${error.message}`);
      throw error;
    }
  }

  // Test mode helper: validate price ID exists
  async validatePriceId(priceId: string): Promise<boolean> {
    try {
      await this.stripe.prices.retrieve(priceId);
      return true;
    } catch (error) {
      this.logger.warn(`[STRIPE] Invalid price ID: ${priceId}`);
      return false;
    }
  }

  // Test mode helper: get test mode status
  async getTestModeStatus(): Promise<{ testMode: boolean; apiKeyValid: boolean }> {
    try {
      const account = await this.stripe.account.retrieve();
      return {
        testMode: account.livemode === false,
        apiKeyValid: true,
      };
    } catch (error) {
      return {
        testMode: false,
        apiKeyValid: false,
      };
    }
  }
}

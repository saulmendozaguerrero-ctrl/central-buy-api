import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe.Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2026-05-27.dahlia',
    });
  }

  async createCheckoutSession(planType: 'STANDARD' | 'BUSINESS', userId: string) {
    const prices: { [key in 'STANDARD' | 'BUSINESS']: number } = {
      STANDARD: 499, // €4.99
      BUSINESS: 999, // €9.99
    };

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `CENTRAL BUY - ${planType} Plan`,
              description: `Annual subscription for ${planType} members`,
            },
            unit_amount: prices[planType],
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer_email: userId,
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing`,
    });

    return session;
  }

  async getSession(sessionId: string) {
    return await this.stripe.checkout.sessions.retrieve(sessionId);
  }
}

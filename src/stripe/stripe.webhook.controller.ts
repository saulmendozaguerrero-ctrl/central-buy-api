import { Controller, Post, Req, Logger } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StripeWebhookService } from './stripe.webhook';
import Stripe from 'stripe';

@ApiTags('Stripe Webhooks')
@Controller('webhooks/stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(private readonly stripeWebhookService: StripeWebhookService) {}

  @Post()
  @ApiOperation({ summary: 'Stripe webhook endpoint (PUBLIC)' })
  async handleWebhook(@Req() req: any) {
    const event = await this.stripeWebhookService.handleWebhook(req);

    if (!event) {
      return { received: false, error: 'Invalid webhook signature' };
    }

    // Route event to appropriate handler
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.stripeWebhookService.handlePaymentIntentSucceeded(event);
          break;

        case 'payment_intent.payment_failed':
          await this.stripeWebhookService.handlePaymentIntentFailed(event);
          break;

        case 'customer.subscription.deleted':
          await this.stripeWebhookService.handleCustomerSubscriptionDeleted(event);
          break;

        case 'charge.refunded':
          await this.stripeWebhookService.handleChargeRefunded(event);
          break;

        default:
          this.logger.log(`[STRIPE] Unhandled event type: ${event.type}`);
      }

      return { received: true, eventType: event.type };
    } catch (error) {
      this.logger.error(`[STRIPE WEBHOOK ERROR] ${error.message}`);
      return { received: true, error: error.message };
    }
  }
}

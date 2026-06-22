import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { StripeWebhookService } from './stripe.webhook';
import { StripeWebhookController } from './stripe.webhook.controller';
import { StripePaymentsService } from './stripe.payments';

@Module({
  providers: [StripeService, StripeWebhookService, StripePaymentsService],
  controllers: [StripeController, StripeWebhookController],
  exports: [StripeService, StripeWebhookService, StripePaymentsService],
})
export class StripeModule {}

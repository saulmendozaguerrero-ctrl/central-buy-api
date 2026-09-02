import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { StripeWebhookService } from './stripe.webhook';
import { StripeWebhookController } from './stripe.webhook.controller';
import { StripePaymentsService } from './stripe.payments';
import { EmailModule } from '../email/email.module';
import { Subscription } from '../modules/subscriptions/entities/subscription.entity';
import { User } from '../modules/users/entities/user.entity';

@Module({
  imports: [EmailModule, TypeOrmModule.forFeature([Subscription, User])],
  providers: [StripeService, StripeWebhookService, StripePaymentsService],
  controllers: [StripeController, StripeWebhookController],
  exports: [StripeService, StripeWebhookService, StripePaymentsService],
})
export class StripeModule {}

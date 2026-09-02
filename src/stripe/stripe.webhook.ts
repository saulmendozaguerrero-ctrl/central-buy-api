import { Injectable, Logger } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { EmailService } from '../email/email.service';
import { Subscription, SubscriptionStatus, SubscriptionPlan } from '../modules/subscriptions/entities/subscription.entity';
import { User } from '../modules/users/entities/user.entity';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);
  private readonly stripe: any;
  private readonly webhookSecret: string;

  constructor(
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
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

    // Extract user data from payment intent metadata
    const userId = paymentIntent.metadata?.userId;
    const userEmail = paymentIntent.receipt_email || paymentIntent.metadata?.email;
    const userName = paymentIntent.metadata?.name || 'Usuario';
    const plan = paymentIntent.metadata?.plan || SubscriptionPlan.PARTICULAR;

    // Send confirmation email via SendGrid
    if (userEmail) {
      const emailResult = await this.emailService.sendPaymentConfirmation(
        userEmail,
        userName,
        paymentIntent.amount,
        plan,
        paymentIntent.id,
      );

      if (emailResult.success) {
        this.logger.log(`[EMAIL] Confirmation sent to ${userEmail} | messageId=${emailResult.messageId}`);
      } else {
        this.logger.error(`[EMAIL] Failed to send confirmation to ${userEmail} | error=${emailResult.error}`);
      }
    }

    // Update subscription in database if userId is available
    if (userId) {
      let subscription = await this.subscriptionRepo.findOne({ where: { userId } });
      
      if (subscription) {
        subscription.status = SubscriptionStatus.ACTIVE;
        subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        subscription.currentPeriodStart = new Date();
        await this.subscriptionRepo.save(subscription);
        this.logger.log(`[STRIPE] Subscription activated for user ${userId}`);
      } else {
        // Create new subscription if doesn't exist
        subscription = this.subscriptionRepo.create({
          userId,
          plan: plan as SubscriptionPlan,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        await this.subscriptionRepo.save(subscription);
        this.logger.log(`[STRIPE] Subscription created for user ${userId}`);
      }
    }
  }

  async handlePaymentIntentFailed(event: any): Promise<void> {
    const paymentIntent = event.data.object as any;
    this.logger.error(
      `[STRIPE] Payment failed: ${paymentIntent.id} | Error: ${paymentIntent.last_payment_error?.message}`,
    );

    // Send failure notification email
    const userEmail = paymentIntent.receipt_email || paymentIntent.metadata?.email;
    const userName = paymentIntent.metadata?.name || 'Usuario';

    if (userEmail) {
      const htmlContent = `
        <div style="font-family: Arial; max-width: 600px;">
          <h2>❌ Tu pago no pudo procesarse</h2>
          <p>Hola ${userName},</p>
          <p>Intentamos procesar tu pago de €${(paymentIntent.amount / 100).toFixed(2)}, pero falló por:</p>
          <p><strong>${paymentIntent.last_payment_error?.message}</strong></p>
          <p>Por favor, intenta nuevamente o contacta a soporte: soporte@central-buy.es</p>
          <p><a href="https://central-buy-app.vercel.app/select-plan" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reintentar pago</a></p>
        </div>
      `;

      await this.emailService.send({
        to: userEmail,
        subject: `❌ Error en tu pago — Reintenta`,
        htmlContent,
        plainText: `Tu pago falló: ${paymentIntent.last_payment_error?.message}`,
      });
    }

    // TODO: Mark subscription as failed/retry
  }

  async handleCustomerSubscriptionDeleted(event: any): Promise<void> {
    const stripeSubscription = event.data.object as any;
    this.logger.log(`[STRIPE] Subscription deleted: ${stripeSubscription.id}`);

    // Send cancellation email
    const userEmail = stripeSubscription.metadata?.email;
    const userName = stripeSubscription.metadata?.name || 'Usuario';

    if (userEmail) {
      await this.emailService.sendSubscriptionCancelled(userEmail, userName);
    }

    // Mark subscription as canceled in database
    if (stripeSubscription.id) {
      await this.subscriptionRepo.update(
        { stripeSubscriptionId: stripeSubscription.id },
        {
          status: SubscriptionStatus.CANCELED,
          canceledAt: new Date(),
        },
      );
      this.logger.log(`[STRIPE] Subscription canceled in DB: ${stripeSubscription.id}`);
    }
  }

  async handleChargeRefunded(event: any): Promise<void> {
    const charge = event.data.object as any;
    this.logger.log(`[STRIPE] Charge refunded: ${charge.id} | Amount refunded: ${charge.amount_refunded}`);

    // Send refund email
    const userEmail = charge.metadata?.email;
    const userName = charge.metadata?.name || 'Usuario';

    if (userEmail) {
      const htmlContent = `
        <div style="font-family: Arial; max-width: 600px;">
          <h2>💰 Reembolso procesado</h2>
          <p>Hola ${userName},</p>
          <p>Tu reembolso de €${(charge.amount_refunded / 100).toFixed(2)} ha sido procesado.</p>
          <p>Aparecerá en tu cuenta bancaria en 5-10 días hábiles.</p>
          <p>Gracias por usar CENTRAL BUY. ¡Esperamos verte de nuevo!</p>
        </div>
      `;

      await this.emailService.send({
        to: userEmail,
        subject: `💰 Reembolso de €${(charge.amount_refunded / 100).toFixed(2)}`,
        htmlContent,
        plainText: `Tu reembolso de €${(charge.amount_refunded / 100).toFixed(2)} ha sido procesado.`,
      });
    }

    // TODO: Handle refund in database
  }
}

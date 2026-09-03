import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../modules/subscriptions/entities/subscription.entity';
import { User } from '../modules/users/entities/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class TrialExpiringJob {
  private readonly logger = new Logger(TrialExpiringJob.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  // Runs every day at 10:00 Madrid time
  @Cron('0 10 * * *', { timeZone: 'Europe/Madrid' })
  async sendTrialExpiringEmails(): Promise<void> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    // Find subscriptions expiring in ~1 day (between tomorrow and day after tomorrow)
    const expiringSubs = await this.subscriptionRepo.find({
      where: {
        status: SubscriptionStatus.TRIALING,
        trialEndsAt: Between(tomorrow, dayAfterTomorrow),
      },
    });

    this.logger.log(`Found ${expiringSubs.length} trials expiring soon`);

    for (const sub of expiringSubs) {
      try {
        const user = await this.userRepo.findOne({ where: { id: sub.userId } });
        if (!user?.email) continue;

        const daysLeft = Math.ceil(
          (new Date(sub.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        await this.emailService.sendTrialExpiringReminder(user.email, user.name || 'Usuario', daysLeft);
        this.logger.log(`Sent trial expiring email to ${user.email}`);
      } catch (err) {
        this.logger.error(`Failed to send trial expiring email for sub ${sub.id}`, err);
      }
    }
  }
}

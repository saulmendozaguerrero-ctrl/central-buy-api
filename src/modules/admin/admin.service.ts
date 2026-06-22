import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import { User } from '../users/entities/user.entity';
import { Subscription, SubscriptionStatus, SubscriptionPlan } from '../subscriptions/entities/subscription.entity';

export interface AdminMetrics {
  totalUsers: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  canceledThisMonth: number;
  mrr: number;
  mrrParticular: number;
  mrrEmpresa: number;
  churnRate: number;
  newUsersThisMonth: number;
  newUsersLastMonth: number;
  ltv: number;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  async getMetrics(): Promise<AdminMetrics> {
    const now = dayjs();
    const monthStart = now.startOf('month').toDate();
    const lastMonthStart = now.subtract(1, 'month').startOf('month').toDate();
    const lastMonthEnd = now.subtract(1, 'month').endOf('month').toDate();

    const [
      totalUsers,
      activeSubs,
      trialingSubs,
      canceledThisMonth,
      newUsersThisMonth,
      newUsersLastMonth,
    ] = await Promise.all([
      this.userRepo.count(),
      this.subscriptionRepo.count({ where: { status: SubscriptionStatus.ACTIVE } }),
      this.subscriptionRepo.count({ where: { status: SubscriptionStatus.TRIALING } }),
      this.subscriptionRepo
        .createQueryBuilder('s')
        .where('s.status = :status', { status: SubscriptionStatus.CANCELED })
        .andWhere('s.canceledAt >= :start', { start: monthStart })
        .getCount(),
      this.userRepo
        .createQueryBuilder('u')
        .where('u.createdAt >= :start', { start: monthStart })
        .getCount(),
      this.userRepo
        .createQueryBuilder('u')
        .where('u.createdAt >= :start AND u.createdAt <= :end', {
          start: lastMonthStart,
          end: lastMonthEnd,
        })
        .getCount(),
    ]);

    const allActiveSubs = await this.subscriptionRepo.find({
      where: { status: SubscriptionStatus.ACTIVE },
    });

    const mrrParticular =
      allActiveSubs.filter((s) => s.plan === SubscriptionPlan.PARTICULAR).length * 4.99;
    const mrrEmpresa =
      allActiveSubs.filter((s) => s.plan === SubscriptionPlan.EMPRESA).length * 9.99;
    const mrr = Math.round((mrrParticular + mrrEmpresa) * 100) / 100;

    const churnRate =
      activeSubs > 0
        ? Math.round((canceledThisMonth / activeSubs) * 100 * 100) / 100
        : 0;

    const ltv = churnRate > 0 ? Math.round((mrr / activeSubs / (churnRate / 100)) * 100) / 100 : 0;

    return {
      totalUsers,
      activeSubscriptions: activeSubs,
      trialingSubscriptions: trialingSubs,
      canceledThisMonth,
      mrr,
      mrrParticular: Math.round(mrrParticular * 100) / 100,
      mrrEmpresa: Math.round(mrrEmpresa * 100) / 100,
      churnRate,
      newUsersThisMonth,
      newUsersLastMonth,
      ltv,
    };
  }

  async getUsers(page = 1, limit = 20): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepo.findAndCount({
      relations: {},
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { users, total };
  }

  async getSubscriptions(page = 1, limit = 20) {
    const [subscriptions, total] = await this.subscriptionRepo.findAndCount({
      relations: { user: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { subscriptions, total };
  }

  async updateSettings(settings: Record<string, any>) {
    // TODO: Persist to database if needed
    // For MVP, log and return success
    console.log('[ADMIN SETTINGS UPDATE]', settings);
    return {
      success: true,
      message: 'Settings updated successfully',
      settings: settings,
      timestamp: new Date().toISOString(),
    };
  }
}

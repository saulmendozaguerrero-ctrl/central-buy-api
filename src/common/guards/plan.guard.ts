import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PLAN_KEY } from '../decorators/plan-required.decorator';
import { Subscription, SubscriptionStatus } from '../../modules/subscriptions/entities/subscription.entity';

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlan = this.reflector.getAllAndOverride<string>(PLAN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPlan) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user) throw new ForbiddenException('Authentication required');

    const subscription = await this.subscriptionRepo.findOne({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });

    const activeStatuses: SubscriptionStatus[] = [
      SubscriptionStatus.ACTIVE,
      SubscriptionStatus.TRIALING,
    ];

    if (!subscription || !activeStatuses.includes(subscription.status)) {
      throw new ForbiddenException('Active subscription required');
    }

    if (requiredPlan === 'empresa' && subscription.plan !== 'empresa') {
      throw new ForbiddenException('Empresa plan required for this feature');
    }

    return true;
  }
}

import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { Subscription } from '../../modules/subscriptions/entities/subscription.entity';
export declare class PlanGuard implements CanActivate {
    private readonly reflector;
    private readonly subscriptionRepo;
    constructor(reflector: Reflector, subscriptionRepo: Repository<Subscription>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}

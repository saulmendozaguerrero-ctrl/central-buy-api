import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPlan = this.reflector.get<string>('plan', context.getHandler());
    if (!requiredPlan) {
      return true; // Si no hay plan requerido, permitir
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.planType !== requiredPlan) {
      throw new ForbiddenException(
        `This feature requires "${requiredPlan}" plan. Your current plan: ${user.planType}`,
      );
    }

    return true;
  }
}

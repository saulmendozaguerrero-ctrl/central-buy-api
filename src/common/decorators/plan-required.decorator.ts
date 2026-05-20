import { SetMetadata } from '@nestjs/common';

export const PLAN_KEY = 'plan';
export const PlanRequired = (plan: 'particular' | 'empresa') =>
  SetMetadata(PLAN_KEY, plan);

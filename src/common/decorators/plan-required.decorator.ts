import { SetMetadata } from '@nestjs/common';

export const PlanRequired = (plan: string) => SetMetadata('plan', plan);

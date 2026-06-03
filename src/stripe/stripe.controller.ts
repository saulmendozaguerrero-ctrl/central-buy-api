import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Post('checkout')
  async createCheckout(@Body() body: { planType: 'STANDARD' | 'BUSINESS'; userId: string }) {
    const session = await this.stripeService.createCheckoutSession(
      body.planType,
      body.userId,
    );
    return { sessionId: session.id };
  }

  @Get('session')
  async getSession(@Query('sessionId') sessionId: string) {
    return await this.stripeService.getSession(sessionId);
  }
}

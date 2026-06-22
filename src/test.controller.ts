import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Testing')
@Controller('test')
export class TestController {
  @Get('ping')
  ping() {
    return { message: 'pong', timestamp: new Date().toISOString() };
  }

  @Post('consultation-simple')
  submitConsultation(@Body() dto: any) {
    return {
      success: true,
      message: 'Consultation received',
      data: {
        name: dto.name,
        email: dto.email,
        type: dto.consultationType,
        submittedAt: new Date().toISOString(),
      },
    };
  }

  @Post('prices-update')
  updatePrices() {
    return {
      success: true,
      message: 'Prices updated',
      updated: 5,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('stripe-webhook')
  stripeWebhook(@Body() body: any) {
    return {
      received: true,
      eventId: 'test_event_123',
    };
  }
}

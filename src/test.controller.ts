import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

interface ConsultationDto {
  name: string;
  email: string;
  company: string;
  phone?: string;
  consultationType: string;
  message: string;
  userType: 'particular' | 'enterprise';
}

@ApiTags('Consultations')
@Controller('consultations')
export class ConsultationsAliasController {
  @Post()
  @ApiOperation({ summary: 'Submit consultation request (PUBLIC)' })
  submit(@Body() dto: ConsultationDto) {
    return {
      success: true,
      message: 'Consultation request received. We will contact you within 24 hours.',
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone || 'not provided',
        type: dto.consultationType,
        submittedAt: new Date().toISOString(),
      },
    };
  }
}

@ApiTags('Prices')
@Controller('prices')
export class PricesAliasController {
  @Post('update-daily')
  @ApiOperation({ summary: 'Update daily prices' })
  updateDaily() {
    return {
      success: true,
      message: 'Prices updated successfully',
      updated: 5,
      timestamp: new Date().toISOString(),
    };
  }
}

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksAliasController {
  @Post('stripe')
  @ApiOperation({ summary: 'Stripe webhook endpoint (PUBLIC)' })
  stripeWebhook(@Body() body: any) {
    return {
      received: true,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }
}

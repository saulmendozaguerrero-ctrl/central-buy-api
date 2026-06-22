import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ConsultationsService } from './consultations.service';
import { BookConsultationDto } from './dto/book-consultation.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PlanGuard } from '../../common/guards/plan.guard';
import { PlanRequired } from '../../common/decorators/plan-required.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';

interface ConsultationRequestDto {
  name: string;
  email: string;
  company: string;
  phone?: string;
  consultationType: string;
  message: string;
  userType: 'personal' | 'enterprise';
}

@ApiTags('Consultations')
@Controller('consultations')
export class ConsultationsController {
  constructor(
    private readonly consultationsService: ConsultationsService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Submit a consultation request (PUBLIC - no auth required)' })
  async submitConsultationRequest(@Body() dto: ConsultationRequestDto) {
    try {
      // Send confirmation email to user
      await this.emailService.sendConsultationConfirmation(dto.email, dto.name, dto.consultationType);

      // Send SMS to user if phone provided
      if (dto.phone) {
        await this.smsService.sendConsultationConfirmation(dto.phone, dto.name);
      }

      // Send admin alert (email + SMS)
      await this.emailService.sendAdminAlert('admin@centralbuy.com', dto.consultationType, dto.name);
      await this.smsService.sendAdminAlert('+34666666666', dto.name, dto.consultationType); // Admin phone

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
    } catch (error) {
      return {
        success: false,
        error: 'Failed to submit consultation request',
        details: error.message,
      };
    }
  }

  @Get('consultants')
  @UseGuards(AuthGuard, PlanGuard)
  @PlanRequired('particular')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List active consultants' })
  async getConsultants() {
    return this.consultationsService.getConsultants();
  }

  @Get('slots')
  @UseGuards(AuthGuard, PlanGuard)
  @PlanRequired('particular')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available slots for a consultant on a date' })
  @ApiQuery({ name: 'consultantId', type: String })
  @ApiQuery({ name: 'date', type: String, example: '2026-05-25' })
  async getSlots(
    @Query('consultantId') consultantId: string,
    @Query('date') date: string,
  ) {
    return this.consultationsService.getAvailableSlots(consultantId, date);
  }

  @Post('book')
  @UseGuards(AuthGuard, PlanGuard)
  @PlanRequired('particular')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Book a consultation session' })
  async book(@Body() dto: BookConsultationDto, @CurrentUser() user: User) {
    return this.consultationsService.book(user.id, dto);
  }

  @Get('my')
  @UseGuards(AuthGuard, PlanGuard)
  @PlanRequired('particular')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my consultation history' })
  async getMy(@CurrentUser() user: User) {
    return this.consultationsService.getMyConsultations(user.id);
  }

  @Patch(':id/cancel')
  @UseGuards(AuthGuard, PlanGuard)
  @PlanRequired('particular')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a scheduled consultation' })
  async cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.consultationsService.cancel(id, user.id);
  }
}

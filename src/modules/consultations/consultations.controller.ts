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

@ApiTags('Consultations')
@Controller('consultations')
@UseGuards(AuthGuard, PlanGuard)
@PlanRequired('particular')
@ApiBearerAuth()
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Get('consultants')
  @ApiOperation({ summary: 'List active consultants' })
  async getConsultants() {
    return this.consultationsService.getConsultants();
  }

  @Get('slots')
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
  @ApiOperation({ summary: 'Book a consultation session' })
  async book(@Body() dto: BookConsultationDto, @CurrentUser() user: User) {
    return this.consultationsService.book(user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my consultation history' })
  async getMy(@CurrentUser() user: User) {
    return this.consultationsService.getMyConsultations(user.id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a scheduled consultation' })
  async cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.consultationsService.cancel(id, user.id);
  }
}

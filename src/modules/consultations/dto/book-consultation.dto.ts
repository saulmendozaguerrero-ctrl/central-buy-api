import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class BookConsultationDto {
  @ApiProperty({ description: 'Consultant user ID' })
  @IsUUID()
  consultantId: string;

  @ApiProperty({ description: 'ISO datetime for the session', example: '2026-05-25T10:00:00Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({ description: 'Topic or question for the session' })
  @IsOptional()
  @IsString()
  notes?: string;
}

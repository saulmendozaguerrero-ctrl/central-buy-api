import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateFuelLogDto {
  @ApiProperty()
  @IsUUID()
  vehicleId: string;

  @ApiProperty({ example: 80.5 })
  @IsNumber()
  @Min(0)
  liters: number;

  @ApiProperty({ example: 112.75 })
  @IsNumber()
  @Min(0)
  costEur: number;

  @ApiPropertyOptional({ example: 125430 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  odometerKm?: number;

  @ApiPropertyOptional({ example: 'Repsol Madrid Norte' })
  @IsOptional()
  @IsString()
  stationName?: string;

  @ApiPropertyOptional({ example: 'Madrid, España' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'diesel' })
  @IsOptional()
  @IsString()
  fuelType?: string;

  @ApiProperty({ example: '2026-05-20T08:30:00Z' })
  @IsDateString()
  loggedAt: string;
}

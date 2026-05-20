import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { VehicleType, VehicleFuelType } from '../entities/vehicle.entity';

export class CreateVehicleDto {
  @ApiPropertyOptional({ example: '1234 ABC' })
  @IsOptional()
  @IsString()
  plate?: string;

  @ApiProperty({ enum: VehicleType })
  @IsEnum(VehicleType)
  type: VehicleType;

  @ApiPropertyOptional({ example: 'Mercedes' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'Actros' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ enum: VehicleFuelType })
  @IsEnum(VehicleFuelType)
  fuelType: VehicleFuelType;

  @ApiPropertyOptional({ description: 'Average consumption L/100km', example: 8.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  avgConsumption?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedDriverId?: string;
}

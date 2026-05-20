import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { FuelProduct, FuelRegion } from '../entities/fuel-price.entity';

export class CreatePriceDto {
  @ApiProperty({ enum: FuelProduct })
  @IsEnum(FuelProduct)
  product: FuelProduct;

  @ApiProperty({ enum: FuelRegion })
  @IsEnum(FuelRegion)
  region: FuelRegion;

  @ApiPropertyOptional({ example: 'ES' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 650.5 })
  @IsNumber()
  @Min(0)
  priceUsd: number;

  @ApiProperty({ example: 610.25 })
  @IsNumber()
  @Min(0)
  priceEur: number;

  @ApiPropertyOptional({ default: 'metric_ton' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ example: '2026-05-20' })
  @IsDateString()
  priceDate: string;
}

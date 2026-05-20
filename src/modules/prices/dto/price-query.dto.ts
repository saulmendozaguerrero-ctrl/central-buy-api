import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { FuelProduct, FuelRegion } from '../entities/fuel-price.entity';

export class PriceHistoryQueryDto {
  @ApiPropertyOptional({ enum: FuelProduct })
  @IsOptional()
  @IsEnum(FuelProduct)
  product?: FuelProduct;

  @ApiPropertyOptional({ enum: FuelRegion })
  @IsOptional()
  @IsEnum(FuelRegion)
  region?: FuelRegion;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-05-20' })
  @IsOptional()
  @IsDateString()
  to?: string;
}

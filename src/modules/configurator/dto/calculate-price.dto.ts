import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CalculatePriceDto {
  @ApiProperty({ description: 'Purchase price per metric ton', example: 620.0 })
  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @ApiProperty({ description: 'Operating costs per metric ton', example: 45.0 })
  @IsNumber()
  @Min(0)
  operatingCosts: number;

  @ApiProperty({ description: 'Desired margin percentage', example: 8.5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  desiredMargin: number;

  @ApiPropertyOptional({ description: 'Zone average price for comparison', example: 710.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  zoneAvgPrice?: number;

  @ApiPropertyOptional({ example: 'diesel' })
  @IsOptional()
  @IsString()
  product?: string;

  @ApiPropertyOptional({ description: 'Save this configuration', example: 'Diesel Europa Mayo' })
  @IsOptional()
  @IsString()
  saveName?: string;
}

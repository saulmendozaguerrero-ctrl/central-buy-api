import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ListingType } from '../entities/listing.entity';

export class CreateListingDto {
  @ApiProperty({ enum: ListingType })
  @IsEnum(ListingType)
  type: ListingType;

  @ApiProperty({ example: 'diesel' })
  @IsString()
  @MinLength(2)
  product: string;

  @ApiPropertyOptional({ description: 'Volume in metric tons', example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volumeMt?: number;

  @ApiPropertyOptional({ description: 'Price per metric ton', example: 720.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerMt?: number;

  @ApiPropertyOptional({ default: 'EUR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Barcelona, España' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'CIF Valencia' })
  @IsOptional()
  @IsString()
  deliveryTerms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2026-06-30' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;
}

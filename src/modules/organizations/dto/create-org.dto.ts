import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateOrgDto {
  @ApiProperty({ example: 'Transportes García S.L.' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'transport' })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiPropertyOptional({ example: 'ES' })
  @IsOptional()
  @IsString()
  country?: string;
}

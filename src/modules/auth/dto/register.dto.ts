import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { PlanType } from '../../users/entities/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'juan@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Juan García' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ enum: PlanType, example: PlanType.PARTICULAR })
  @IsEnum(PlanType)
  planType: PlanType;

  @ApiPropertyOptional({ example: 'Transportes García S.L.' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: 'transport' })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiPropertyOptional({ example: 'ES' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '+34 612 345 678' })
  @IsOptional()
  @IsString()
  phone?: string;
}

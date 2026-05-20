import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ContentType, ContentAccessLevel } from '../entities/content.entity';

export class CreateContentDto {
  @ApiProperty({ example: 'Cómo optimizar el precio del diésel' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 'como-optimizar-precio-diesel' })
  @IsString()
  slug: string;

  @ApiProperty({ enum: ContentType })
  @IsEnum(ContentType)
  type: ContentType;

  @ApiPropertyOptional({ example: 'pricing' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ enum: ContentAccessLevel, default: ContentAccessLevel.PARTICULAR })
  @IsOptional()
  @IsEnum(ContentAccessLevel)
  accessLevel?: ContentAccessLevel;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

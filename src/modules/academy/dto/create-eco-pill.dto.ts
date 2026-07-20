import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { EcoPillCategory, EcoDifficulty } from '../entities/eco-pill.entity';

export class CreateEcoPillDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsEnum(EcoPillCategory)
  category?: EcoPillCategory;

  @IsOptional()
  @IsNumber()
  durationMin?: number;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsEnum(EcoDifficulty)
  difficulty?: EcoDifficulty;

  @IsOptional()
  @IsString()
  accessLevel?: string; // 'free' | 'particular' | 'empresa'

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

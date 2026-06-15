import { IsString, IsNotEmpty } from 'class-validator';

export class EcoAcademyProgressDto {
  @IsString()
  @IsNotEmpty()
  completedPill: string; // pill ID to mark as completed
}

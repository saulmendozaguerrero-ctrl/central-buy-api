import { IsOptional, IsNumber, IsString, IsBoolean, IsArray } from 'class-validator';

export class OnboardingParticularDto {
  @IsOptional()
  @IsNumber()
  numberOfTripsMonthly?: number;

  @IsOptional()
  @IsArray()
  fuelTypes?: string[]; // ['diesel', 'gasoline', 'lpg']

  @IsOptional()
  @IsString()
  primaryLocation?: string;

  @IsOptional()
  @IsBoolean()
  phoneNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;
}

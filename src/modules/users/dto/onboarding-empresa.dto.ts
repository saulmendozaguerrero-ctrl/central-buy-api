import { IsOptional, IsNumber, IsString, IsBoolean, IsArray } from 'class-validator';

export class OnboardingEmpresaDto {
  @IsOptional()
  @IsString()
  taxId?: string; // CIF/NIF

  @IsOptional()
  @IsString()
  companySize?: string; // '1-10', '11-50', '50+'

  @IsOptional()
  @IsNumber()
  monthlyVolumeLiters?: number;

  @IsOptional()
  @IsArray()
  locations?: string[]; // múltiples ubicaciones

  @IsOptional()
  @IsNumber()
  teamSize?: number;

  @IsOptional()
  @IsBoolean()
  alertsEnabled?: boolean;
}

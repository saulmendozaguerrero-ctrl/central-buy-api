import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { OrgMemberRole } from '../entities/org-member.entity';

export class InviteMemberDto {
  @ApiProperty({ example: 'conductor@empresa.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ enum: OrgMemberRole, default: OrgMemberRole.DRIVER })
  @IsOptional()
  @IsEnum(OrgMemberRole)
  role?: OrgMemberRole;
}

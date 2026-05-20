import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PlanGuard } from '../../common/guards/plan.guard';
import { PlanRequired } from '../../common/decorators/plan-required.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { OrgMemberRole } from './entities/org-member.entity';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class UpdateRoleDto {
  @ApiProperty({ enum: OrgMemberRole })
  @IsEnum(OrgMemberRole)
  role: OrgMemberRole;
}

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(AuthGuard, PlanGuard)
@PlanRequired('empresa')
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: '[Empresa] Create your organization' })
  async create(@Body() dto: CreateOrgDto, @CurrentUser() user: User) {
    return this.orgService.create(dto, user.id);
  }

  @Get('me')
  @ApiOperation({ summary: '[Empresa] Get my organization details' })
  async getMyOrg(@CurrentUser() user: User) {
    return this.orgService.getMyOrg(user.id);
  }

  @Post('invite')
  @ApiOperation({ summary: '[Empresa] Invite a member by email' })
  async invite(@Body() dto: InviteMemberDto, @CurrentUser() user: User) {
    const org = await this.orgService.getMyOrg(user.id);
    if (!org) throw new Error('Create an organization first');
    return this.orgService.inviteMember(org.id, dto);
  }

  @Get('members')
  @ApiOperation({ summary: '[Empresa] List organization members' })
  async getMembers(@CurrentUser() user: User) {
    const org = await this.orgService.getMyOrg(user.id);
    if (!org) return [];
    return this.orgService.getMembers(org.id);
  }

  @Patch('members/:id/role')
  @ApiOperation({ summary: '[Empresa] Update member role' })
  async updateRole(
    @Param('id') memberId: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: User,
  ) {
    const org = await this.orgService.getMyOrg(user.id);
    if (!org) throw new Error('Organization not found');
    return this.orgService.updateMemberRole(memberId, org.id, dto.role);
  }

  @Delete('members/:id')
  @ApiOperation({ summary: '[Empresa] Remove a member' })
  async removeMember(@Param('id') memberId: string, @CurrentUser() user: User) {
    const org = await this.orgService.getMyOrg(user.id);
    if (!org) throw new Error('Organization not found');
    await this.orgService.removeMember(memberId, org.id);
    return { removed: true };
  }
}

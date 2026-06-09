import { OrganizationsService } from './organizations.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { User } from '../users/entities/user.entity';
import { OrgMemberRole } from './entities/org-member.entity';
declare class UpdateRoleDto {
    role: OrgMemberRole;
}
export declare class OrganizationsController {
    private readonly orgService;
    constructor(orgService: OrganizationsService);
    create(dto: CreateOrgDto, user: User): Promise<import("./entities/organization.entity").Organization>;
    getMyOrg(user: User): Promise<import("./entities/organization.entity").Organization | null>;
    invite(dto: InviteMemberDto, user: User): Promise<import("./entities/org-member.entity").OrgMember>;
    getMembers(user: User): Promise<import("./entities/org-member.entity").OrgMember[]>;
    updateRole(memberId: string, dto: UpdateRoleDto, user: User): Promise<import("./entities/org-member.entity").OrgMember>;
    removeMember(memberId: string, user: User): Promise<{
        removed: boolean;
    }>;
}
export {};

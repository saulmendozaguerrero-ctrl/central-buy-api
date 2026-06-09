import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { OrgMember, OrgMemberRole } from './entities/org-member.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrgDto } from './dto/create-org.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
export declare class OrganizationsService {
    private readonly orgRepo;
    private readonly memberRepo;
    private readonly userRepo;
    constructor(orgRepo: Repository<Organization>, memberRepo: Repository<OrgMember>, userRepo: Repository<User>);
    create(dto: CreateOrgDto, ownerId: string): Promise<Organization>;
    getMyOrg(userId: string): Promise<Organization | null>;
    getOrgForUser(userId: string): Promise<Organization | null>;
    inviteMember(orgId: string, dto: InviteMemberDto): Promise<OrgMember>;
    getMembers(orgId: string): Promise<OrgMember[]>;
    updateMemberRole(memberId: string, orgId: string, role: OrgMemberRole): Promise<OrgMember>;
    removeMember(memberId: string, orgId: string): Promise<void>;
}

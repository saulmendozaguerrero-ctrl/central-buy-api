import { Organization } from './organization.entity';
import { User } from '../../users/entities/user.entity';
export declare enum OrgMemberRole {
    ADMIN = "admin",
    MANAGER = "manager",
    VIEWER = "viewer",
    DRIVER = "driver"
}
export declare class OrgMember {
    id: string;
    organization: Organization;
    orgId: string;
    user: User;
    userId: string;
    role: OrgMemberRole;
    invitedEmail: string;
    invitedAt: Date;
    joinedAt: Date;
}

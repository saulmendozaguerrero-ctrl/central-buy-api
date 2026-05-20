import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { OrgMember, OrgMemberRole } from './entities/org-member.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrgDto } from './dto/create-org.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    @InjectRepository(OrgMember)
    private readonly memberRepo: Repository<OrgMember>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateOrgDto, ownerId: string): Promise<Organization> {
    const existing = await this.orgRepo.findOne({ where: { ownerId } });
    if (existing) {
      throw new ConflictException('You already have an organization');
    }

    const org = this.orgRepo.create({ ...dto, ownerId });
    const saved = await this.orgRepo.save(org);

    // Owner is automatically an admin member
    const member = this.memberRepo.create({
      orgId: saved.id,
      userId: ownerId,
      role: OrgMemberRole.ADMIN,
      joinedAt: new Date(),
    });
    await this.memberRepo.save(member);

    return saved;
  }

  async getMyOrg(userId: string): Promise<Organization | null> {
    return this.orgRepo.findOne({ where: { ownerId: userId } });
  }

  async getOrgForUser(userId: string): Promise<Organization | null> {
    const member = await this.memberRepo.findOne({
      where: { userId },
      relations: { organization: true },
    });
    return member?.organization ?? null;
  }

  async inviteMember(orgId: string, dto: InviteMemberDto): Promise<OrgMember> {
    const org = await this.orgRepo.findOne({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');

    const currentCount = await this.memberRepo.count({ where: { orgId } });
    if (currentCount >= org.maxUsers) {
      throw new BadRequestException(
        `Member limit reached (${org.maxUsers} max). Upgrade your plan to add more.`,
      );
    }

    const user = await this.userRepo.findOne({ where: { email: dto.email } });

    const member = this.memberRepo.create({
      orgId,
      userId: user?.id ?? dto.email,
      invitedEmail: dto.email,
      role: dto.role ?? OrgMemberRole.DRIVER,
      joinedAt: user ? new Date() : undefined,
    });

    return this.memberRepo.save(member);
  }

  async getMembers(orgId: string): Promise<OrgMember[]> {
    return this.memberRepo.find({
      where: { orgId },
      relations: { user: true },
      order: { invitedAt: 'ASC' },
    });
  }

  async updateMemberRole(
    memberId: string,
    orgId: string,
    role: OrgMemberRole,
  ): Promise<OrgMember> {
    const member = await this.memberRepo.findOne({ where: { id: memberId, orgId } });
    if (!member) throw new NotFoundException('Member not found');
    member.role = role;
    return this.memberRepo.save(member);
  }

  async removeMember(memberId: string, orgId: string): Promise<void> {
    const member = await this.memberRepo.findOne({ where: { id: memberId, orgId } });
    if (!member) throw new NotFoundException('Member not found');
    await this.memberRepo.remove(member);
  }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const organization_entity_1 = require("./entities/organization.entity");
const org_member_entity_1 = require("./entities/org-member.entity");
const user_entity_1 = require("../users/entities/user.entity");
let OrganizationsService = class OrganizationsService {
    orgRepo;
    memberRepo;
    userRepo;
    constructor(orgRepo, memberRepo, userRepo) {
        this.orgRepo = orgRepo;
        this.memberRepo = memberRepo;
        this.userRepo = userRepo;
    }
    async create(dto, ownerId) {
        const existing = await this.orgRepo.findOne({ where: { ownerId } });
        if (existing) {
            throw new common_1.ConflictException('You already have an organization');
        }
        const org = this.orgRepo.create({ ...dto, ownerId });
        const saved = await this.orgRepo.save(org);
        const member = this.memberRepo.create({
            orgId: saved.id,
            userId: ownerId,
            role: org_member_entity_1.OrgMemberRole.ADMIN,
            joinedAt: new Date(),
        });
        await this.memberRepo.save(member);
        return saved;
    }
    async getMyOrg(userId) {
        return this.orgRepo.findOne({ where: { ownerId: userId } });
    }
    async getOrgForUser(userId) {
        const member = await this.memberRepo.findOne({
            where: { userId },
            relations: { organization: true },
        });
        return member?.organization ?? null;
    }
    async inviteMember(orgId, dto) {
        const org = await this.orgRepo.findOne({ where: { id: orgId } });
        if (!org)
            throw new common_1.NotFoundException('Organization not found');
        const currentCount = await this.memberRepo.count({ where: { orgId } });
        if (currentCount >= org.maxUsers) {
            throw new common_1.BadRequestException(`Member limit reached (${org.maxUsers} max). Upgrade your plan to add more.`);
        }
        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        const member = this.memberRepo.create({
            orgId,
            userId: user?.id ?? dto.email,
            invitedEmail: dto.email,
            role: dto.role ?? org_member_entity_1.OrgMemberRole.DRIVER,
            joinedAt: user ? new Date() : undefined,
        });
        return this.memberRepo.save(member);
    }
    async getMembers(orgId) {
        return this.memberRepo.find({
            where: { orgId },
            relations: { user: true },
            order: { invitedAt: 'ASC' },
        });
    }
    async updateMemberRole(memberId, orgId, role) {
        const member = await this.memberRepo.findOne({ where: { id: memberId, orgId } });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        member.role = role;
        return this.memberRepo.save(member);
    }
    async removeMember(memberId, orgId) {
        const member = await this.memberRepo.findOne({ where: { id: memberId, orgId } });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        await this.memberRepo.remove(member);
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __param(1, (0, typeorm_1.InjectRepository)(org_member_entity_1.OrgMember)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map
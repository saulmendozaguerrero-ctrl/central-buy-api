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
exports.OrganizationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const organizations_service_1 = require("./organizations.service");
const create_org_dto_1 = require("./dto/create-org.dto");
const invite_member_dto_1 = require("./dto/invite-member.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const plan_guard_1 = require("../../common/guards/plan.guard");
const plan_required_decorator_1 = require("../../common/decorators/plan-required.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const org_member_entity_1 = require("./entities/org-member.entity");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
class UpdateRoleDto {
    role;
}
__decorate([
    (0, swagger_2.ApiProperty)({ enum: org_member_entity_1.OrgMemberRole }),
    (0, class_validator_1.IsEnum)(org_member_entity_1.OrgMemberRole),
    __metadata("design:type", String)
], UpdateRoleDto.prototype, "role", void 0);
let OrganizationsController = class OrganizationsController {
    orgService;
    constructor(orgService) {
        this.orgService = orgService;
    }
    async create(dto, user) {
        return this.orgService.create(dto, user.id);
    }
    async getMyOrg(user) {
        return this.orgService.getMyOrg(user.id);
    }
    async invite(dto, user) {
        const org = await this.orgService.getMyOrg(user.id);
        if (!org)
            throw new Error('Create an organization first');
        return this.orgService.inviteMember(org.id, dto);
    }
    async getMembers(user) {
        const org = await this.orgService.getMyOrg(user.id);
        if (!org)
            return [];
        return this.orgService.getMembers(org.id);
    }
    async updateRole(memberId, dto, user) {
        const org = await this.orgService.getMyOrg(user.id);
        if (!org)
            throw new Error('Organization not found');
        return this.orgService.updateMemberRole(memberId, org.id, dto.role);
    }
    async removeMember(memberId, user) {
        const org = await this.orgService.getMyOrg(user.id);
        if (!org)
            throw new Error('Organization not found');
        await this.orgService.removeMember(memberId, org.id);
        return { removed: true };
    }
};
exports.OrganizationsController = OrganizationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '[Empresa] Create your organization' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_org_dto_1.CreateOrgDto, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: '[Empresa] Get my organization details' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "getMyOrg", null);
__decorate([
    (0, common_1.Post)('invite'),
    (0, swagger_1.ApiOperation)({ summary: '[Empresa] Invite a member by email' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invite_member_dto_1.InviteMemberDto, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "invite", null);
__decorate([
    (0, common_1.Get)('members'),
    (0, swagger_1.ApiOperation)({ summary: '[Empresa] List organization members' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Patch)('members/:id/role'),
    (0, swagger_1.ApiOperation)({ summary: '[Empresa] Update member role' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateRoleDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)('members/:id'),
    (0, swagger_1.ApiOperation)({ summary: '[Empresa] Remove a member' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "removeMember", null);
exports.OrganizationsController = OrganizationsController = __decorate([
    (0, swagger_1.ApiTags)('Organizations'),
    (0, common_1.Controller)('organizations'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, plan_guard_1.PlanGuard),
    (0, plan_required_decorator_1.PlanRequired)('empresa'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [organizations_service_1.OrganizationsService])
], OrganizationsController);
//# sourceMappingURL=organizations.controller.js.map
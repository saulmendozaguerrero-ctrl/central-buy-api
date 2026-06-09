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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgMember = exports.OrgMemberRole = void 0;
const typeorm_1 = require("typeorm");
const organization_entity_1 = require("./organization.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var OrgMemberRole;
(function (OrgMemberRole) {
    OrgMemberRole["ADMIN"] = "admin";
    OrgMemberRole["MANAGER"] = "manager";
    OrgMemberRole["VIEWER"] = "viewer";
    OrgMemberRole["DRIVER"] = "driver";
})(OrgMemberRole || (exports.OrgMemberRole = OrgMemberRole = {}));
let OrgMember = class OrgMember {
    id;
    organization;
    orgId;
    user;
    userId;
    role;
    invitedEmail;
    invitedAt;
    joinedAt;
};
exports.OrgMember = OrgMember;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OrgMember.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organization, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'org_id' }),
    __metadata("design:type", organization_entity_1.Organization)
], OrgMember.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'org_id' }),
    __metadata("design:type", String)
], OrgMember.prototype, "orgId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], OrgMember.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], OrgMember.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: OrgMemberRole, default: OrgMemberRole.VIEWER }),
    __metadata("design:type", String)
], OrgMember.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], OrgMember.prototype, "invitedEmail", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], OrgMember.prototype, "invitedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], OrgMember.prototype, "joinedAt", void 0);
exports.OrgMember = OrgMember = __decorate([
    (0, typeorm_1.Entity)('org_members')
], OrgMember);
//# sourceMappingURL=org-member.entity.js.map
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
exports.EcoScore = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const organization_entity_1 = require("../../organizations/entities/organization.entity");
let EcoScore = class EcoScore {
    id;
    driver;
    driverId;
    organization;
    orgId;
    periodStart;
    periodEnd;
    score;
    avgConsumption;
    totalKm;
    totalLiters;
    tips;
    createdAt;
};
exports.EcoScore = EcoScore;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EcoScore.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'driver_id' }),
    __metadata("design:type", user_entity_1.User)
], EcoScore.prototype, "driver", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'driver_id' }),
    __metadata("design:type", String)
], EcoScore.prototype, "driverId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organization, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'org_id' }),
    __metadata("design:type", organization_entity_1.Organization)
], EcoScore.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'org_id' }),
    __metadata("design:type", String)
], EcoScore.prototype, "orgId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], EcoScore.prototype, "periodStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], EcoScore.prototype, "periodEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], EcoScore.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 6, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EcoScore.prototype, "avgConsumption", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], EcoScore.prototype, "totalKm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EcoScore.prototype, "totalLiters", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], EcoScore.prototype, "tips", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EcoScore.prototype, "createdAt", void 0);
exports.EcoScore = EcoScore = __decorate([
    (0, typeorm_1.Entity)('eco_scores')
], EcoScore);
//# sourceMappingURL=eco-score.entity.js.map
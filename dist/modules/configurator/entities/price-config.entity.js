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
exports.PriceConfig = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let PriceConfig = class PriceConfig {
    id;
    user;
    userId;
    name;
    product;
    purchasePrice;
    operatingCosts;
    desiredMargin;
    recommendedPrice;
    zoneAvgPrice;
    createdAt;
    updatedAt;
};
exports.PriceConfig = PriceConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PriceConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], PriceConfig.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], PriceConfig.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PriceConfig.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PriceConfig.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4 }),
    __metadata("design:type", Number)
], PriceConfig.prototype, "purchasePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], PriceConfig.prototype, "operatingCosts", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], PriceConfig.prototype, "desiredMargin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], PriceConfig.prototype, "recommendedPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], PriceConfig.prototype, "zoneAvgPrice", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PriceConfig.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PriceConfig.prototype, "updatedAt", void 0);
exports.PriceConfig = PriceConfig = __decorate([
    (0, typeorm_1.Entity)('price_configs')
], PriceConfig);
//# sourceMappingURL=price-config.entity.js.map
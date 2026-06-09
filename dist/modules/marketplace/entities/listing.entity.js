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
exports.MarketplaceListing = exports.ListingStatus = exports.ListingType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var ListingType;
(function (ListingType) {
    ListingType["OFFER"] = "offer";
    ListingType["DEMAND"] = "demand";
})(ListingType || (exports.ListingType = ListingType = {}));
var ListingStatus;
(function (ListingStatus) {
    ListingStatus["ACTIVE"] = "active";
    ListingStatus["CLOSED"] = "closed";
    ListingStatus["EXPIRED"] = "expired";
})(ListingStatus || (exports.ListingStatus = ListingStatus = {}));
let MarketplaceListing = class MarketplaceListing {
    id;
    user;
    userId;
    type;
    product;
    volumeMt;
    pricePerMt;
    currency;
    location;
    deliveryTerms;
    description;
    validUntil;
    status;
    createdAt;
};
exports.MarketplaceListing = MarketplaceListing;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MarketplaceListing.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], MarketplaceListing.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], MarketplaceListing.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ListingType }),
    __metadata("design:type", String)
], MarketplaceListing.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MarketplaceListing.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], MarketplaceListing.prototype, "volumeMt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], MarketplaceListing.prototype, "pricePerMt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'EUR' }),
    __metadata("design:type", String)
], MarketplaceListing.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MarketplaceListing.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MarketplaceListing.prototype, "deliveryTerms", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MarketplaceListing.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], MarketplaceListing.prototype, "validUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ListingStatus, default: ListingStatus.ACTIVE }),
    __metadata("design:type", String)
], MarketplaceListing.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MarketplaceListing.prototype, "createdAt", void 0);
exports.MarketplaceListing = MarketplaceListing = __decorate([
    (0, typeorm_1.Entity)('marketplace_listings')
], MarketplaceListing);
//# sourceMappingURL=listing.entity.js.map
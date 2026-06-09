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
exports.FuelPrice = exports.FuelRegion = exports.FuelProduct = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var FuelProduct;
(function (FuelProduct) {
    FuelProduct["DIESEL"] = "diesel";
    FuelProduct["GASOLINE"] = "gasoline";
    FuelProduct["FUEL_OIL"] = "fuel_oil";
    FuelProduct["BIODIESEL"] = "biodiesel";
    FuelProduct["JET_FUEL"] = "jet_fuel";
    FuelProduct["CRUDE"] = "crude";
})(FuelProduct || (exports.FuelProduct = FuelProduct = {}));
var FuelRegion;
(function (FuelRegion) {
    FuelRegion["EUROPE"] = "europe";
    FuelRegion["LATAM"] = "latam";
    FuelRegion["MIDDLE_EAST"] = "middle_east";
    FuelRegion["ASIA"] = "asia";
    FuelRegion["AFRICA"] = "africa";
    FuelRegion["NORTH_AMERICA"] = "north_america";
})(FuelRegion || (exports.FuelRegion = FuelRegion = {}));
let FuelPrice = class FuelPrice {
    id;
    product;
    region;
    country;
    priceUsd;
    priceEur;
    unit;
    source;
    priceDate;
    createdAt;
    createdBy;
};
exports.FuelPrice = FuelPrice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FuelPrice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: FuelProduct }),
    __metadata("design:type", String)
], FuelPrice.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: FuelRegion }),
    __metadata("design:type", String)
], FuelPrice.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FuelPrice.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4 }),
    __metadata("design:type", Number)
], FuelPrice.prototype, "priceUsd", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4 }),
    __metadata("design:type", Number)
], FuelPrice.prototype, "priceEur", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'metric_ton' }),
    __metadata("design:type", String)
], FuelPrice.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'manual' }),
    __metadata("design:type", String)
], FuelPrice.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], FuelPrice.prototype, "priceDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FuelPrice.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], FuelPrice.prototype, "createdBy", void 0);
exports.FuelPrice = FuelPrice = __decorate([
    (0, typeorm_1.Entity)('fuel_prices'),
    (0, typeorm_1.Index)(['product', 'region', 'priceDate'])
], FuelPrice);
//# sourceMappingURL=fuel-price.entity.js.map
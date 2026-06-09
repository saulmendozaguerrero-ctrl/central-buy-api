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
exports.CreatePriceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const fuel_price_entity_1 = require("../entities/fuel-price.entity");
class CreatePriceDto {
    product;
    region;
    country;
    priceUsd;
    priceEur;
    unit;
    priceDate;
}
exports.CreatePriceDto = CreatePriceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: fuel_price_entity_1.FuelProduct }),
    (0, class_validator_1.IsEnum)(fuel_price_entity_1.FuelProduct),
    __metadata("design:type", String)
], CreatePriceDto.prototype, "product", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: fuel_price_entity_1.FuelRegion }),
    (0, class_validator_1.IsEnum)(fuel_price_entity_1.FuelRegion),
    __metadata("design:type", String)
], CreatePriceDto.prototype, "region", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ES' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePriceDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 650.5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePriceDto.prototype, "priceUsd", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 610.25 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePriceDto.prototype, "priceEur", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'metric_ton' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePriceDto.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-20' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePriceDto.prototype, "priceDate", void 0);
//# sourceMappingURL=create-price.dto.js.map
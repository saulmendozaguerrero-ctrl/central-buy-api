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
exports.PriceHistoryQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const fuel_price_entity_1 = require("../entities/fuel-price.entity");
class PriceHistoryQueryDto {
    product;
    region;
    from;
    to;
}
exports.PriceHistoryQueryDto = PriceHistoryQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: fuel_price_entity_1.FuelProduct }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(fuel_price_entity_1.FuelProduct),
    __metadata("design:type", String)
], PriceHistoryQueryDto.prototype, "product", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: fuel_price_entity_1.FuelRegion }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(fuel_price_entity_1.FuelRegion),
    __metadata("design:type", String)
], PriceHistoryQueryDto.prototype, "region", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-01-01' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PriceHistoryQueryDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-05-20' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PriceHistoryQueryDto.prototype, "to", void 0);
//# sourceMappingURL=price-query.dto.js.map
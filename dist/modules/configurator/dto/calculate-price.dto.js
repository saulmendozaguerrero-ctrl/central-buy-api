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
exports.CalculatePriceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CalculatePriceDto {
    purchasePrice;
    operatingCosts;
    desiredMargin;
    zoneAvgPrice;
    product;
    saveName;
}
exports.CalculatePriceDto = CalculatePriceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Purchase price per metric ton', example: 620.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CalculatePriceDto.prototype, "purchasePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Operating costs per metric ton', example: 45.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CalculatePriceDto.prototype, "operatingCosts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Desired margin percentage', example: 8.5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CalculatePriceDto.prototype, "desiredMargin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Zone average price for comparison', example: 710.0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CalculatePriceDto.prototype, "zoneAvgPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'diesel' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalculatePriceDto.prototype, "product", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Save this configuration', example: 'Diesel Europa Mayo' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalculatePriceDto.prototype, "saveName", void 0);
//# sourceMappingURL=calculate-price.dto.js.map
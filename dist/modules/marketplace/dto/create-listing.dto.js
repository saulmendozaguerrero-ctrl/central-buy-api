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
exports.CreateListingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const listing_entity_1 = require("../entities/listing.entity");
class CreateListingDto {
    type;
    product;
    volumeMt;
    pricePerMt;
    currency;
    location;
    deliveryTerms;
    description;
    validUntil;
}
exports.CreateListingDto = CreateListingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: listing_entity_1.ListingType }),
    (0, class_validator_1.IsEnum)(listing_entity_1.ListingType),
    __metadata("design:type", String)
], CreateListingDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'diesel' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateListingDto.prototype, "product", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Volume in metric tons', example: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateListingDto.prototype, "volumeMt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Price per metric ton', example: 720.5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateListingDto.prototype, "pricePerMt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'EUR' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Barcelona, España' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'CIF Valencia' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "deliveryTerms", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-06-30' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "validUntil", void 0);
//# sourceMappingURL=create-listing.dto.js.map
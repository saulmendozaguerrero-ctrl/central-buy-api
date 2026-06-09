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
exports.CreateFuelLogDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateFuelLogDto {
    vehicleId;
    liters;
    costEur;
    odometerKm;
    stationName;
    location;
    fuelType;
    loggedAt;
}
exports.CreateFuelLogDto = CreateFuelLogDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateFuelLogDto.prototype, "vehicleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 80.5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateFuelLogDto.prototype, "liters", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 112.75 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateFuelLogDto.prototype, "costEur", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 125430 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateFuelLogDto.prototype, "odometerKm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Repsol Madrid Norte' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFuelLogDto.prototype, "stationName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Madrid, España' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFuelLogDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'diesel' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFuelLogDto.prototype, "fuelType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-20T08:30:00Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateFuelLogDto.prototype, "loggedAt", void 0);
//# sourceMappingURL=create-fuel-log.dto.js.map
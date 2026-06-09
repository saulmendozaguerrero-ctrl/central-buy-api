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
exports.CreateVehicleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const vehicle_entity_1 = require("../entities/vehicle.entity");
class CreateVehicleDto {
    plate;
    type;
    brand;
    model;
    fuelType;
    avgConsumption;
    assignedDriverId;
}
exports.CreateVehicleDto = CreateVehicleDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1234 ABC' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "plate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: vehicle_entity_1.VehicleType }),
    (0, class_validator_1.IsEnum)(vehicle_entity_1.VehicleType),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Mercedes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Actros' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: vehicle_entity_1.VehicleFuelType }),
    (0, class_validator_1.IsEnum)(vehicle_entity_1.VehicleFuelType),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "fuelType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Average consumption L/100km', example: 8.5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "avgConsumption", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "assignedDriverId", void 0);
//# sourceMappingURL=create-vehicle.dto.js.map
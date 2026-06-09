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
exports.Vehicle = exports.VehicleFuelType = exports.VehicleType = void 0;
const typeorm_1 = require("typeorm");
const organization_entity_1 = require("../../organizations/entities/organization.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var VehicleType;
(function (VehicleType) {
    VehicleType["CAR"] = "car";
    VehicleType["VAN"] = "van";
    VehicleType["TRUCK"] = "truck";
    VehicleType["BUS"] = "bus";
    VehicleType["MACHINERY"] = "machinery";
    VehicleType["BOAT"] = "boat";
    VehicleType["OTHER"] = "other";
})(VehicleType || (exports.VehicleType = VehicleType = {}));
var VehicleFuelType;
(function (VehicleFuelType) {
    VehicleFuelType["DIESEL"] = "diesel";
    VehicleFuelType["GASOLINE"] = "gasoline";
    VehicleFuelType["LPG"] = "lpg";
    VehicleFuelType["ELECTRIC"] = "electric";
    VehicleFuelType["HYBRID"] = "hybrid";
})(VehicleFuelType || (exports.VehicleFuelType = VehicleFuelType = {}));
let Vehicle = class Vehicle {
    id;
    organization;
    orgId;
    plate;
    type;
    brand;
    model;
    fuelType;
    avgConsumption;
    assignedDriver;
    assignedDriverId;
    active;
    createdAt;
};
exports.Vehicle = Vehicle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Vehicle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organization, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'org_id' }),
    __metadata("design:type", organization_entity_1.Organization)
], Vehicle.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'org_id' }),
    __metadata("design:type", String)
], Vehicle.prototype, "orgId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Vehicle.prototype, "plate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: VehicleType }),
    __metadata("design:type", String)
], Vehicle.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Vehicle.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Vehicle.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: VehicleFuelType }),
    __metadata("design:type", String)
], Vehicle.prototype, "fuelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 6, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Vehicle.prototype, "avgConsumption", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_driver_id' }),
    __metadata("design:type", user_entity_1.User)
], Vehicle.prototype, "assignedDriver", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_driver_id', nullable: true }),
    __metadata("design:type", String)
], Vehicle.prototype, "assignedDriverId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Vehicle.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Vehicle.prototype, "createdAt", void 0);
exports.Vehicle = Vehicle = __decorate([
    (0, typeorm_1.Entity)('vehicles')
], Vehicle);
//# sourceMappingURL=vehicle.entity.js.map
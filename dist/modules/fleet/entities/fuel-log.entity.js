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
exports.FuelLog = void 0;
const typeorm_1 = require("typeorm");
const vehicle_entity_1 = require("./vehicle.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const organization_entity_1 = require("../../organizations/entities/organization.entity");
let FuelLog = class FuelLog {
    id;
    vehicle;
    vehicleId;
    driver;
    driverId;
    organization;
    orgId;
    liters;
    costEur;
    odometerKm;
    stationName;
    location;
    fuelType;
    loggedAt;
    createdAt;
};
exports.FuelLog = FuelLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FuelLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vehicle_entity_1.Vehicle, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'vehicle_id' }),
    __metadata("design:type", vehicle_entity_1.Vehicle)
], FuelLog.prototype, "vehicle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vehicle_id' }),
    __metadata("design:type", String)
], FuelLog.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'driver_id' }),
    __metadata("design:type", user_entity_1.User)
], FuelLog.prototype, "driver", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'driver_id' }),
    __metadata("design:type", String)
], FuelLog.prototype, "driverId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organization, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'org_id' }),
    __metadata("design:type", organization_entity_1.Organization)
], FuelLog.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'org_id' }),
    __metadata("design:type", String)
], FuelLog.prototype, "orgId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], FuelLog.prototype, "liters", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], FuelLog.prototype, "costEur", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], FuelLog.prototype, "odometerKm", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FuelLog.prototype, "stationName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FuelLog.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FuelLog.prototype, "fuelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], FuelLog.prototype, "loggedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FuelLog.prototype, "createdAt", void 0);
exports.FuelLog = FuelLog = __decorate([
    (0, typeorm_1.Entity)('fuel_logs')
], FuelLog);
//# sourceMappingURL=fuel-log.entity.js.map
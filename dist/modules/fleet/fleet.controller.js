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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FleetController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fleet_service_1 = require("./fleet.service");
const create_vehicle_dto_1 = require("./dto/create-vehicle.dto");
const create_fuel_log_dto_1 = require("./dto/create-fuel-log.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const plan_guard_1 = require("../../common/guards/plan.guard");
const plan_required_decorator_1 = require("../../common/decorators/plan-required.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let FleetController = class FleetController {
    fleetService;
    constructor(fleetService) {
        this.fleetService = fleetService;
    }
    async getVehicles(user) {
        return this.fleetService.getVehicles(user.id);
    }
    async createVehicle(dto, user) {
        return this.fleetService.createVehicle(user.id, dto);
    }
    async updateVehicle(id, dto, user) {
        return this.fleetService.updateVehicle(id, user.id, dto);
    }
    async deleteVehicle(id, user) {
        await this.fleetService.deleteVehicle(id, user.id);
        return { deleted: true };
    }
    async createFuelLog(dto, user) {
        return this.fleetService.createFuelLog(user.id, user.id, dto);
    }
    async getFuelLogs(user, vehicleId, from, to) {
        return this.fleetService.getFuelLogs(user.id, vehicleId, from, to);
    }
    async getDashboard(user) {
        return this.fleetService.getDashboard(user.id);
    }
    async getEcoScores(user) {
        return this.fleetService.getEcoScores(user.id);
    }
    async getDriverScore(driverId, user) {
        return this.fleetService.getDriverEcoScore(driverId, user.id);
    }
};
exports.FleetController = FleetController;
__decorate([
    (0, common_1.Get)('vehicles'),
    (0, swagger_1.ApiOperation)({ summary: '[Empresa] List organization vehicles' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "getVehicles", null);
__decorate([
    (0, common_1.Post)('vehicles'),
    (0, swagger_1.ApiOperation)({ summary: '[Empresa] Add a vehicle to the fleet' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vehicle_dto_1.CreateVehicleDto, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "createVehicle", null);
__decorate([
    (0, common_1.Patch)('vehicles/:id'),
    (0, swagger_1.ApiOperation)({ summary: '[Empresa] Update vehicle data' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "updateVehicle", null);
__decorate([
    (0, common_1.Delete)('vehicles/:id'),
    (0, swagger_1.ApiOperation)({ summary: '[Empresa] Deactivate a vehicle' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "deleteVehicle", null);
__decorate([
    (0, common_1.Post)('fuel-logs'),
    (0, swagger_1.ApiOperation)({ summary: '[Empresa] Record a fuel fill-up' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_fuel_log_dto_1.CreateFuelLogDto, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "createFuelLog", null);
__decorate([
    (0, common_1.Get)('fuel-logs'),
    (0, swagger_1.ApiOperation)({ summary: '[Empresa] Get fuel log history' }),
    (0, swagger_1.ApiQuery)({ name: 'vehicleId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('vehicleId')),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, String, String]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "getFuelLogs", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: '[Empresa] Fleet spending dashboard summary' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('eco-scores'),
    (0, swagger_1.ApiOperation)({ summary: '[Empresa] Get eco-driving scores for all drivers' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "getEcoScores", null);
__decorate([
    (0, common_1.Get)('eco-scores/driver/:driverId'),
    (0, swagger_1.ApiOperation)({ summary: '[Empresa] Get eco-driving score history for a driver' }),
    __param(0, (0, common_1.Param)('driverId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], FleetController.prototype, "getDriverScore", null);
exports.FleetController = FleetController = __decorate([
    (0, swagger_1.ApiTags)('Fleet'),
    (0, common_1.Controller)('fleet'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, plan_guard_1.PlanGuard),
    (0, plan_required_decorator_1.PlanRequired)('empresa'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [fleet_service_1.FleetService])
], FleetController);
//# sourceMappingURL=fleet.controller.js.map
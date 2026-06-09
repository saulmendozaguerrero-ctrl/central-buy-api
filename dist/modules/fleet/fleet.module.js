"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FleetModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const fleet_controller_1 = require("./fleet.controller");
const fleet_service_1 = require("./fleet.service");
const eco_score_service_1 = require("./eco-score.service");
const vehicle_entity_1 = require("./entities/vehicle.entity");
const fuel_log_entity_1 = require("./entities/fuel-log.entity");
const eco_score_entity_1 = require("./entities/eco-score.entity");
const report_entity_1 = require("./entities/report.entity");
const subscription_entity_1 = require("../subscriptions/entities/subscription.entity");
const users_module_1 = require("../users/users.module");
const user_entity_1 = require("../users/entities/user.entity");
let FleetModule = class FleetModule {
};
exports.FleetModule = FleetModule;
exports.FleetModule = FleetModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([vehicle_entity_1.Vehicle, fuel_log_entity_1.FuelLog, eco_score_entity_1.EcoScore, report_entity_1.Report, subscription_entity_1.Subscription, user_entity_1.User]), users_module_1.UsersModule],
        controllers: [fleet_controller_1.FleetController],
        providers: [fleet_service_1.FleetService, eco_score_service_1.EcoScoreService],
        exports: [fleet_service_1.FleetService, eco_score_service_1.EcoScoreService, typeorm_1.TypeOrmModule],
    })
], FleetModule);
//# sourceMappingURL=fleet.module.js.map
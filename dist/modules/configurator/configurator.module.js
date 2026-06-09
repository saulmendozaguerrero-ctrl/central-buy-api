"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguratorModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const configurator_controller_1 = require("./configurator.controller");
const configurator_service_1 = require("./configurator.service");
const price_config_entity_1 = require("./entities/price-config.entity");
const subscription_entity_1 = require("../subscriptions/entities/subscription.entity");
const users_module_1 = require("../users/users.module");
const user_entity_1 = require("../users/entities/user.entity");
let ConfiguratorModule = class ConfiguratorModule {
};
exports.ConfiguratorModule = ConfiguratorModule;
exports.ConfiguratorModule = ConfiguratorModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([price_config_entity_1.PriceConfig, subscription_entity_1.Subscription, user_entity_1.User]), users_module_1.UsersModule],
        controllers: [configurator_controller_1.ConfiguratorController],
        providers: [configurator_service_1.ConfiguratorService],
        exports: [configurator_service_1.ConfiguratorService],
    })
], ConfiguratorModule);
//# sourceMappingURL=configurator.module.js.map
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
exports.ConfiguratorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const configurator_service_1 = require("./configurator.service");
const calculate_price_dto_1 = require("./dto/calculate-price.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const plan_guard_1 = require("../../common/guards/plan.guard");
const plan_required_decorator_1 = require("../../common/decorators/plan-required.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let ConfiguratorController = class ConfiguratorController {
    configuratorService;
    constructor(configuratorService) {
        this.configuratorService = configuratorService;
    }
    async calculate(dto, user) {
        return this.configuratorService.calculateAndSave(dto, user.id);
    }
    async getSaved(user) {
        return this.configuratorService.getSavedConfigs(user.id);
    }
    async delete(id, user) {
        await this.configuratorService.deleteConfig(id, user.id);
        return { deleted: true };
    }
};
exports.ConfiguratorController = ConfiguratorController;
__decorate([
    (0, common_1.Post)('calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate recommended sale price + optionally save' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calculate_price_dto_1.CalculatePriceDto, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ConfiguratorController.prototype, "calculate", null);
__decorate([
    (0, common_1.Get)('saved'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my saved price configurations' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ConfiguratorController.prototype, "getSaved", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a saved price configuration' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ConfiguratorController.prototype, "delete", null);
exports.ConfiguratorController = ConfiguratorController = __decorate([
    (0, swagger_1.ApiTags)('Configurator'),
    (0, common_1.Controller)('configurator'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, plan_guard_1.PlanGuard),
    (0, plan_required_decorator_1.PlanRequired)('particular'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [configurator_service_1.ConfiguratorService])
], ConfiguratorController);
//# sourceMappingURL=configurator.controller.js.map
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
exports.ConfiguratorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const price_config_entity_1 = require("./entities/price-config.entity");
let ConfiguratorService = class ConfiguratorService {
    configRepo;
    constructor(configRepo) {
        this.configRepo = configRepo;
    }
    calculate(dto) {
        const totalCostBase = dto.purchasePrice + dto.operatingCosts;
        const marginAmount = totalCostBase * (dto.desiredMargin / 100);
        const recommendedPrice = totalCostBase + marginAmount;
        const result = {
            purchasePrice: dto.purchasePrice,
            operatingCosts: dto.operatingCosts,
            desiredMargin: dto.desiredMargin,
            totalCostBase: Math.round(totalCostBase * 100) / 100,
            marginAmount: Math.round(marginAmount * 100) / 100,
            recommendedPrice: Math.round(recommendedPrice * 100) / 100,
            simulation: {
                marginAt5pct: Math.round(totalCostBase * 1.05 * 100) / 100,
                marginAt10pct: Math.round(totalCostBase * 1.10 * 100) / 100,
                marginAt15pct: Math.round(totalCostBase * 1.15 * 100) / 100,
            },
        };
        if (dto.zoneAvgPrice) {
            result.zoneAvgPrice = dto.zoneAvgPrice;
            result.vsZoneAvg = Math.round(((recommendedPrice - dto.zoneAvgPrice) / dto.zoneAvgPrice) * 100 * 100) / 100;
        }
        return result;
    }
    async calculateAndSave(dto, userId) {
        const result = this.calculate(dto);
        if (!dto.saveName)
            return { result };
        const config = this.configRepo.create({
            userId,
            name: dto.saveName,
            product: dto.product,
            purchasePrice: dto.purchasePrice,
            operatingCosts: dto.operatingCosts,
            desiredMargin: dto.desiredMargin,
            recommendedPrice: result.recommendedPrice,
            zoneAvgPrice: dto.zoneAvgPrice,
        });
        const saved = await this.configRepo.save(config);
        return { result, saved };
    }
    async getSavedConfigs(userId) {
        return this.configRepo.find({
            where: { userId },
            order: { updatedAt: 'DESC' },
        });
    }
    async deleteConfig(id, userId) {
        const config = await this.configRepo.findOne({ where: { id, userId } });
        if (!config)
            throw new common_1.NotFoundException('Configuration not found');
        await this.configRepo.remove(config);
    }
};
exports.ConfiguratorService = ConfiguratorService;
exports.ConfiguratorService = ConfiguratorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(price_config_entity_1.PriceConfig)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConfiguratorService);
//# sourceMappingURL=configurator.service.js.map
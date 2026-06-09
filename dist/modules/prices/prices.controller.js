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
exports.PricesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prices_service_1 = require("./prices.service");
const price_query_dto_1 = require("./dto/price-query.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const fuel_price_entity_1 = require("./entities/fuel-price.entity");
let PricesController = class PricesController {
    pricesService;
    constructor(pricesService) {
        this.pricesService = pricesService;
    }
    async getLatest() { return this.pricesService.getLatest(); }
    async getBest() { return this.pricesService.getBestPrices(); }
    async seed() {
        const priceData = [
            { product: fuel_price_entity_1.FuelProduct.DIESEL, region: fuel_price_entity_1.FuelRegion.EUROPE, priceEur: 1171.50, priceUsd: 1285.00, priceDate: new Date().toISOString().split('T')[0] },
            { product: fuel_price_entity_1.FuelProduct.GASOLINE, region: fuel_price_entity_1.FuelRegion.EUROPE, priceEur: 987.30, priceUsd: 1082.50, priceDate: new Date().toISOString().split('T')[0] },
            { product: fuel_price_entity_1.FuelProduct.JET_FUEL, region: fuel_price_entity_1.FuelRegion.EUROPE, priceEur: 1043.20, priceUsd: 1144.00, priceDate: new Date().toISOString().split('T')[0] },
            { product: fuel_price_entity_1.FuelProduct.CRUDE, region: fuel_price_entity_1.FuelRegion.EUROPE, priceEur: 752.40, priceUsd: 825.00, priceDate: new Date().toISOString().split('T')[0] },
            { product: fuel_price_entity_1.FuelProduct.DIESEL, region: fuel_price_entity_1.FuelRegion.LATAM, priceEur: 1098.20, priceUsd: 1205.00, priceDate: new Date().toISOString().split('T')[0] },
        ];
        return await this.pricesService.uploadPrices(priceData, null);
    }
    async getHistory(query) { return this.pricesService.getHistory(query); }
    async getByProduct(product) { return this.pricesService.getByProduct(product); }
    async getByRegion(region) { return this.pricesService.getByRegion(region); }
};
exports.PricesController = PricesController;
__decorate([
    (0, common_1.Get)('latest'),
    (0, swagger_1.ApiOperation)({ summary: 'Get latest prices (PUBLIC)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PricesController.prototype, "getLatest", null);
__decorate([
    (0, common_1.Get)('best'),
    (0, swagger_1.ApiOperation)({ summary: 'Get best prices (PUBLIC)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PricesController.prototype, "getBest", null);
__decorate([
    (0, common_1.Get)('seed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PricesController.prototype, "seed", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Price history' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [price_query_dto_1.PriceHistoryQueryDto]),
    __metadata("design:returntype", Promise)
], PricesController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('product/:product'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Prices by product' }),
    __param(0, (0, common_1.Param)('product')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PricesController.prototype, "getByProduct", null);
__decorate([
    (0, common_1.Get)('region/:region'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Prices by region' }),
    __param(0, (0, common_1.Param)('region')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PricesController.prototype, "getByRegion", null);
exports.PricesController = PricesController = __decorate([
    (0, swagger_1.ApiTags)('Prices'),
    (0, common_1.Controller)('prices'),
    __metadata("design:paramtypes", [prices_service_1.PricesService])
], PricesController);
//# sourceMappingURL=prices.controller.js.map
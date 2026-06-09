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
var PricesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const common_2 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const fuel_price_entity_1 = require("./entities/fuel-price.entity");
const CACHE_TTL = 300;
const CACHE_KEY_LATEST = 'prices:latest';
const CACHE_KEY_BEST = 'prices:best';
let PricesService = PricesService_1 = class PricesService {
    priceRepo;
    cache;
    logger = new common_1.Logger(PricesService_1.name);
    constructor(priceRepo, cache) {
        this.priceRepo = priceRepo;
        this.cache = cache;
    }
    async getLatest() {
        const cached = await this.cache.get(CACHE_KEY_LATEST);
        if (cached)
            return cached;
        const prices = await this.priceRepo
            .createQueryBuilder('p')
            .distinctOn(['p.product', 'p.region'])
            .orderBy('p.product')
            .addOrderBy('p.region')
            .addOrderBy('p.priceDate', 'DESC')
            .getMany();
        await this.cache.set(CACHE_KEY_LATEST, prices, CACHE_TTL);
        return prices;
    }
    async getByProduct(product) {
        const cacheKey = `prices:product:${product}`;
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        const prices = await this.priceRepo
            .createQueryBuilder('p')
            .where('p.product = :product', { product })
            .distinctOn(['p.region'])
            .orderBy('p.region')
            .addOrderBy('p.priceDate', 'DESC')
            .getMany();
        await this.cache.set(cacheKey, prices, CACHE_TTL);
        return prices;
    }
    async getByRegion(region) {
        const cacheKey = `prices:region:${region}`;
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        const prices = await this.priceRepo
            .createQueryBuilder('p')
            .where('p.region = :region', { region })
            .distinctOn(['p.product'])
            .orderBy('p.product')
            .addOrderBy('p.priceDate', 'DESC')
            .getMany();
        await this.cache.set(cacheKey, prices, CACHE_TTL);
        return prices;
    }
    async getHistory(query) {
        const where = {};
        if (query.product)
            where.product = query.product;
        if (query.region)
            where.region = query.region;
        if (query.from && query.to) {
            where.priceDate = (0, typeorm_2.Between)(query.from, query.to);
        }
        return this.priceRepo.find({
            where,
            order: { priceDate: 'DESC' },
            take: 500,
        });
    }
    async getBestPrices() {
        const cached = await this.cache.get(CACHE_KEY_BEST);
        if (cached)
            return cached;
        const allLatest = await this.getLatest();
        const best = {};
        for (const price of allLatest) {
            const existing = best[price.product];
            if (!existing || Number(price.priceUsd) < Number(existing.priceUsd)) {
                best[price.product] = price;
            }
        }
        await this.cache.set(CACHE_KEY_BEST, best, CACHE_TTL);
        return best;
    }
    async uploadPrices(dtos, createdBy) {
        const entities = dtos.map((dto) => this.priceRepo.create({ ...dto, createdBy, source: 'manual' }));
        const saved = await this.priceRepo.save(entities);
        await Promise.all([
            this.cache.del(CACHE_KEY_LATEST),
            this.cache.del(CACHE_KEY_BEST),
            ...dtos.map((d) => this.cache.del(`prices:product:${d.product}`)),
            ...dtos.map((d) => this.cache.del(`prices:region:${d.region}`)),
        ]);
        this.logger.log(`Uploaded ${saved.length} prices by admin ${createdBy.id}`);
        return saved;
    }
};
exports.PricesService = PricesService;
exports.PricesService = PricesService = PricesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(fuel_price_entity_1.FuelPrice)),
    __param(1, (0, common_2.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object])
], PricesService);
//# sourceMappingURL=prices.service.js.map
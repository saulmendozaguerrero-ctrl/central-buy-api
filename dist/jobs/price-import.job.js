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
var PriceImportJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceImportJob = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
let PriceImportJob = PriceImportJob_1 = class PriceImportJob {
    configService;
    logger = new common_1.Logger(PriceImportJob_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    async importPlattsData() {
        const plattsApiKey = this.configService.get('PLATTS_API_KEY');
        if (!plattsApiKey) {
            return;
        }
        this.logger.log('Importing prices from Platts API...');
        try {
            this.logger.log('Platts import: not yet implemented');
        }
        catch (err) {
            this.logger.error('Platts import failed', err);
        }
    }
};
exports.PriceImportJob = PriceImportJob;
__decorate([
    (0, schedule_1.Cron)('0 */15 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PriceImportJob.prototype, "importPlattsData", null);
exports.PriceImportJob = PriceImportJob = PriceImportJob_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PriceImportJob);
//# sourceMappingURL=price-import.job.js.map
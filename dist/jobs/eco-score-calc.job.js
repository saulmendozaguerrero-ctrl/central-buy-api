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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var EcoScoreCalcJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcoScoreCalcJob = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dayjs_1 = __importDefault(require("dayjs"));
const org_member_entity_1 = require("../modules/organizations/entities/org-member.entity");
const eco_score_service_1 = require("../modules/fleet/eco-score.service");
let EcoScoreCalcJob = EcoScoreCalcJob_1 = class EcoScoreCalcJob {
    memberRepo;
    ecoScoreService;
    logger = new common_1.Logger(EcoScoreCalcJob_1.name);
    constructor(memberRepo, ecoScoreService) {
        this.memberRepo = memberRepo;
        this.ecoScoreService = ecoScoreService;
    }
    async calculateWeeklyEcoScores() {
        const periodEnd = (0, dayjs_1.default)().startOf('day').toDate();
        const periodStart = (0, dayjs_1.default)().subtract(7, 'days').startOf('day').toDate();
        this.logger.log(`Calculating eco scores for week ending ${(0, dayjs_1.default)(periodEnd).format('YYYY-MM-DD')}`);
        const drivers = await this.memberRepo.find({
            where: { role: 'driver' },
        });
        let calculated = 0;
        for (const driver of drivers) {
            try {
                await this.ecoScoreService.calculateAndSaveForDriver(driver.userId, driver.orgId, periodStart, periodEnd);
                calculated++;
            }
            catch (err) {
                this.logger.error(`Failed to calc eco score for driver ${driver.userId}`, err);
            }
        }
        this.logger.log(`Calculated ${calculated} eco scores`);
    }
};
exports.EcoScoreCalcJob = EcoScoreCalcJob;
__decorate([
    (0, schedule_1.Cron)('0 0 * * 0'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EcoScoreCalcJob.prototype, "calculateWeeklyEcoScores", null);
exports.EcoScoreCalcJob = EcoScoreCalcJob = EcoScoreCalcJob_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(org_member_entity_1.OrgMember)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        eco_score_service_1.EcoScoreService])
], EcoScoreCalcJob);
//# sourceMappingURL=eco-score-calc.job.js.map
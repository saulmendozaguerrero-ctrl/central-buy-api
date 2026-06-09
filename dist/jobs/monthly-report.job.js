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
var MonthlyReportJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonthlyReportJob = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dayjs_1 = __importDefault(require("dayjs"));
const organization_entity_1 = require("../modules/organizations/entities/organization.entity");
const report_entity_1 = require("../modules/fleet/entities/report.entity");
const fuel_log_entity_1 = require("../modules/fleet/entities/fuel-log.entity");
let MonthlyReportJob = MonthlyReportJob_1 = class MonthlyReportJob {
    orgRepo;
    reportRepo;
    fuelLogRepo;
    logger = new common_1.Logger(MonthlyReportJob_1.name);
    constructor(orgRepo, reportRepo, fuelLogRepo) {
        this.orgRepo = orgRepo;
        this.reportRepo = reportRepo;
        this.fuelLogRepo = fuelLogRepo;
    }
    async generateMonthlyReports() {
        const lastMonth = (0, dayjs_1.default)().subtract(1, 'month');
        const periodStart = lastMonth.startOf('month').format('YYYY-MM-DD');
        const periodEnd = lastMonth.endOf('month').format('YYYY-MM-DD');
        this.logger.log(`Generating monthly reports for ${periodStart} → ${periodEnd}`);
        const organizations = await this.orgRepo.find();
        let generated = 0;
        for (const org of organizations) {
            try {
                const existing = await this.reportRepo.findOne({
                    where: { orgId: org.id, type: report_entity_1.ReportType.MONTHLY, periodStart },
                });
                if (existing)
                    continue;
                const report = this.reportRepo.create({
                    orgId: org.id,
                    type: report_entity_1.ReportType.MONTHLY,
                    periodStart,
                    periodEnd,
                });
                await this.reportRepo.save(report);
                generated++;
            }
            catch (err) {
                this.logger.error(`Failed to generate report for org ${org.id}`, err);
            }
        }
        this.logger.log(`Generated ${generated} monthly reports`);
    }
};
exports.MonthlyReportJob = MonthlyReportJob;
__decorate([
    (0, schedule_1.Cron)('0 8 1-7 * 1'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonthlyReportJob.prototype, "generateMonthlyReports", null);
exports.MonthlyReportJob = MonthlyReportJob = MonthlyReportJob_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __param(1, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __param(2, (0, typeorm_1.InjectRepository)(fuel_log_entity_1.FuelLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MonthlyReportJob);
//# sourceMappingURL=monthly-report.job.js.map
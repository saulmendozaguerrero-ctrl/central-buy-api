"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const monthly_report_job_1 = require("./monthly-report.job");
const eco_score_calc_job_1 = require("./eco-score-calc.job");
const price_import_job_1 = require("./price-import.job");
const organization_entity_1 = require("../modules/organizations/entities/organization.entity");
const org_member_entity_1 = require("../modules/organizations/entities/org-member.entity");
const report_entity_1 = require("../modules/fleet/entities/report.entity");
const fuel_log_entity_1 = require("../modules/fleet/entities/fuel-log.entity");
const vehicle_entity_1 = require("../modules/fleet/entities/vehicle.entity");
const eco_score_entity_1 = require("../modules/fleet/entities/eco-score.entity");
const eco_score_service_1 = require("../modules/fleet/eco-score.service");
let JobsModule = class JobsModule {
};
exports.JobsModule = JobsModule;
exports.JobsModule = JobsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                organization_entity_1.Organization,
                org_member_entity_1.OrgMember,
                report_entity_1.Report,
                fuel_log_entity_1.FuelLog,
                vehicle_entity_1.Vehicle,
                eco_score_entity_1.EcoScore,
            ]),
        ],
        providers: [monthly_report_job_1.MonthlyReportJob, eco_score_calc_job_1.EcoScoreCalcJob, price_import_job_1.PriceImportJob, eco_score_service_1.EcoScoreService],
    })
], JobsModule);
//# sourceMappingURL=jobs.module.js.map
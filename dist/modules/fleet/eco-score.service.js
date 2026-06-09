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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcoScoreService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dayjs_1 = __importDefault(require("dayjs"));
const eco_score_entity_1 = require("./entities/eco-score.entity");
const fuel_log_entity_1 = require("./entities/fuel-log.entity");
const vehicle_entity_1 = require("./entities/vehicle.entity");
const OPTIMAL_CONSUMPTION = {
    [vehicle_entity_1.VehicleType.CAR]: 7.0,
    [vehicle_entity_1.VehicleType.VAN]: 9.5,
    [vehicle_entity_1.VehicleType.TRUCK]: 28.0,
    [vehicle_entity_1.VehicleType.BUS]: 35.0,
    [vehicle_entity_1.VehicleType.MACHINERY]: 15.0,
    [vehicle_entity_1.VehicleType.BOAT]: 40.0,
    [vehicle_entity_1.VehicleType.OTHER]: 12.0,
};
const TIPS_BY_DEVIATION = {
    excellent: [
        'Excellent eco-driving! Keep maintaining steady speeds',
        'Consider route optimization to further reduce consumption',
    ],
    good: [
        'Good driving habits. Avoid sudden acceleration to improve further',
        'Check tire pressure monthly for optimal fuel efficiency',
    ],
    average: [
        'Reduce idling time — turn off engine when stopped for more than 1 minute',
        'Maintain a safe following distance to reduce braking and acceleration cycles',
        'Use cruise control on highways when possible',
    ],
    poor: [
        'Anticipate traffic to avoid harsh braking and acceleration',
        'Plan routes to avoid congested areas during peak hours',
        'Check vehicle maintenance: air filter, spark plugs, and tire pressure',
        'Consider driver training for fuel-efficient driving techniques',
    ],
};
let EcoScoreService = class EcoScoreService {
    ecoScoreRepo;
    fuelLogRepo;
    vehicleRepo;
    constructor(ecoScoreRepo, fuelLogRepo, vehicleRepo) {
        this.ecoScoreRepo = ecoScoreRepo;
        this.fuelLogRepo = fuelLogRepo;
        this.vehicleRepo = vehicleRepo;
    }
    calculateScore(actualL100km, vehicleType) {
        const optimal = OPTIMAL_CONSUMPTION[vehicleType] ?? 12;
        const deviation = ((actualL100km - optimal) / optimal) * 100;
        const score = Math.max(0, Math.min(100, Math.round(100 - deviation * 2)));
        return score;
    }
    getTips(score) {
        if (score >= 85)
            return TIPS_BY_DEVIATION.excellent;
        if (score >= 70)
            return TIPS_BY_DEVIATION.good;
        if (score >= 50)
            return TIPS_BY_DEVIATION.average;
        return TIPS_BY_DEVIATION.poor;
    }
    async calculateAndSaveForDriver(driverId, orgId, periodStart, periodEnd) {
        const logs = await this.fuelLogRepo.find({
            where: {
                driverId,
                orgId,
                loggedAt: (0, typeorm_2.Between)(periodStart, periodEnd),
            },
            relations: { vehicle: true },
        });
        if (logs.length === 0) {
            const emptyScore = this.ecoScoreRepo.create({
                driverId,
                orgId,
                periodStart: (0, dayjs_1.default)(periodStart).format('YYYY-MM-DD'),
                periodEnd: (0, dayjs_1.default)(periodEnd).format('YYYY-MM-DD'),
                score: 0,
                totalLiters: 0,
                totalKm: 0,
                tips: ['No fuel logs recorded for this period'],
            });
            return this.ecoScoreRepo.save(emptyScore);
        }
        const totalLiters = logs.reduce((sum, l) => sum + Number(l.liters), 0);
        const odometerLogs = logs.filter((l) => l.odometerKm);
        const totalKm = odometerLogs.length >= 2
            ? Math.max(...odometerLogs.map((l) => l.odometerKm)) -
                Math.min(...odometerLogs.map((l) => l.odometerKm))
            : 0;
        const avgConsumption = totalKm > 0 ? (totalLiters / totalKm) * 100 : 0;
        const vehicleType = logs[0]?.vehicle?.type ?? vehicle_entity_1.VehicleType.OTHER;
        const score = totalKm > 0 ? this.calculateScore(avgConsumption, vehicleType) : 50;
        const tips = this.getTips(score);
        const existing = await this.ecoScoreRepo.findOne({
            where: {
                driverId,
                orgId,
                periodStart: (0, dayjs_1.default)(periodStart).format('YYYY-MM-DD'),
                periodEnd: (0, dayjs_1.default)(periodEnd).format('YYYY-MM-DD'),
            },
        });
        const ecoScore = existing ?? this.ecoScoreRepo.create({ driverId, orgId });
        ecoScore.periodStart = (0, dayjs_1.default)(periodStart).format('YYYY-MM-DD');
        ecoScore.periodEnd = (0, dayjs_1.default)(periodEnd).format('YYYY-MM-DD');
        ecoScore.score = score;
        ecoScore.avgConsumption = Math.round(avgConsumption * 100) / 100;
        ecoScore.totalKm = totalKm;
        ecoScore.totalLiters = Math.round(totalLiters * 100) / 100;
        ecoScore.tips = tips;
        return this.ecoScoreRepo.save(ecoScore);
    }
};
exports.EcoScoreService = EcoScoreService;
exports.EcoScoreService = EcoScoreService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(eco_score_entity_1.EcoScore)),
    __param(1, (0, typeorm_1.InjectRepository)(fuel_log_entity_1.FuelLog)),
    __param(2, (0, typeorm_1.InjectRepository)(vehicle_entity_1.Vehicle)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], EcoScoreService);
//# sourceMappingURL=eco-score.service.js.map
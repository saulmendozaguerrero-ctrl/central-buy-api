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
exports.FleetService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dayjs_1 = __importDefault(require("dayjs"));
const vehicle_entity_1 = require("./entities/vehicle.entity");
const fuel_log_entity_1 = require("./entities/fuel-log.entity");
const eco_score_entity_1 = require("./entities/eco-score.entity");
let FleetService = class FleetService {
    vehicleRepo;
    fuelLogRepo;
    ecoScoreRepo;
    constructor(vehicleRepo, fuelLogRepo, ecoScoreRepo) {
        this.vehicleRepo = vehicleRepo;
        this.fuelLogRepo = fuelLogRepo;
        this.ecoScoreRepo = ecoScoreRepo;
    }
    async getVehicles(orgId) {
        return this.vehicleRepo.find({
            where: { orgId, active: true },
            relations: { assignedDriver: true },
            order: { createdAt: 'DESC' },
        });
    }
    async createVehicle(orgId, dto) {
        const vehicle = this.vehicleRepo.create({ ...dto, orgId });
        return this.vehicleRepo.save(vehicle);
    }
    async updateVehicle(id, orgId, dto) {
        const vehicle = await this.vehicleRepo.findOne({ where: { id, orgId } });
        if (!vehicle)
            throw new common_1.NotFoundException('Vehicle not found');
        Object.assign(vehicle, dto);
        return this.vehicleRepo.save(vehicle);
    }
    async deleteVehicle(id, orgId) {
        const vehicle = await this.vehicleRepo.findOne({ where: { id, orgId } });
        if (!vehicle)
            throw new common_1.NotFoundException('Vehicle not found');
        vehicle.active = false;
        await this.vehicleRepo.save(vehicle);
    }
    async createFuelLog(orgId, driverId, dto) {
        const vehicle = await this.vehicleRepo.findOne({
            where: { id: dto.vehicleId, orgId },
        });
        if (!vehicle)
            throw new common_1.ForbiddenException('Vehicle not found in your organization');
        const log = this.fuelLogRepo.create({
            ...dto,
            orgId,
            driverId,
            loggedAt: new Date(dto.loggedAt),
        });
        return this.fuelLogRepo.save(log);
    }
    async getFuelLogs(orgId, vehicleId, from, to) {
        const where = { orgId };
        if (vehicleId)
            where.vehicleId = vehicleId;
        if (from && to)
            where.loggedAt = (0, typeorm_2.Between)(new Date(from), new Date(to));
        return this.fuelLogRepo.find({
            where,
            relations: { vehicle: true, driver: true },
            order: { loggedAt: 'DESC' },
            take: 200,
        });
    }
    async getDashboard(orgId) {
        const monthStart = (0, dayjs_1.default)().startOf('month').toDate();
        const monthEnd = (0, dayjs_1.default)().endOf('month').toDate();
        const [totalVehicles, monthLogs, recentLogs] = await Promise.all([
            this.vehicleRepo.count({ where: { orgId, active: true } }),
            this.fuelLogRepo.find({
                where: { orgId, loggedAt: (0, typeorm_2.Between)(monthStart, monthEnd) },
            }),
            this.fuelLogRepo.find({
                where: { orgId },
                relations: { vehicle: true, driver: true },
                order: { loggedAt: 'DESC' },
                take: 10,
            }),
        ]);
        const totalSpend = monthLogs.reduce((s, l) => s + Number(l.costEur), 0);
        const totalLiters = monthLogs.reduce((s, l) => s + Number(l.liters), 0);
        const byDriver = {};
        for (const log of monthLogs) {
            byDriver[log.driverId] = (byDriver[log.driverId] ?? 0) + Number(log.costEur);
        }
        const topEntry = Object.entries(byDriver).sort((a, b) => b[1] - a[1])[0];
        return {
            totalVehicles,
            totalSpendThisMonth: Math.round(totalSpend * 100) / 100,
            totalLitersThisMonth: Math.round(totalLiters * 100) / 100,
            avgCostPerLiter: totalLiters > 0 ? Math.round((totalSpend / totalLiters) * 100) / 100 : 0,
            topSpender: topEntry ? { driverId: topEntry[0], totalCost: topEntry[1] } : null,
            recentLogs,
        };
    }
    async getEcoScores(orgId) {
        return this.ecoScoreRepo.find({
            where: { orgId },
            relations: { driver: true },
            order: { createdAt: 'DESC' },
        });
    }
    async getDriverEcoScore(driverId, orgId) {
        return this.ecoScoreRepo.find({
            where: { driverId, orgId },
            order: { periodStart: 'DESC' },
            take: 12,
        });
    }
};
exports.FleetService = FleetService;
exports.FleetService = FleetService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vehicle_entity_1.Vehicle)),
    __param(1, (0, typeorm_1.InjectRepository)(fuel_log_entity_1.FuelLog)),
    __param(2, (0, typeorm_1.InjectRepository)(eco_score_entity_1.EcoScore)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FleetService);
//# sourceMappingURL=fleet.service.js.map
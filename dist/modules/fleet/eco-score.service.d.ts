import { Repository } from 'typeorm';
import { EcoScore } from './entities/eco-score.entity';
import { FuelLog } from './entities/fuel-log.entity';
import { Vehicle, VehicleType } from './entities/vehicle.entity';
export declare class EcoScoreService {
    private readonly ecoScoreRepo;
    private readonly fuelLogRepo;
    private readonly vehicleRepo;
    constructor(ecoScoreRepo: Repository<EcoScore>, fuelLogRepo: Repository<FuelLog>, vehicleRepo: Repository<Vehicle>);
    calculateScore(actualL100km: number, vehicleType: VehicleType): number;
    getTips(score: number): string[];
    calculateAndSaveForDriver(driverId: string, orgId: string, periodStart: Date, periodEnd: Date): Promise<EcoScore>;
}

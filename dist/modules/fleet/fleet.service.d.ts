import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { FuelLog } from './entities/fuel-log.entity';
import { EcoScore } from './entities/eco-score.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CreateFuelLogDto } from './dto/create-fuel-log.dto';
export declare class FleetService {
    private readonly vehicleRepo;
    private readonly fuelLogRepo;
    private readonly ecoScoreRepo;
    constructor(vehicleRepo: Repository<Vehicle>, fuelLogRepo: Repository<FuelLog>, ecoScoreRepo: Repository<EcoScore>);
    getVehicles(orgId: string): Promise<Vehicle[]>;
    createVehicle(orgId: string, dto: CreateVehicleDto): Promise<Vehicle>;
    updateVehicle(id: string, orgId: string, dto: Partial<CreateVehicleDto>): Promise<Vehicle>;
    deleteVehicle(id: string, orgId: string): Promise<void>;
    createFuelLog(orgId: string, driverId: string, dto: CreateFuelLogDto): Promise<FuelLog>;
    getFuelLogs(orgId: string, vehicleId?: string, from?: string, to?: string): Promise<FuelLog[]>;
    getDashboard(orgId: string): Promise<{
        totalVehicles: number;
        totalSpendThisMonth: number;
        totalLitersThisMonth: number;
        avgCostPerLiter: number;
        topSpender: {
            driverId: string;
            totalCost: number;
        } | null;
        recentLogs: FuelLog[];
    }>;
    getEcoScores(orgId: string): Promise<EcoScore[]>;
    getDriverEcoScore(driverId: string, orgId: string): Promise<EcoScore[]>;
}

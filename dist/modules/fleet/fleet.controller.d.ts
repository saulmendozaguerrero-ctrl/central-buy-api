import { FleetService } from './fleet.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CreateFuelLogDto } from './dto/create-fuel-log.dto';
import { User } from '../users/entities/user.entity';
export declare class FleetController {
    private readonly fleetService;
    constructor(fleetService: FleetService);
    getVehicles(user: User): Promise<import("./entities/vehicle.entity").Vehicle[]>;
    createVehicle(dto: CreateVehicleDto, user: User): Promise<import("./entities/vehicle.entity").Vehicle>;
    updateVehicle(id: string, dto: Partial<CreateVehicleDto>, user: User): Promise<import("./entities/vehicle.entity").Vehicle>;
    deleteVehicle(id: string, user: User): Promise<{
        deleted: boolean;
    }>;
    createFuelLog(dto: CreateFuelLogDto, user: User): Promise<import("./entities/fuel-log.entity").FuelLog>;
    getFuelLogs(user: User, vehicleId?: string, from?: string, to?: string): Promise<import("./entities/fuel-log.entity").FuelLog[]>;
    getDashboard(user: User): Promise<{
        totalVehicles: number;
        totalSpendThisMonth: number;
        totalLitersThisMonth: number;
        avgCostPerLiter: number;
        topSpender: {
            driverId: string;
            totalCost: number;
        } | null;
        recentLogs: import("./entities/fuel-log.entity").FuelLog[];
    }>;
    getEcoScores(user: User): Promise<import("./entities/eco-score.entity").EcoScore[]>;
    getDriverScore(driverId: string, user: User): Promise<import("./entities/eco-score.entity").EcoScore[]>;
}

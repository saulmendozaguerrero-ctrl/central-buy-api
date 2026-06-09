import { VehicleType, VehicleFuelType } from '../entities/vehicle.entity';
export declare class CreateVehicleDto {
    plate?: string;
    type: VehicleType;
    brand?: string;
    model?: string;
    fuelType: VehicleFuelType;
    avgConsumption?: number;
    assignedDriverId?: string;
}

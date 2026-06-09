import { Vehicle } from './vehicle.entity';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
export declare class FuelLog {
    id: string;
    vehicle: Vehicle;
    vehicleId: string;
    driver: User;
    driverId: string;
    organization: Organization;
    orgId: string;
    liters: number;
    costEur: number;
    odometerKm: number;
    stationName: string;
    location: string;
    fuelType: string;
    loggedAt: Date;
    createdAt: Date;
}

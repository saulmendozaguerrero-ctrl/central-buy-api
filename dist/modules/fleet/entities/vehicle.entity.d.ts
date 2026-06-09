import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
export declare enum VehicleType {
    CAR = "car",
    VAN = "van",
    TRUCK = "truck",
    BUS = "bus",
    MACHINERY = "machinery",
    BOAT = "boat",
    OTHER = "other"
}
export declare enum VehicleFuelType {
    DIESEL = "diesel",
    GASOLINE = "gasoline",
    LPG = "lpg",
    ELECTRIC = "electric",
    HYBRID = "hybrid"
}
export declare class Vehicle {
    id: string;
    organization: Organization;
    orgId: string;
    plate: string;
    type: VehicleType;
    brand: string;
    model: string;
    fuelType: VehicleFuelType;
    avgConsumption: number;
    assignedDriver: User;
    assignedDriverId: string;
    active: boolean;
    createdAt: Date;
}

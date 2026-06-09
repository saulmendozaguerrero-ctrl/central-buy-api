import { User } from '../../users/entities/user.entity';
export declare enum FuelProduct {
    DIESEL = "diesel",
    GASOLINE = "gasoline",
    FUEL_OIL = "fuel_oil",
    BIODIESEL = "biodiesel",
    JET_FUEL = "jet_fuel",
    CRUDE = "crude"
}
export declare enum FuelRegion {
    EUROPE = "europe",
    LATAM = "latam",
    MIDDLE_EAST = "middle_east",
    ASIA = "asia",
    AFRICA = "africa",
    NORTH_AMERICA = "north_america"
}
export declare class FuelPrice {
    id: string;
    product: FuelProduct;
    region: FuelRegion;
    country: string;
    priceUsd: number;
    priceEur: number;
    unit: string;
    source: string;
    priceDate: string;
    createdAt: Date;
    createdBy: User;
}

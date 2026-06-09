import { FuelProduct, FuelRegion } from '../entities/fuel-price.entity';
export declare class CreatePriceDto {
    product: FuelProduct;
    region: FuelRegion;
    country?: string;
    priceUsd: number;
    priceEur: number;
    unit?: string;
    priceDate: string;
}
